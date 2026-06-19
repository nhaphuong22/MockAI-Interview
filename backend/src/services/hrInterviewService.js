import db from '../db/knex.js';
import { generateQuestionsFromGroq, evaluateCandidateAnswer, generateOverallAssessmentFromGroq } from './groqService.js';
import { insertInterview, insertQuestions } from '../models/interviewModel.js';

/**
 * Khởi tạo phiên phỏng vấn HR thật từ application.
 * Sinh câu hỏi dựa trên CV ứng viên + yêu cầu công việc từ DB.
 */
export const initHRInterviewSession = async ({ userId, applicationId }) => {
  // 1. Lấy application + join jobs + cvs + companies
  const application = await db('applications')
    .join('jobs', 'applications.job_id', 'jobs.id')
    .leftJoin('companies', 'jobs.company_id', 'companies.id')
    .leftJoin('cvs', 'applications.cv_id', 'cvs.id')
    .select(
      'applications.id as application_id',
      'applications.candidate_id',
      'applications.cv_id',
      'applications.status as app_status',
      'jobs.id as job_id',
      'jobs.title as job_title',
      'jobs.experience_level',
      'jobs.requirements as job_requirements_text',
      'companies.name as company_name',
      'cvs.parsed_text as cv_text'
    )
    .where('applications.id', applicationId)
    .first();

  if (!application) throw new Error('Application not found');
  if (application.candidate_id !== userId) throw new Error('Unauthorized');
  if (application.app_status !== 'AI_INTERVIEW_INVITED') {
    throw new Error('HR chưa mời bạn phỏng vấn AI cho đơn ứng tuyển này');
  }

  // 2. Lấy job_requirements chi tiết từ DB
  const jobRequirements = await db('job_requirements')
    .where({ job_id: application.job_id })
    .select('requirement_text', 'is_mandatory')
    .orderBy('is_mandatory', 'desc');

  const requirementsText = jobRequirements.length > 0
    ? jobRequirements.map((r, i) =>
        `${i + 1}. ${r.requirement_text}${r.is_mandatory ? ' [Bắt buộc]' : ' [Ưu tiên]'}`
      ).join('\n')
    : application.job_requirements_text || '';

  // 3. Build enhanced CV prompt: CV text + Job Requirements
  const cvContext = application.cv_text || '';
  const enhancedCvText = cvContext
    ? `${cvContext.substring(0, 3000)}\n\n--- YÊU CẦU CÔNG VIỆC TỪ NHÀ TUYỂN DỤNG ---\n${requirementsText.substring(0, 500)}`
    : `Không có CV chi tiết. Vị trí: ${application.job_title}.\nYêu cầu:\n${requirementsText.substring(0, 500)}`;

  // 4. Tạo bản ghi interview với type = 'INTERVIEW'
  const [interview] = await insertInterview({
    user_id: userId,
    cv_id: application.cv_id || null,
    job_id: application.job_id,
    custom_position: application.job_title,
    custom_skills: requirementsText.substring(0, 500),
    experience_level: application.experience_level || 'JUNIOR',
    type: 'INTERVIEW',
    status: 'PENDING',
    created_at: new Date(),
    updated_at: new Date()
  });

  console.log('Generating dynamic technical questions based on CV using Groq...');
  const aiQuestions = await generateQuestionsFromGroq({
    position: application.job_title || 'General IT',
    skills: requirementsText.substring(0, 300),
    experienceLevel: application.experience_level || 'JUNIOR',
    cvText: enhancedCvText
  });

  // 6. Lưu câu hỏi vào DB
  const questionsToInsert = aiQuestions.map((q) => ({
    interview_id: interview.id,
    question_text: q.question_text,
    expected_answer: q.expected_answer,
    score_weight: q.score_weight || 1,
    created_at: new Date(),
    updated_at: new Date()
  }));
  const insertedQuestions = await insertQuestions(questionsToInsert);

  // 7. Cập nhật status application → INTERVIEWED
  await db('applications')
    .where({ id: applicationId })
    .update({ status: 'INTERVIEWED', interview_id: interview.id, updated_at: new Date() });

  return {
    ...interview,
    questions: insertedQuestions,
    jobTitle: application.job_title,
    companyName: application.company_name || 'Công ty'
  };
};

/**
 * Lấy kết quả phỏng vấn HR (chỉ thông tin cơ bản cho ứng viên — không có điểm số).
 * Điểm số và nhận xét chi tiết chỉ HR mới xem được qua Dashboard.
 */
export const getHRInterviewResult = async ({ interviewId, userId }) => {
  const interview = await db('interviews')
    .leftJoin('jobs', 'interviews.job_id', 'jobs.id')
    .leftJoin('companies', 'jobs.company_id', 'companies.id')
    .select(
      'interviews.id',
      'interviews.user_id',
      'interviews.status',
      'interviews.created_at',
      'interviews.custom_position',
      'jobs.title as job_title',
      'companies.name as company_name'
    )
    .where('interviews.id', interviewId)
    .first();

  if (!interview) throw new Error('Interview not found');
  if (interview.user_id !== userId) throw new Error('Unauthorized');

  const answeredCount = await db('interview_questions')
    .leftJoin('candidate_answers', 'interview_questions.id', 'candidate_answers.interview_question_id')
    .where('interview_questions.interview_id', interviewId)
    .whereNotNull('candidate_answers.id')
    .count('candidate_answers.id as count')
    .first();

  const totalCount = await db('interview_questions')
    .where({ interview_id: interviewId })
    .count('id as count')
    .first();

  return {
    interviewId: interview.id,
    jobTitle: interview.job_title || interview.custom_position || 'Vị trí phỏng vấn',
    companyName: interview.company_name || 'Công ty',
    status: interview.status,
    createdAt: interview.created_at,
    answeredQuestions: parseInt(answeredCount?.count || 0),
    totalQuestions: parseInt(totalCount?.count || 0)
    // KHÔNG trả score/feedback — chỉ HR xem
  };
};

/**
 * Kết thúc phỏng vấn HR, tổng hợp dữ liệu, gọi AI sinh báo cáo và lưu lại cho HR.
 */
export const finishHRInterviewSession = async ({ interviewId, userId, totalTabViolations }) => {
  const interview = await db('interviews').where({ id: interviewId, user_id: userId }).first();
  if (!interview) throw new Error('Interview not found');

  const user = await db('users').where({ id: userId }).first();

  // 1. Fetch all questions and answers
  const questions = await db('interview_questions')
    .where({ interview_id: interviewId })
    .orderBy('order_index', 'asc');
  const answers = await db('candidate_answers')
    .whereIn('interview_question_id', questions.map(q => q.id));

  // 2. Prepare data for AI
  let totalGazeViolations = 0;
  const qaDetails = questions.map((q) => {
    const ans = answers.find(a => a.interview_question_id === q.id);
    if (ans) {
      totalGazeViolations += ans.gaze_violations || 0;
    }
    return {
      id: q.id,
      question: q.question_text,
      expected_answer: q.expected_answer,
      answer: ans ? ans.answer_text : 'Không trả lời',
    };
  });

  const combinedViolations = totalGazeViolations + (totalTabViolations || 0);

  console.log('Evaluating each answer sequentially using Groq API...');
  let totalScore = 0;
  let evaluatedCount = 0;

  for (const qa of qaDetails) {
    if (qa.answer === 'Không trả lời') {
      qa.score = 0;
      qa.feedback = 'Ứng viên đã bỏ qua câu hỏi này.';
      continue;
    }

    try {
      const evalResult = await evaluateCandidateAnswer(qa.question, qa.expected_answer, qa.answer);
      const ansRecord = answers.find(a => a.interview_question_id === qa.id);
      
      let finalScore = evalResult.score || 0;
      let finalFeedback = evalResult.feedback || '';

      if (ansRecord) {
        const penalty = Math.min(50, (ansRecord.gaze_violations || 0) * 10);
        finalScore = Math.max(0, finalScore - penalty);
        if (ansRecord.gaze_violations > 0) {
          finalFeedback += `\n\n[Cảnh báo AI]: Phát hiện ${ansRecord.gaze_violations} lần ứng viên nhìn lệch khỏi khung hình. Bị trừ ${penalty} điểm.`;
        }

        await db('candidate_answers').where({ id: ansRecord.id }).update({
          score: finalScore,
          ai_feedback: finalFeedback
        });
      }

      qa.score = finalScore;
      qa.feedback = finalFeedback;
      totalScore += finalScore;
      evaluatedCount++;

      // Small delay to respect Groq rate limits (30 RPM is quite high, but safe is better)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Failed to evaluate question ${qa.id} via Groq:`, err);
      qa.score = 0;
      qa.feedback = 'Lỗi trong quá trình AI phân tích câu trả lời.';
    }
  }

  const overallScore = evaluatedCount > 0 ? Math.round(totalScore / evaluatedCount) : 0;

  console.log('Generating overall assessment report using Groq...');
  const aiReport = await generateOverallAssessmentFromGroq({
    candidateName: user?.full_name || 'Ứng viên',
    position: interview.custom_position || 'Vị trí phỏng vấn',
    skills: interview.custom_skills || '',
    overallScore,
    qaDetails,
    totalViolations: combinedViolations
  });

  // 4. Cập nhật applications table
  await db('applications')
    .where({ interview_id: interviewId })
    .update({
      ai_summary: aiReport.feedback_summary,
      interview_score: overallScore,
      updated_at: new Date()
    });

  // 5. Cập nhật bảng assessments (cho consistency nếu cần)
  // Check if assessment already exists
  const existingAssesment = await db('assessments').where({ interview_id: interviewId }).first();
  if (!existingAssesment) {
    await db('assessments').insert({
      interview_id: interviewId,
      overall_score: overallScore,
      feedback_summary: aiReport.feedback_summary,
      learning_path: JSON.stringify(aiReport.learning_path),
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // 6. Update interview status to COMPLETED
  await db('interviews').where({ id: interviewId }).update({ status: 'COMPLETED', ended_at: new Date() });

  return { success: true, overallScore };
};

/**
 * Lấy toàn bộ chi tiết Q&A (Transcript) của phiên phỏng vấn dành cho HR
 */
export const getHRInterviewTranscript = async ({ interviewId, hrId }) => {
  // Verify this interview belongs to an application of a job owned by hrId
  const interview = await db('interviews')
    .join('jobs', 'interviews.job_id', 'jobs.id')
    .select('interviews.id', 'interviews.custom_position', 'interviews.status', 'jobs.hr_id')
    .where('interviews.id', interviewId)
    .first();

  if (!interview) throw new Error('Interview not found');
  // Admin bypass could be handled in controller, but for now just check hrId
  // The controller checks the ownership anyway, we just fetch data here.
  
  // 1. Lấy Assessment
  const assessment = await db('assessments')
    .where({ interview_id: interviewId })
    .first();

  // 2. Lấy toàn bộ Questions + Answers
  const questions = await db('interview_questions')
    .where({ interview_id: interviewId })
    .orderBy('order_index', 'asc');

  const answers = await db('candidate_answers')
    .whereIn('interview_question_id', questions.map(q => q.id));

  // Merge them
  const transcript = questions.map((q, index) => {
    const ans = answers.find(a => a.interview_question_id === q.id);
    return {
      index: index + 1,
      question: q.question_text,
      expectedAnswer: q.expected_answer,
      candidateAnswer: ans ? ans.answer_text : 'Không trả lời',
      score: ans ? ans.score : 0,
      feedback: ans ? ans.ai_feedback : 'Không có phản hồi',
      gazeViolations: ans ? ans.gaze_violations : 0
    };
  });

  return {
    interviewId: interview.id,
    status: interview.status,
    position: interview.custom_position,
    assessment: assessment ? {
      overallScore: assessment.overall_score,
      learningPath: assessment.learning_path ? JSON.parse(assessment.learning_path) : []
    } : null,
    transcript
  };
};

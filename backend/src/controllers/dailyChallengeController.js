import fs from 'fs';
import db from '../db/knex.js';
import { transcribeAudio } from '../services/sttService.js';
import { evaluateCandidateAnswer } from '../services/groqService.js';
import { getTodayDateStrVN } from '../services/dailySchedulerService.js';

/**
 * GET /api/daily-challenge/streak
 * Fetch candidate's current daily streak and ranking
 */
export const getStreakStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user's streak details
    const streak = await db('daily_streaks').where({ user_id: userId }).first();

    let has_answered_today = false;
    if (streak && streak.last_answered_at) {
      const getLocalDateStr = (date) => getTodayDateStrVN(date);
      const todayStr = getLocalDateStr(new Date());
      const lastAnsweredStr = getLocalDateStr(streak.last_answered_at);
      has_answered_today = (todayStr === lastAnsweredStr);
    }

    // 2. Calculate global leaderboard ranking based on sum of scores
    const rankQuery = await db('leaderboard_scores')
      .select('user_id')
      .sum('score as total_score')
      .groupBy('user_id')
      .orderBy('total_score', 'desc');

    const userIndex = rankQuery.findIndex((item) => Number(item.user_id) === Number(userId));
    const rank = userIndex !== -1 ? userIndex + 1 : rankQuery.length + 1;

    return res.json({
      streak_count: streak ? streak.streak_count : 0,
      last_answered_at: streak ? streak.last_answered_at : null,
      has_answered_today,
      rank
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin streak:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin streak' });
  }
};

/**
 * GET /api/daily-challenge/question
 * Fetch daily question by track
 */
export const getDailyQuestion = async (req, res) => {
  try {
    const track = req.query.track || 'frontend';
    const todayStr = getTodayDateStrVN();

    const questions = await db('daily_questions')
      .where({ track })
      .orderBy('created_at', 'desc');

    const question = questions.find((q) => getTodayDateStrVN(q.created_at) === todayStr)
      || questions[0];

    if (!question) {
      return res.status(404).json({
        message: `Không tìm thấy câu hỏi thử thách cho chuyên ngành: ${track}`
      });
    }

    return res.json({
      id: question.id,
      track: question.track,
      question_text: question.question_text,
      sample_answer: question.sample_answer
    });
  } catch (error) {
    console.error('Lỗi khi lấy câu hỏi hàng ngày:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy câu hỏi hàng ngày' });
  }
};

/**
 * POST /api/daily-challenge/submit
 * Process candidate recording file, transcribe, evaluate, and update streak/ranking
 */
export const submitDailyAnswer = async (req, res) => {
  const file = req.file;
  try {
    const userId = req.user.id;
    const { questionId } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file ghi âm câu trả lời' });
    }

    if (!questionId) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ message: 'Thiếu thông tin questionId' });
    }

    // 1. Verify that candidate has not already submitted an answer for this question
    const existingScore = await db('leaderboard_scores')
      .where({ user_id: userId, question_id: questionId })
      .first();

    if (existingScore) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ message: 'Bạn đã hoàn thành thử thách phỏng vấn này rồi!' });
    }

    // 2. Retrieve question details
    const question = await db('daily_questions').where({ id: questionId }).first();
    if (!question) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ message: 'Câu hỏi thử thách không tồn tại!' });
    }

    // 3. Transcribe audio to text using sttService (Whisper)
    console.log(`[Daily Submit] Đang xử lý file âm thanh: ${file.path}`);
    let transcribedText = '';
    try {
      transcribedText = await transcribeAudio(file.path);
    } catch (sttError) {
      console.error('[Daily Submit] STT Transcription failed:', sttError);
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: sttError.message || 'Không thể nhận diện giọng nói thành văn bản'
      });
    }

    // 4. Grade the answer using Groq Service
    let score = 0;
    let feedback = '';
    try {
      const evaluation = await evaluateCandidateAnswer(
        question.question_text,
        question.sample_answer,
        transcribedText
      );
      score = Math.min(100, Math.max(0, Number(evaluation.score) || 0));
      feedback = evaluation.feedback || 'Không có phản hồi nhận xét.';
    } catch (evalError) {
      console.error('[Daily Submit] AI Evaluation failed:', evalError);
      // Fallback
      score = 70;
      feedback = `Đã nhận được câu trả lời. Hệ thống chấm điểm dự phòng: "${transcribedText}"`;
    }

    // 5. Insert score into leaderboard_scores
    await db('leaderboard_scores').insert({
      user_id: userId,
      question_id: questionId,
      score: score,
      answered_at: db.fn.now()
    });

    // 6. Update streak count
    const now = new Date();
    const getLocalDateStr = (date) => new Date(date).toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
    const todayStr = getLocalDateStr(now);

    const existingStreak = await db('daily_streaks').where({ user_id: userId }).first();
    let newStreakCount = 1;

    if (!existingStreak) {
      // First time streak setup
      await db('daily_streaks').insert({
        user_id: userId,
        streak_count: 1,
        last_answered_at: now,
        created_at: now,
        updated_at: now
      });
    } else {
      const lastAnsweredStr = getLocalDateStr(existingStreak.last_answered_at);

      if (lastAnsweredStr !== todayStr) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateStr(yesterday);

        if (lastAnsweredStr === yesterdayStr) {
          newStreakCount = existingStreak.streak_count + 1;
        } else {
          newStreakCount = 1; // streak broken, reset to 1
        }

        await db('daily_streaks')
          .where({ user_id: userId })
          .update({
            streak_count: newStreakCount,
            last_answered_at: now,
            updated_at: now
          });
      } else {
        newStreakCount = existingStreak.streak_count; // maintained if already answered today
      }
    }

    // 7. Clean up temporary audio file from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.json({
      score,
      feedback,
      sample_answer: question.sample_answer,
      streak_count: newStreakCount
    });
  } catch (error) {
    console.error('Lỗi nộp bài thử thách hàng ngày:', error);
    // Cleanup file in case of general exception
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ message: 'Lỗi máy chủ khi nộp bài và chấm điểm' });
  }
};

/**
 * GET /api/daily-challenge/leaderboard
 * Fetch top 50 candidates sorted by total daily challenge score and streak count
 */
export const getLeaderboard = async (req, res) => {
  try {
    const rawLeaderboard = await db('leaderboard_scores')
      .join('users', 'leaderboard_scores.user_id', 'users.id')
      .leftJoin('daily_streaks', 'users.id', 'daily_streaks.user_id')
      .select(
        'users.id as userId',
        'users.full_name as name',
        'users.avatar_url as avatar',
        db.raw('COALESCE(daily_streaks.streak_count, 0) as streak')
      )
      .sum('leaderboard_scores.score as totalScore')
      .groupBy('users.id', 'users.full_name', 'users.avatar_url', 'daily_streaks.streak_count')
      .orderBy('totalScore', 'desc')
      .orderBy('streak', 'desc')
      .limit(50);

    const leaderboard = rawLeaderboard.map((item, idx) => ({
      rank: idx + 1,
      userId: item.userId,
      name: item.name,
      avatar: item.avatar,
      totalScore: Number(item.totalScore) || 0,
      streak: Number(item.streak) || 0
    }));

    return res.json(leaderboard);
  } catch (error) {
    console.error('Lỗi khi lấy bảng xếp hạng:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy bảng xếp hạng' });
  }
};

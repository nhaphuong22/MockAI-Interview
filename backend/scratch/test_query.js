import db from '../src/db/knex.js';

async function testAll() {
  try {
    const hrs = await db('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .join('roles', 'user_roles.role_id', 'roles.id')
      .select('users.id', 'users.email')
      .where('roles.name', 'HR');
    
    console.log(`Found ${hrs.length} HRs.`);

    for (const hr of hrs) {
      console.log(`\n--- Testing for HR ID ${hr.id} (${hr.email}) ---`);
      
      const query = db('applications')
        .select(
          'applications.*',
          db.raw('COALESCE(applications.candidate_name, users.full_name) as candidate_name'),
          db.raw('COALESCE(applications.candidate_email, users.email) as candidate_email'),
          db.raw('COALESCE(applications.candidate_phone, candidate_profiles.phone) as candidate_phone'),
          'users.avatar_url as candidate_avatar',
          'jobs.title as job_title',
          'cvs.file_url as cv_file_url',
          'cvs.ai_feedback as cv_ai_feedback',
          'cvs.parsed_text as cv_text'
        )
        .join('users', 'applications.candidate_id', 'users.id')
        .leftJoin('candidate_profiles', 'users.id', 'candidate_profiles.user_id')
        .join('jobs', 'applications.job_id', 'jobs.id')
        .leftJoin('cvs', 'applications.cv_id', 'cvs.id')
        .where('jobs.hr_id', hr.id);

      const applications = await query.orderBy('applications.created_at', 'desc');
      console.log(`Query returned ${applications.length} applications.`);

      // Format applications just like the controller
      const formattedApplications = applications.map(app => {
        let aiFeedback = null;
        if (app.cv_ai_feedback) {
          try {
            aiFeedback = typeof app.cv_ai_feedback === 'string' ? JSON.parse(app.cv_ai_feedback) : app.cv_ai_feedback;
          } catch (e) {
            console.error("Lỗi parse cv_ai_feedback for app id:", app.id, e);
          }
        }
        return {
          ...app,
          aiFeedback
        };
      });
      console.log(`Formatting check passed for HR ID ${hr.id}.`);
    }
  } catch (error) {
    console.error("GLOBAL ERROR DURING QUERY:", error);
  } finally {
    await db.destroy();
  }
}

testAll();

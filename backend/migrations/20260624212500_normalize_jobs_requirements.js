/**
 * Migration to normalize jobs table (3NF).
 * Move requirements from jobs to job_requirements table.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Data Migration: Move text requirements to job_requirements if none exist
  const jobsWithReqs = await knex('jobs').select('id', 'requirements').whereNotNull('requirements');
  
  for (const job of jobsWithReqs) {
    if (job.requirements && job.requirements.trim() !== '') {
      const existingReqs = await knex('job_requirements').where('job_id', job.id).first();
      
      if (!existingReqs) {
        await knex('job_requirements').insert({
          job_id: job.id,
          requirement_text: job.requirements,
          is_mandatory: true,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
  }

  // 2. Drop redundant column
  await knex.schema.alterTable('jobs', (table) => {
    table.dropColumn('requirements');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // 1. Restore column
  await knex.schema.alterTable('jobs', (table) => {
    table.text('requirements').nullable();
  });
  
  // 2. Restore data from job_requirements
  const reqs = await knex('job_requirements').select('job_id', 'requirement_text');
  
  const groupedReqs = {};
  for (const r of reqs) {
    if (!groupedReqs[r.job_id]) groupedReqs[r.job_id] = [];
    groupedReqs[r.job_id].push(r.requirement_text);
  }
  
  for (const [jobId, texts] of Object.entries(groupedReqs)) {
    await knex('jobs').where('id', jobId).update({
      requirements: texts.join('\n')
    });
  }
}

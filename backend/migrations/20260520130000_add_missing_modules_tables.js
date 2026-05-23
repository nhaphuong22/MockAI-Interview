/**
 * Migration: Add missing tables for all modules & transition users to RBAC schema.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // ==========================================
  // 1. MODULE 5 (ADMIN) - RBAC TABLES
  // ==========================================
  
  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description');
    table.timestamps(true, true);
  });

  // Create permissions table
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description');
    table.timestamps(true, true);
  });

  // Create role_permissions table
  await knex.schema.createTable('role_permissions', (table) => {
    table.increments('id').primary();
    table.integer('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('CASCADE');
    table.integer('permission_id').unsigned().notNullable()
      .references('id').inTable('permissions').onDelete('CASCADE');
    table.unique(['role_id', 'permission_id']);
    table.timestamps(true, true);
  });

  // Create user_roles table
  await knex.schema.createTable('user_roles', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('role_id').unsigned().notNullable()
      .references('id').inTable('roles').onDelete('CASCADE');
    table.unique(['user_id', 'role_id']);
    table.timestamps(true, true);
  });

  // ==========================================
  // 2. DATA MIGRATION: Migrating user roles to user_roles table
  // ==========================================
  
  // Insert default roles
  const defaultRoles = [
    { name: 'ADMIN', description: 'System Administrator' },
    { name: 'USER', description: 'Candidate / Standard User' },
    { name: 'HR', description: 'Human Resources Recruiter' }
  ];
  await knex('roles').insert(defaultRoles);

  // Retrieve current roles mapping to match ids
  const dbRoles = await knex('roles').select('id', 'name');
  const roleMap = dbRoles.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  // Query all existing users and their string roles
  const users = await knex('users').select('id', 'role');
  
  // Insert relationships to user_roles
  const userRolesToInsert = users.map(user => {
    // Map string role to role ID, default to USER role
    const roleId = roleMap[user.role.toUpperCase()] || roleMap['USER'];
    return {
      user_id: user.id,
      role_id: roleId,
      created_at: new Date(),
      updated_at: new Date()
    };
  });

  if (userRolesToInsert.length > 0) {
    await knex('user_roles').insert(userRolesToInsert);
  }

  // Remove the string role column from users table
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role');
  });

  // ==========================================
  // 3. MODULE 1 (AI KNOWLEDGE) - INTERVIEW DETAIL TABLES
  // ==========================================

  // Create interview_questions table
  await knex.schema.createTable('interview_questions', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().notNullable()
      .references('id').inTable('interviews').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.text('expected_answer');
    table.integer('score_weight').defaultTo(1);
    table.timestamps(true, true);
  });

  // Create candidate_answers table
  await knex.schema.createTable('candidate_answers', (table) => {
    table.increments('id').primary();
    table.integer('interview_question_id').unsigned().notNullable()
      .references('id').inTable('interview_questions').onDelete('CASCADE');
    table.text('answer_text').notNullable();
    table.string('audio_url');
    table.text('ai_feedback');
    table.integer('score');
    table.timestamps(true, true);
  });

  // ==========================================
  // 4. MODULE 2 (AI VOICE) - VOICE SESSION TABLE
  // ==========================================

  // Create voice_sessions table
  await knex.schema.createTable('voice_sessions', (table) => {
    table.increments('id').primary();
    table.integer('interview_id').unsigned().notNullable()
      .references('id').inTable('interviews').onDelete('CASCADE');
    table.string('status').defaultTo('CONNECTED'); // CONNECTED, DISCONNECTED, ERROR
    table.integer('duration_seconds').defaultTo(0);
    table.string('recording_url');
    table.timestamps(true, true);
  });

  // ==========================================
  // 5. MODULE 3 (HR) - JOB REQUIREMENTS TABLE
  // ==========================================

  // Create job_requirements table
  await knex.schema.createTable('job_requirements', (table) => {
    table.increments('id').primary();
    table.integer('job_id').unsigned().notNullable()
      .references('id').inTable('jobs').onDelete('CASCADE');
    table.text('requirement_text').notNullable();
    table.boolean('is_mandatory').defaultTo(true);
    table.timestamps(true, true);
  });

  // ==========================================
  // 6. MODULE 4 (CV REVIEW) - CV SKILLS & EVALUATIONS TABLES
  // ==========================================

  // Create cv_skills table
  await knex.schema.createTable('cv_skills', (table) => {
    table.increments('id').primary();
    table.integer('cv_id').unsigned().notNullable()
      .references('id').inTable('cvs').onDelete('CASCADE');
    table.string('skill_name').notNullable();
    table.integer('experience_years');
    table.timestamps(true, true);
  });

  // Create cv_evaluations table
  await knex.schema.createTable('cv_evaluations', (table) => {
    table.increments('id').primary();
    table.integer('cv_id').unsigned().notNullable()
      .references('id').inTable('cvs').onDelete('CASCADE');
    table.string('criterion_name').notNullable(); // Education, Work Experience, Tech Skills, Soft Skills
    table.integer('score').notNullable();
    table.text('feedback');
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Drop tables in reverse order to handle dependencies properly
  await knex.schema.dropTableIfExists('cv_evaluations');
  await knex.schema.dropTableIfExists('cv_skills');
  await knex.schema.dropTableIfExists('job_requirements');
  await knex.schema.dropTableIfExists('voice_sessions');
  await knex.schema.dropTableIfExists('candidate_answers');
  await knex.schema.dropTableIfExists('interview_questions');

  // Re-add role column to users table
  await knex.schema.alterTable('users', (table) => {
    table.string('role').notNullable().defaultTo('USER');
  });

  // Get current user-role mappings to restore users.role
  const userRoles = await knex('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .select('user_roles.user_id', 'roles.name');

  for (const ur of userRoles) {
    await knex('users')
      .where('id', ur.user_id)
      .update({ role: ur.name });
  }

  // Drop RBAC tables
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}

/**
 * Seed: RBAC Permissions Setup
 * Populates system permissions and maps them to default roles (ADMIN, USER, HR).
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // 1. Clean existing role_permissions and permissions to avoid duplicates
  await knex('role_permissions').del();
  await knex('permissions').del();

  // 2. Define permissions list
  const permissionsList = [
    // Candidate permissions
    { name: 'cv:upload', description: 'Upload and parse CV' },
    { name: 'cv:view_feedback', description: 'View AI CV feedback and scoring' },
    { name: 'interview:practice', description: 'Practice AI Knowledge & Voice interviews' },
    { name: 'job:view', description: 'Search and view active job listings' },
    { name: 'job:apply', description: 'Apply to jobs with a CV' },
    { name: 'message:send', description: 'Send chat messages in application threads' },

    // Recruiter (HR) permissions
    { name: 'job:create', description: 'Create and post new job listings' },
    { name: 'job:edit', description: 'Edit self-owned job listings' },
    { name: 'job:delete', description: 'Delete self-owned job listings' },
    { name: 'application:view_all', description: 'View list of applications for self-owned jobs' },
    { name: 'application:update_status', description: 'Update status of applications (Shortlisted, Rejected, etc.)' },
    { name: 'candidate:evaluate', description: 'View AI interview and CV reports of candidates' },

    // Administrator permissions
    { name: 'user:manage', description: 'CRUD all users in the system' },
    { name: 'job:manage_all', description: 'Moderate, approve or block any job posting' },
    { name: 'analytics:view', description: 'View global analytics and statistics charts' },
    { name: 'system:settings', description: 'Modify application settings and AI model configurations' }
  ];

  // Insert permissions and get auto-incremented IDs
  await knex('permissions').insert(permissionsList);

  // 3. Retrieve roles and permissions from database to map IDs correctly
  const dbRoles = await knex('roles').select('id', 'name');
  const dbPermissions = await knex('permissions').select('id', 'name');

  const roleMap = dbRoles.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  const permMap = dbPermissions.reduce((acc, curr) => {
    acc[curr.name] = curr.id;
    return acc;
  }, {});

  // 4. Map permissions to roles
  const rolePermissionsToInsert = [];

  // ==========================================
  // A. USER ROLE (Candidate)
  // ==========================================
  const userPerms = [
    'cv:upload',
    'cv:view_feedback',
    'interview:practice',
    'job:view',
    'job:apply',
    'message:send'
  ];
  userPerms.forEach(permName => {
    if (permMap[permName] && roleMap['USER']) {
      rolePermissionsToInsert.push({
        role_id: roleMap['USER'],
        permission_id: permMap[permName],
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  });

  // ==========================================
  // B. HR ROLE (Recruiter)
  // ==========================================
  const hrPerms = [
    'job:view',
    'job:create',
    'job:edit',
    'job:delete',
    'application:view_all',
    'application:update_status',
    'candidate:evaluate',
    'message:send'
  ];
  hrPerms.forEach(permName => {
    if (permMap[permName] && roleMap['HR']) {
      rolePermissionsToInsert.push({
        role_id: roleMap['HR'],
        permission_id: permMap[permName],
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  });

  // ==========================================
  // C. ADMIN ROLE (Administrator gets ALL)
  // ==========================================
  dbPermissions.forEach(perm => {
    if (roleMap['ADMIN']) {
      rolePermissionsToInsert.push({
        role_id: roleMap['ADMIN'],
        permission_id: perm.id,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  });

  // 5. Insert mappings into role_permissions table
  if (rolePermissionsToInsert.length > 0) {
    await knex('role_permissions').insert(rolePermissionsToInsert);
  }
}

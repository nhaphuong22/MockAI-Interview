/**
 * Seed: Sample User Skill Trees
 * Populates mock skill tree graph JSON data for testing the Interactive RPG Skill Tree.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // 1. Clear existing skill tree records to start fresh
  await knex('user_skill_trees').del();

  // 2. Prepare sample skill tree for User 2 (Candidate - Frontend Track)
  const frontendSkillTree = {
    track: 'Frontend Developer',
    nodes: [
      { id: 'html5', label: 'HTML5', score: 90, status: 'unlocked', category: 'Frontend', x: 100, y: 100 },
      { id: 'css3', label: 'CSS3', score: 85, status: 'unlocked', category: 'Frontend', x: 200, y: 50 },
      { id: 'javascript', label: 'JavaScript ES6+', score: 80, status: 'unlocked', category: 'Frontend', x: 200, y: 150 },
      { id: 'tailwindcss', label: 'Tailwind CSS', score: 75, status: 'unlocked', category: 'Frontend', x: 350, y: 20 },
      { id: 'typescript', label: 'TypeScript', score: 0, status: 'locked', category: 'Frontend', x: 350, y: 100 },
      { id: 'reactjs', label: 'ReactJS', score: 78, status: 'unlocked', category: 'Frontend', x: 350, y: 200 },
      { id: 'zustand', label: 'Zustand State', score: 70, status: 'unlocked', category: 'Frontend', x: 500, y: 150 },
      { id: 'nextjs', label: 'Next.js', score: 0, status: 'locked', category: 'Frontend', x: 500, y: 250 },
      { id: 'api_integration', label: 'API Integration (Axios/REST)', score: 72, status: 'unlocked', category: 'Frontend', x: 500, y: 350 },
      { id: 'testing', label: 'Testing (Jest/RTL)', score: 0, status: 'locked', category: 'Frontend', x: 650, y: 200 }
    ],
    links: [
      { source: 'html5', target: 'css3' },
      { source: 'html5', target: 'javascript' },
      { source: 'css3', target: 'tailwindcss' },
      { source: 'javascript', target: 'typescript' },
      { source: 'javascript', target: 'reactjs' },
      { source: 'reactjs', target: 'zustand' },
      { source: 'reactjs', target: 'nextjs' },
      { source: 'reactjs', target: 'api_integration' },
      { source: 'reactjs', target: 'testing' },
      { source: 'javascript', target: 'api_integration' }
    ]
  };

  // 3. Prepare sample skill tree for User 3 (HR account, but useful for testing Backend Track)
  const backendSkillTree = {
    track: 'Backend Developer',
    nodes: [
      { id: 'nodejs', label: 'Node.js', score: 85, status: 'unlocked', category: 'Backend', x: 100, y: 100 },
      { id: 'express', label: 'Express.js', score: 80, status: 'unlocked', category: 'Backend', x: 250, y: 50 },
      { id: 'sql', label: 'SQL & Databases', score: 75, status: 'unlocked', category: 'Backend', x: 250, y: 150 },
      { id: 'postgresql', label: 'PostgreSQL', score: 78, status: 'unlocked', category: 'Backend', x: 400, y: 100 },
      { id: 'knex', label: 'Knex.js Query Builder', score: 70, status: 'unlocked', category: 'Backend', x: 550, y: 100 },
      { id: 'rest_api', label: 'RESTful API Design', score: 82, status: 'unlocked', category: 'Backend', x: 400, y: 20 },
      { id: 'jwt_auth', label: 'Authentication (JWT/Bcrypt)', score: 72, status: 'unlocked', category: 'Backend', x: 550, y: 20 },
      { id: 'redis', label: 'Redis Caching', score: 0, status: 'locked', category: 'Backend', x: 400, y: 200 },
      { id: 'socket_io', label: 'Socket.io Realtime', score: 0, status: 'locked', category: 'Backend', x: 400, y: 300 },
      { id: 'docker', label: 'Docker Containers', score: 0, status: 'locked', category: 'Backend', x: 550, y: 200 }
    ],
    links: [
      { source: 'nodejs', target: 'express' },
      { source: 'nodejs', target: 'sql' },
      { source: 'sql', target: 'postgresql' },
      { source: 'postgresql', target: 'knex' },
      { source: 'express', target: 'rest_api' },
      { source: 'express', target: 'jwt_auth' },
      { source: 'nodejs', target: 'redis' },
      { source: 'express', target: 'socket_io' },
      { source: 'nodejs', target: 'docker' },
      { source: 'postgresql', target: 'redis' }
    ]
  };

  // 4. Insert records
  await knex('user_skill_trees').insert([
    {
      user_id: 2, // Candidate / Standard User
      graph_data: JSON.stringify(frontendSkillTree),
      last_updated: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: 3, // HR User (used for testing backend track)
      graph_data: JSON.stringify(backendSkillTree),
      last_updated: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
}

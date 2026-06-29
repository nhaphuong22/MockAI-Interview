import db from '../db/knex.js';
import { emitSkillTreeUpdate } from '../socket.js';

// Default Frontend Skill Tree Structure (matches seed data)
const defaultFrontendTree = {
  track: 'Frontend Developer',
  nodes: [
    { id: 'html5', label: 'HTML5', score: 0, status: 'locked', category: 'Frontend', x: 100, y: 100 },
    { id: 'css3', label: 'CSS3', score: 0, status: 'locked', category: 'Frontend', x: 200, y: 50 },
    { id: 'javascript', label: 'JavaScript ES6+', score: 0, status: 'locked', category: 'Frontend', x: 200, y: 150 },
    { id: 'tailwindcss', label: 'Tailwind CSS', score: 0, status: 'locked', category: 'Frontend', x: 350, y: 20 },
    { id: 'typescript', label: 'TypeScript', score: 0, status: 'locked', category: 'Frontend', x: 350, y: 100 },
    { id: 'reactjs', label: 'ReactJS', score: 0, status: 'locked', category: 'Frontend', x: 350, y: 200 },
    { id: 'zustand', label: 'Zustand State', score: 0, status: 'locked', category: 'Frontend', x: 500, y: 150 },
    { id: 'nextjs', label: 'Next.js', score: 0, status: 'locked', category: 'Frontend', x: 500, y: 250 },
    { id: 'api_integration', label: 'API Integration (Axios/REST)', score: 0, status: 'locked', category: 'Frontend', x: 500, y: 350 },
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

// Default Backend Skill Tree Structure (matches seed data)
const defaultBackendTree = {
  track: 'Backend Developer',
  nodes: [
    { id: 'nodejs', label: 'Node.js', score: 0, status: 'locked', category: 'Backend', x: 100, y: 100 },
    { id: 'express', label: 'Express.js', score: 0, status: 'locked', category: 'Backend', x: 250, y: 50 },
    { id: 'sql', label: 'SQL & Databases', score: 0, status: 'locked', category: 'Backend', x: 250, y: 150 },
    { id: 'postgresql', label: 'PostgreSQL', score: 0, status: 'locked', category: 'Backend', x: 400, y: 100 },
    { id: 'knex', label: 'Knex.js Query Builder', score: 0, status: 'locked', category: 'Backend', x: 550, y: 100 },
    { id: 'rest_api', label: 'RESTful API Design', score: 0, status: 'locked', category: 'Backend', x: 400, y: 20 },
    { id: 'jwt_auth', label: 'Authentication (JWT/Bcrypt)', score: 0, status: 'locked', category: 'Backend', x: 550, y: 20 },
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

/**
 * Initializes a user's skill tree based on matched skills from CV evaluation.
 * Does not overwrite if the user already has a skill tree.
 *
 * @param {number} userId - The candidate ID.
 * @param {Array<string>} matchedSkills - Skills matched by the AI screening.
 * @param {string} jobTitle - The job title applied to, used to determine track.
 * @param {number} atsScore - The semantic score of the CV, used as initial node scores.
 * @returns {Promise<object>} The created or existing user skill tree database record.
 */
export const initializeSkillTreeFromCV = async (userId, customSkillTree = null, matchedSkills = [], jobTitle = '', atsScore = 60) => {
  // 1. Check if user already has a skill tree
  const existingTree = await db('user_skill_trees').where({ user_id: userId }).first();
  if (existingTree) {
    console.log(`[SkillTree] User ${userId} đã có skill tree. Bỏ qua khởi tạo.`);
    return existingTree;
  }

  let skillTree = null;
  let track = '';

  if (customSkillTree && Array.isArray(customSkillTree.nodes)) {
    skillTree = customSkillTree;
    track = customSkillTree.track || 'Custom Track';
  } else {
    // 2. Determine track based on job title keywords (fallback)
    track = 'Frontend Developer';
    skillTree = JSON.parse(JSON.stringify(defaultFrontendTree));

    const titleLower = (jobTitle || '').toLowerCase();
    if (
      titleLower.includes('backend') ||
      titleLower.includes('node') ||
      titleLower.includes('java') ||
      titleLower.includes('python') ||
      titleLower.includes('golang') ||
      titleLower.includes('c#') ||
      titleLower.includes('php') ||
      titleLower.includes('ruby') ||
      titleLower.includes('devops')
    ) {
      track = 'Backend Developer';
      skillTree = JSON.parse(JSON.stringify(defaultBackendTree));
    }

    // 3. Normalize matched skills from AI for robust matching
    const normalizedMatched = (matchedSkills || []).map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // 4. Update node status and scores based on matched skills
    skillTree.nodes = skillTree.nodes.map(node => {
      const nodeIdClean = node.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nodeLabelClean = node.label.toLowerCase().replace(/[^a-z0-9]/g, '');

      const isMatched = normalizedMatched.some(skill => 
        skill.includes(nodeIdClean) || 
        nodeIdClean.includes(skill) || 
        skill.includes(nodeLabelClean) || 
        nodeLabelClean.includes(skill)
      );

      if (isMatched) {
        return {
          ...node,
          status: 'unlocked',
          score: 0
        };
      }
      return node;
    });
  }

  // 5. Save to database
  const [newRecord] = await db('user_skill_trees')
    .insert({
      user_id: userId,
      graph_data: JSON.stringify(skillTree),
      last_updated: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning('*');

  console.log(`[SkillTree] Khởi tạo skill tree cho User ${userId} (${track}) thành công!`);
  return newRecord;
};

/**
 * Updates a user's skill tree graph upon completing an AI interview.
 * Increments score of tested skills, unlocks adjacent nodes if parent score >= 70,
 * and pushes the updated tree to the client via Socket.io.
 *
 * @param {number} userId - ID of the candidate.
 * @param {string} customSkillsStr - Comma-separated list of tested skills.
 * @param {number} overallScore - The score achieved in the interview.
 * @returns {Promise<object|null>} The updated user skill tree database record.
 */
export const updateSkillTreeOnInterviewComplete = async (userId, customSkillsStr, overallScore) => {
  console.log(`[SkillTree] Đang tiến hành cập nhật cây kỹ năng cho User ${userId} sau buổi phỏng vấn...`);
  
  // 1. Parse tested skills
  const testedSkills = (customSkillsStr || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (testedSkills.length === 0) {
    console.log('[SkillTree] Không tìm thấy kỹ năng nào được kiểm tra. Bỏ qua cập nhật.');
    return null;
  }

  // 2. Fetch user's skill tree
  let record = await db('user_skill_trees').where({ user_id: userId }).first();
  
  if (!record) {
    // Fallback: Initialize with default tree if not exists
    console.log(`[SkillTree] User ${userId} chưa có skill tree. Khởi tạo mặc định trước.`);
    record = await initializeSkillTreeFromCV(userId, testedSkills, 'Developer', overallScore);
    
    // Push update event immediately
    const parsedGraph = typeof record.graph_data === 'string' ? JSON.parse(record.graph_data) : record.graph_data;
    const payload = { ...record, graph_data: parsedGraph };
    emitSkillTreeUpdate(userId, payload);
    return record;
  }

  // 3. Parse graph data
  const skillTree = typeof record.graph_data === 'string'
    ? JSON.parse(record.graph_data)
    : record.graph_data;

  const normalizedTested = testedSkills.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
  let updatedAny = false;

  // 4. Update tested nodes
  skillTree.nodes = skillTree.nodes.map(node => {
    const nodeIdClean = node.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nodeLabelClean = node.label.toLowerCase().replace(/[^a-z0-9]/g, '');

    const isTested = normalizedTested.some(skill => 
      skill.includes(nodeIdClean) || 
      nodeIdClean.includes(skill) || 
      skill.includes(nodeLabelClean) || 
      nodeLabelClean.includes(skill)
    );

    if (isTested) {
      updatedAny = true;
      return {
        ...node,
        status: 'unlocked',
        score: Math.max(node.score || 0, overallScore)
      };
    }
    return node;
  });

  if (!updatedAny) {
    console.log('[SkillTree] Không khớp kỹ năng nào trong cây với danh sách phỏng vấn. Bỏ qua.');
    return record;
  }

  // 5. Unlock adjacent nodes if parent node score >= 70
  // Find all parent nodes that have score >= 70
  const highScoresParentIds = skillTree.nodes
    .filter(node => node.status === 'unlocked' && (node.score || 0) >= 70)
    .map(node => node.id);

  if (highScoresParentIds.length > 0) {
    // Find all target nodes connected to these parents
    const targetNodeIdsToUnlock = skillTree.links
      .filter(link => highScoresParentIds.includes(link.source))
      .map(link => link.target);

    // Unlock these target nodes if they are currently locked
    skillTree.nodes = skillTree.nodes.map(node => {
      if (targetNodeIdsToUnlock.includes(node.id) && node.status === 'locked') {
        console.log(`[SkillTree] Đã mở khoá kỹ năng liền kề: ${node.label} (${node.id}) do kỹ năng cha đạt >= 70 điểm.`);
        return {
          ...node,
          status: 'unlocked',
          score: 0 // Initialize score for newly unlocked node
        };
      }
      return node;
    });
  }

  // 6. Update database record
  const updatedData = {
    graph_data: JSON.stringify(skillTree),
    last_updated: new Date(),
    updated_at: new Date()
  };

  await db('user_skill_trees')
    .where({ user_id: userId })
    .update(updatedData);

  console.log(`[SkillTree] Cập nhật cây kỹ năng cho User ${userId} thành công.`);

  const updatedRecord = {
    ...record,
    ...updatedData,
    graph_data: skillTree
  };

  // 7. Emit socket event
  try {
    emitSkillTreeUpdate(userId, updatedRecord);
  } catch (socketErr) {
    console.error('[SkillTree] Lỗi khi phát socket update:', socketErr);
  }

  return updatedRecord;
};

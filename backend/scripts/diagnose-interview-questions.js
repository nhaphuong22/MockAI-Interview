/**
 * Diagnose recent practice interview question sets.
 * Usage: node scripts/diagnose-interview-questions.js [limit]
 */
import db from '../src/db/knex.js';

const limit = Number(process.argv[2]) || 5;

const STAGE_HINTS = [
  'GĐ1-Nhập cuộc',
  'GĐ2-Điểm mạnh/yếu',
  'GĐ2-Định hướng',
  'GĐ3-Tình huống',
  'GĐ3-Dự án CV',
  'GĐ3-Chuyên môn',
  'GĐ4-Lương/Kỳ vọng',
  'GĐ4-Câu hỏi ngược'
];

const interviews = await db('interviews')
  .where({ type: 'PRACTICE' })
  .orderBy('created_at', 'desc')
  .limit(limit);

if (interviews.length === 0) {
  console.log('No PRACTICE interviews found.');
  process.exit(0);
}

console.log(`\n=== Diagnose ${interviews.length} recent PRACTICE interview(s) ===\n`);

for (const iv of interviews) {
  const questions = await db('interview_questions')
    .where({ interview_id: iv.id })
    .orderBy('order_index', 'asc');

  const texts = questions.map((q) => (q.question_text || '').trim().toLowerCase());
  const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
  const supplementCount = questions.filter((q) =>
    /^câu hỏi bổ sung/i.test(q.question_text || '')
  ).length;
  const followUpCount = questions.filter((q) =>
    /^\[xoáy sâu\]/i.test(q.question_text || '')
  ).length;
  const placeholderCount = questions.filter((q) =>
    /\[(?:tên dự án|tên)\]/i.test(q.question_text || '')
  ).length;

  console.log(`Interview #${iv.id} | ${iv.status} | ${iv.custom_position || 'N/A'}`);
  console.log(`  Created: ${iv.created_at}`);
  console.log(`  Questions: ${questions.length} (expected 8) | supplements: ${supplementCount} | follow-ups: ${followUpCount} | placeholders: ${placeholderCount}`);
  if (dupes.length > 0) console.log(`  ⚠ Duplicate question texts detected: ${dupes.length}`);

  questions.forEach((q, i) => {
    const stage = i < 8 ? STAGE_HINTS[i] : 'Extra';
    const preview = (q.question_text || '').slice(0, 85).replace(/\n/g, ' ');
    const flags = [];
    if (/^câu hỏi bổ sung/i.test(q.question_text || '')) flags.push('SUPPLEMENT');
    if (/^\[xoáy sâu\]/i.test(q.question_text || '')) flags.push('FOLLOW-UP');
    if (/\[(?:tên dự án|tên)\]/i.test(q.question_text || '')) flags.push('PLACEHOLDER');
    const flagStr = flags.length ? ` [${flags.join(', ')}]` : '';
    console.log(`    Q${i + 1} (${stage})${flagStr}: ${preview}...`);
  });
  console.log('');
}

await db.destroy();

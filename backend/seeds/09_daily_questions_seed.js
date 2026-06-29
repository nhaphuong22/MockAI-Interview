/**
 * Seed: Clear Daily Questions
 * Clears the daily questions table so it can be populated dynamically by the AI scheduler.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear existing questions to start fresh
  await knex('daily_questions').del();
  console.log('[Seed] Đã dọn dẹp bảng daily_questions (Chờ AI tự động tạo lúc 00:00).');
}

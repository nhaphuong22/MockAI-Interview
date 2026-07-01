/**
 * Seed: Sample User Skill Trees (Cleared)
 * Populates mock skill tree graph JSON data. Cleared for real dynamic flow testing.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clear existing skill tree records to start fresh
  await knex('user_skill_trees').del();
  console.log('[Seed] Đã dọn dẹp bảng user_skill_trees (Trống dữ liệu mẫu).');
}

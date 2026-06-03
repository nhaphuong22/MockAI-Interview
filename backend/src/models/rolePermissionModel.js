import db from '../db/knex.js';

/**
 * Lấy toàn bộ danh sách permissions từ bảng permissions
 */
export const getAllPermissions = async () => {
  return db('permissions').select('id', 'name', 'description').orderBy('id');
};

/**
 * Lấy toàn bộ danh sách roles từ bảng roles
 */
export const getAllRoles = async () => {
  return db('roles').select('id', 'name').orderBy('id');
};

/**
 * Lấy danh sách permission_id đã được gán cho một role cụ thể
 */
export const getPermissionIdsByRole = async (roleId) => {
  const rows = await db('role_permissions')
    .where({ role_id: roleId })
    .select('permission_id');
  return rows.map(r => r.permission_id);
};

/**
 * Xóa toàn bộ quyền hạn của một role
 */
export const clearRolePermissions = async (roleId, trx = db) => {
  return trx('role_permissions').where({ role_id: roleId }).del();
};

/**
 * Gán một danh sách quyền mới cho một role
 */
export const insertRolePermissions = async (roleId, permissionIds, trx = db) => {
  if (!permissionIds || permissionIds.length === 0) return;
  const rows = permissionIds.map(permission_id => ({
    role_id: roleId,
    permission_id,
    created_at: new Date(),
    updated_at: new Date()
  }));
  return trx('role_permissions').insert(rows);
};

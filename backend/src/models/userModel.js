import db from '../db/knex.js';

export const findById = async (id) => {
  return db('users').where({ id }).first();
};

export const findByEmail = async (email) => {
  return db('users').where({ email }).first();
};

export const insertUser = async (userData, trx = db) => {
  return trx('users').insert(userData).returning('*');
};

export const updateUser = async (id, updateData, trx = db) => {
  return trx('users').where({ id }).update(updateData);
};

export const deleteUser = async (id, trx = db) => {
  return trx('users').where({ id }).del();
};

export const assignRole = async (userId, roleId, trx = db) => {
  return trx('user_roles').insert({
    user_id: userId,
    role_id: roleId,
    created_at: new Date(),
    updated_at: new Date()
  });
};

export const removeRoles = async (userId, trx = db) => {
  return trx('user_roles').where({ user_id: userId }).del();
};

export const getBaseQuery = () => {
  return db('users');
};

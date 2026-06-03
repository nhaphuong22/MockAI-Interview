import db from '../db/knex.js';

export const findSessionById = async (id) => {
  return db('voice_sessions').where({ id }).first();
};

export const insertSession = async (sessionData) => {
  return db('voice_sessions').insert(sessionData).returning('*');
};

export const updateSession = async (id, updateData) => {
  return db('voice_sessions').where({ id }).update(updateData).returning('*');
};

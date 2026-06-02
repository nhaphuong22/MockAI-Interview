import db from '../db/knex.js';

export const findJobById = async (id) => {
  return db('jobs').where({ id }).first();
};

export const insertJob = async (jobData, trx = db) => {
  return trx('jobs').insert(jobData).returning('*');
};

export const updateJob = async (id, updateData, trx = db) => {
  return trx('jobs').where({ id }).update(updateData);
};

export const insertJobRequirements = async (requirementsData, trx = db) => {
  return trx('job_requirements').insert(requirementsData).returning('*');
};

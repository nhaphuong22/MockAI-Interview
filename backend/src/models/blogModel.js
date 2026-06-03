import db from '../db/knex.js';

export const findBlogById = async (id) => {
  return db('blogs').where({ id }).first();
};

export const findBlogWithOwner = async (id, authorId) => {
  return db('blogs').where({ id, author_id: authorId }).first();
};

export const insertBlog = async (blogData) => {
  return db('blogs').insert(blogData).returning('*');
};

export const updateBlog = async (id, updateData) => {
  return db('blogs').where({ id }).update(updateData).returning('*');
};

export const deleteBlog = async (id) => {
  return db('blogs').where({ id }).del();
};

import db from '../db/knex.js';

export const findBlogById = async (id) => {
  return db('blogs').where({ id }).first();
};

export const findPublishedBlogs = async () => {
  return db('blogs')
    .join('users', 'blogs.author_id', '=', 'users.id')
    .where('blogs.status', 'PUBLISHED')
    .select(
      'blogs.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    )
    .orderBy('blogs.created_at', 'desc');
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

export const findBlogWithAuthor = async (id) => {
  return db('blogs')
    .join('users', 'blogs.author_id', '=', 'users.id')
    .where('blogs.id', id)
    .select(
      'blogs.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    )
    .first();
};

export const incrementViewCount = async (id) => {
  return db('blogs')
    .where({ id })
    .increment('view_count', 1)
    .returning('view_count');
};

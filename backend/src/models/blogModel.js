import db from '../db/knex.js';

export const findBlogById = async (id) => {
  return db('blogs').where({ id }).first();
};

export const findPublishedBlogs = async (currentUserId = null) => {
  const query = db('blogs')
    .join('users', 'blogs.author_id', '=', 'users.id')
    .where('blogs.status', 'PUBLISHED')
    .select(
      'blogs.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar',
      db('blog_reactions').whereRaw('blog_reactions.blog_id = blogs.id').count().as('total_reactions'),
      db('blog_comments').whereRaw('blog_comments.blog_id = blogs.id').count().as('comments_count'),
      db.raw(`(SELECT json_object_agg(reaction_type, count) FROM (SELECT reaction_type, count(*) FROM blog_reactions WHERE blog_id = blogs.id GROUP BY reaction_type) t) as reaction_counts`)
    );

  if (currentUserId) {
    query.select(
      db('blog_reactions')
        .whereRaw('blog_reactions.blog_id = blogs.id and blog_reactions.user_id = ?', [currentUserId])
        .select('reaction_type')
        .as('user_reaction_type')
    );
  }

  return query.orderBy('blogs.created_at', 'desc');
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

export const findBlogWithAuthor = async (id, currentUserId = null) => {
  const query = db('blogs')
    .join('users', 'blogs.author_id', '=', 'users.id')
    .where('blogs.id', id)
    .select(
      'blogs.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar',
      db('blog_reactions').whereRaw('blog_reactions.blog_id = blogs.id').count().as('total_reactions'),
      db('blog_comments').whereRaw('blog_comments.blog_id = blogs.id').count().as('comments_count'),
      db.raw(`(SELECT json_object_agg(reaction_type, count) FROM (SELECT reaction_type, count(*) FROM blog_reactions WHERE blog_id = blogs.id GROUP BY reaction_type) t) as reaction_counts`)
    );

  if (currentUserId) {
    query.select(
      db('blog_reactions')
        .whereRaw('blog_reactions.blog_id = blogs.id and blog_reactions.user_id = ?', [currentUserId])
        .select('reaction_type')
        .as('user_reaction_type')
    );
  }

  return query.first();
};

export const incrementViewCount = async (id) => {
  return db('blogs')
    .where({ id })
    .increment('view_count', 1)
    .returning('view_count');
};

export const findRelatedBlogs = async (id, tags) => {
  let query = db('blogs')
    .join('users', 'blogs.author_id', '=', 'users.id')
    .where('blogs.status', 'PUBLISHED')
    .whereNot('blogs.id', id)
    .select(
      'blogs.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    );

  if (tags) {
    const formattedTags = Array.isArray(tags) ? tags : String(tags).replace(/[{}]/g, '').split(',').map(t => t.trim()).filter(Boolean);
    if (formattedTags.length > 0) {
      try {
        query.whereRaw('blogs.tags && ?::text[]', [formattedTags]);
      } catch (e) {
        console.error('Error matching tags in findRelatedBlogs:', e);
      }
    }
  }

  let results = [];
  try {
    results = await query.orderBy('blogs.created_at', 'desc').limit(3);
  } catch (e) {
    console.error('Error running findRelatedBlogs query:', e);
  }

  if (!results || results.length === 0) {
    results = await db('blogs')
      .join('users', 'blogs.author_id', '=', 'users.id')
      .where('blogs.status', 'PUBLISHED')
      .whereNot('blogs.id', id)
      .select(
        'blogs.*',
        'users.full_name as author_name',
        'users.avatar_url as author_avatar'
      )
      .orderBy('blogs.created_at', 'desc')
      .limit(3);
  }

  return results;
};

import db from '../db/knex.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';
import { 
  findBlogWithOwner, 
  insertBlog, 
  updateBlog,
  findPublishedBlogs,
  findBlogWithAuthor,
  incrementViewCount,
  findRelatedBlogs,
  findBlogById
} from '../models/blogModel.js';
import { NotFoundError } from '../core/customErrors.js';
import { moderateBlogContentWithGroq } from './groqService.js';

/**
 * Lưu bài viết nháp (Draft Blog)
 */
export const saveDraftBlog = async ({ authorId, title, content, tags = [], category = null, coverImageUrl = null }) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  // PostgreSQL text[] cần được truyền vào dưới dạng JS array bình thường qua knex
  const tagsArray = Array.isArray(tags) ? tags : [];

  const [newArticle] = await insertBlog({
    author_id: authorId,
    title,
    slug,
    content,
    cover_image_url: coverImageUrl,
    tags: tagsArray.length > 0 ? tagsArray : null,
    category: category || null,
    status: 'DRAFT',
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  // Clear blogs cache list
  await deleteCachePattern('blogs:published*');

  return newArticle;
};

/**
 * Gửi yêu cầu duyệt bài viết (Submit Blog)
 */
export const requestBlogReview = async (blogId, authorId) => {
  // 1. Kiểm tra xem bài viết có tồn tại và thuộc về user không qua blogModel
  const article = await findBlogWithOwner(blogId, authorId);

  if (!article) {
    throw new NotFoundError('Không tìm thấy bài viết hoặc bạn không có quyền sửa.');
  }

  // 2. Gọi AI Bot duyệt nội dung dựa trên tính liên quan
  let moderationStatus = 'PUBLISHED';
  let rejectReason = null;

  try {
    const moderationResult = await moderateBlogContentWithGroq({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags || []
    });

    if (!moderationResult.relevant) {
      moderationStatus = 'REJECTED';
      rejectReason = moderationResult.reason || 'Nội dung bài viết không liên quan đến chủ đề tìm việc, viết CV hay chuẩn bị phỏng vấn.';
    }
  } catch (err) {
    console.error('[Moderator Bot] Lỗi kiểm duyệt bài viết bằng AI:', err);
    // Mặc định cho phép PUBLISHED khi bot AI gặp sự cố kỹ thuật để tránh treo hệ thống
  }

  // 3. Cập nhật bài viết với trạng thái duyệt từ Bot
  const [updatedArticle] = await updateBlog(blogId, {
    status: moderationStatus,
    reject_reason: rejectReason,
    published_at: moderationStatus === 'PUBLISHED' ? db.fn.now() : null,
    updated_at: db.fn.now()
  });

  // Clear blogs cache
  await deleteCachePattern('blogs:published*');
  await deleteCache(`blogs:detail:${blogId}`);

  return updatedArticle;
};

/**
 * Lấy danh sách bài viết đã xuất bản
 */
export const getPublishedBlogs = async (currentUserId = null) => {
  const blogs = await findPublishedBlogs(currentUserId);
  
  // Format properties to boolean/integer correctly
  return blogs.map(blog => ({
    ...blog,
    total_reactions: parseInt(blog.total_reactions || 0),
    comments_count: parseInt(blog.comments_count || 0),
    reaction_counts: blog.reaction_counts || {},
    user_reaction_type: blog.user_reaction_type || null
  }));
};

/**
 * Lấy chi tiết bài viết Blog (cộng thêm 1 view)
 */
export const getBlogById = async (id, currentUserId = null) => {
  const blog = await findBlogWithAuthor(id, currentUserId);
  if (!blog) {
    throw new NotFoundError('Không tìm thấy bài viết này.');
  }

  // Tăng lượt xem
  await incrementViewCount(id);
  
  // Trả về dữ liệu đã cộng view và format kiểu dữ liệu
  blog.view_count += 1;
  blog.total_reactions = parseInt(blog.total_reactions || 0);
  blog.comments_count = parseInt(blog.comments_count || 0);
  blog.reaction_counts = blog.reaction_counts || {};
  blog.user_reaction_type = blog.user_reaction_type || null;
  
  return blog;
};

/**
 * Thả biểu cảm hoặc bỏ biểu cảm bài viết (React to Blog)
 */
export const reactToBlog = async (blogId, userId, reactionType = 'LIKE') => {
  const allowedReactions = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];
  if (!allowedReactions.includes(reactionType)) {
    throw new Error('Loại biểu cảm không hợp lệ.');
  }

  // Kiểm tra bài viết tồn tại
  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new NotFoundError('Không tìm thấy bài viết.');
  }

  const existingReaction = await db('blog_reactions')
    .where({ blog_id: blogId, user_id: userId })
    .first();

  let action = '';
  if (existingReaction) {
    if (existingReaction.reaction_type === reactionType) {
      // Nếu click lại đúng reaction cũ -> Unlike
      await db('blog_reactions')
        .where({ id: existingReaction.id })
        .del();
      action = 'REMOVED';
    } else {
      // Nếu chọn reaction khác -> Update
      await db('blog_reactions')
        .where({ id: existingReaction.id })
        .update({ reaction_type: reactionType });
      action = 'UPDATED';
    }
  } else {
    // Chưa có reaction -> Insert
    await db('blog_reactions').insert({
      blog_id: blogId,
      user_id: userId,
      reaction_type: reactionType
    });
    action = 'ADDED';
  }

  // Clear cache của bài viết
  await deleteCachePattern('blogs:published*');
  await deleteCache(`blogs:detail:${blogId}`);

  // Trả về số liệu count mới nhất
  const currentReactionCounts = await db('blog_reactions')
    .where('blog_id', blogId)
    .select('reaction_type')
    .count('* as count')
    .groupBy('reaction_type');

  const formattedCounts = {};
  let totalReactions = 0;
  currentReactionCounts.forEach(row => {
    const c = parseInt(row.count);
    formattedCounts[row.reaction_type] = c;
    totalReactions += c;
  });

  return {
    action,
    user_reaction_type: action === 'REMOVED' ? null : reactionType,
    total_reactions: totalReactions,
    reaction_counts: formattedCounts
  };
};

/**
 * Thêm bình luận mới cho bài viết
 */
export const addBlogComment = async (blogId, userId, content) => {
  if (!content || content.trim().length === 0) {
    throw new Error('Nội dung bình luận không được để trống.');
  }

  const blog = await findBlogById(blogId);
  if (!blog) {
    throw new NotFoundError('Không tìm thấy bài viết.');
  }

  const [newCommentId] = await db('blog_comments')
    .insert({
      blog_id: blogId,
      user_id: userId,
      content: content.trim()
    })
    .returning('id');

  const newComment = await db('blog_comments')
    .join('users', 'blog_comments.user_id', '=', 'users.id')
    .where('blog_comments.id', newCommentId.id || newCommentId)
    .select(
      'blog_comments.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    )
    .first();

  // Clear cache
  await deleteCachePattern('blogs:published*');
  await deleteCache(`blogs:detail:${blogId}`);

  return newComment;
};

/**
 * Lấy danh sách bình luận của bài viết
 */
export const getBlogComments = async (blogId) => {
  const comments = await db('blog_comments')
    .join('users', 'blog_comments.user_id', '=', 'users.id')
    .where('blog_comments.blog_id', blogId)
    .select(
      'blog_comments.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    )
    .orderBy('blog_comments.created_at', 'asc');

  return comments;
};

/**
 * Lấy danh sách bài viết liên quan
 */
export const getRelatedBlogs = async (id) => {
  const blog = await findBlogById(id);
  if (!blog) {
    throw new NotFoundError('Không tìm thấy bài viết này.');
  }

  const relatedBlogs = await findRelatedBlogs(id, blog.tags || []);
  return relatedBlogs;
};

/**
 * Cập nhật bình luận bài viết
 */
export const updateBlogComment = async (commentId, userId, content) => {
  if (!content || content.trim().length === 0) {
    throw new Error('Nội dung bình luận không được để trống.');
  }

  const comment = await db('blog_comments').where({ id: commentId }).first();
  if (!comment) {
    throw new NotFoundError('Không tìm thấy bình luận.');
  }

  if (comment.user_id !== userId) {
    throw new Error('Bạn không có quyền chỉnh sửa bình luận này.');
  }

  await db('blog_comments')
    .where({ id: commentId })
    .update({ 
      content: content.trim(),
      updated_at: new Date()
    });

  const updatedComment = await db('blog_comments')
    .join('users', 'blog_comments.user_id', '=', 'users.id')
    .where('blog_comments.id', commentId)
    .select(
      'blog_comments.*',
      'users.full_name as author_name',
      'users.avatar_url as author_avatar'
    )
    .first();

  // Clear cache
  await deleteCachePattern('blogs:published*');
  await deleteCache(`blogs:detail:${comment.blog_id}`);

  return updatedComment;
};

/**
 * Xóa bình luận bài viết
 */
export const deleteBlogComment = async (commentId, userId, userRole) => {
  const comment = await db('blog_comments').where({ id: commentId }).first();
  if (!comment) {
    throw new NotFoundError('Không tìm thấy bình luận.');
  }

  // Admin có quyền xóa bình luận của mọi người, user thường chỉ được xóa của chính mình
  if (comment.user_id !== userId && userRole !== 'ADMIN') {
    throw new Error('Bạn không có quyền xóa bình luận này.');
  }

  await db('blog_comments').where({ id: commentId }).del();

  // Clear cache
  await deleteCachePattern('blogs:published*');
  await deleteCache(`blogs:detail:${comment.blog_id}`);

  return { message: 'Xóa bình luận thành công.' };
};

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
  // Kiểm tra xem bài viết có tồn tại và thuộc về user không qua blogModel
  const article = await findBlogWithOwner(blogId, authorId);

  if (!article) {
    throw new NotFoundError('Không tìm thấy bài viết hoặc bạn không có quyền sửa.');
  }

  // Chuyển status sang PENDING qua blogModel
  const [updatedArticle] = await updateBlog(blogId, {
    status: 'PENDING',
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
export const getPublishedBlogs = async () => {
  const blogs = await findPublishedBlogs();
  return blogs;
};

/**
 * Lấy chi tiết bài viết Blog (cộng thêm 1 view)
 */
export const getBlogById = async (id) => {
  const blog = await findBlogWithAuthor(id);
  if (!blog) {
    throw new NotFoundError('Không tìm thấy bài viết này.');
  }

  // Tăng lượt xem
  await incrementViewCount(id);
  
  // Trả về dữ liệu đã cộng view
  blog.view_count += 1;
  
  return blog;
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

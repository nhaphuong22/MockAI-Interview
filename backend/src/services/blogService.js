import db from '../db/knex.js';
import { 
  findBlogWithOwner, 
  insertBlog, 
  updateBlog 
} from '../models/blogModel.js';
import { NotFoundError } from '../core/customErrors.js';

/**
 * Lưu bài viết nháp (Draft Blog)
 */
export const saveDraftBlog = async ({ authorId, title, content, tags = [], category = null, coverImageUrl = null }) => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

  const [newArticle] = await insertBlog({
    author_id: authorId,
    title,
    slug,
    content,
    cover_image_url: coverImageUrl,
    tags: tags,
    category: category,
    status: 'DRAFT',
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

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

  return updatedArticle;
};

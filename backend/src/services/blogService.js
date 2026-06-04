import db from '../db/knex.js';
import { 
  findBlogWithOwner, 
  insertBlog, 
  updateBlog,
  findPublishedBlogs,
  findBlogWithAuthor,
  incrementViewCount
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

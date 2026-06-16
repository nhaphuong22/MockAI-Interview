import { saveDraftBlog, requestBlogReview, getPublishedBlogs as fetchPublishedBlogs, getBlogById as fetchBlogById } from '../services/blogService.js';

/**
 * Lưu bài viết nháp (Draft Blog)
 */
export const createDraft = async (req, res) => {
  try {
    const { title, content, tags, category, cover_image_url } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề (title) và nội dung (content).' });
    }

    const newArticle = await saveDraftBlog({
      authorId,
      title,
      content,
      tags,
      category,
      coverImageUrl: cover_image_url
    });

    return res.status(201).json({
      message: 'Lưu bản nháp bài viết thành công.',
      data: newArticle
    });
  } catch (error) {
    console.error('Lỗi khi lưu nháp bài viết:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lưu nháp bài viết.' });
  }
};

/**
 * Gửi yêu cầu duyệt bài viết (Submit Blog)
 */
export const submitForReview = async (req, res) => {
  try {
    const { id } = req.params;
    const authorId = req.user.id;

    const updatedArticle = await requestBlogReview(Number(id), authorId);

    return res.status(200).json({
      message: 'Gửi yêu cầu duyệt bài viết thành công.',
      data: updatedArticle
    });
  } catch (error) {
    if (error.message === 'Không tìm thấy bài viết hoặc bạn không có quyền sửa.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Lỗi khi gửi yêu cầu duyệt bài:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi gửi yêu cầu duyệt bài.' });
  }
};

/**
 * Tải lên ảnh bìa (Cover Image)
 */
export const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn một file ảnh.' });
    }

    // Trả về URL của ảnh đã được lưu
    const imageUrl = `/uploads/${req.file.filename}`;
    
    return res.status(200).json({
      message: 'Tải ảnh bìa lên thành công.',
      url: imageUrl
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh bìa:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tải ảnh bìa.' });
  }
};

/**
 * Lấy danh sách bài viết đã xuất bản
 */
export const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await fetchPublishedBlogs();
    return res.status(200).json({
      message: 'Lấy danh sách bài viết thành công.',
      data: blogs
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách blog:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tải bài viết.' });
  }
};

/**
 * Lấy chi tiết bài viết Blog theo ID
 */
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await fetchBlogById(Number(id));

    return res.status(200).json({
      message: 'Lấy chi tiết bài viết thành công.',
      data: blog
    });
  } catch (error) {
    if (error.message === 'Không tìm thấy bài viết này.') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Lỗi khi lấy chi tiết blog:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tải chi tiết bài viết.' });
  }
};

import db from '../db/knex.js';

/**
 * Lưu bài viết nháp (Draft Blog)
 */
export const createDraft = async (req, res) => {
  try {
    const { title, content, tags, category, cover_image_url } = req.body;
    // req.user.id lấy từ authenticateToken middleware
    const author_id = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề (title) và nội dung (content).' });
    }

    // Insert vào bảng blogs (nằm trong content_tables)
    const [newArticle] = await db('blogs').insert({
      author_id,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now(),
      content,
      cover_image_url: cover_image_url || null,
      tags: tags ? tags : [], // knex will handle array insertion
      category: category || null,
      status: 'DRAFT',
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    }).returning('*');

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
    const author_id = req.user.id;

    // Kiểm tra xem bài viết có tồn tại và thuộc về user không
    const article = await db('blogs').where({ id, author_id }).first();

    if (!article) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết hoặc bạn không có quyền sửa.' });
    }

    // Chuyển status sang PENDING
    const [updatedArticle] = await db('blogs')
      .where({ id })
      .update({
        status: 'PENDING',
        updated_at: db.fn.now()
      })
      .returning('*');

    return res.status(200).json({
      message: 'Gửi yêu cầu duyệt bài viết thành công.',
      data: updatedArticle
    });
  } catch (error) {
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

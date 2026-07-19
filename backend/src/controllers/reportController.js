import db from '../db/db.js';

export const submitReport = async (req, res) => {
  try {
    const { target_type, target_id, reason, description } = req.body;
    const reporter_id = req.user.id;

    if (!target_type || !target_id || !reason) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc để gửi báo cáo.' });
    }

    if (!['JOB', 'COMMUNITY_POST'].includes(target_type)) {
      return res.status(400).json({ error: 'Loại báo cáo không hợp lệ.' });
    }

    // Kiểm tra xem đã report chưa
    const existingReport = await db('reports')
      .where({
        reporter_id,
        target_type,
        target_id
      })
      .first();

    if (existingReport) {
      return res.status(400).json({ error: 'Bạn đã báo cáo nội dung này rồi.' });
    }

    // Insert
    await db('reports').insert({
      reporter_id,
      target_type,
      target_id,
      reason,
      description
    });

    res.status(201).json({ message: 'Gửi báo cáo thành công. Cảm ơn bạn đã đóng góp!' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi báo cáo.' });
  }
};

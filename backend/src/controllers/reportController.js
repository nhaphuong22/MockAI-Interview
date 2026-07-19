import db from '../db/knex.js';

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

export const getReports = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = db('reports')
      .select(
        'reports.*',
        'users.full_name as reporter_name',
        'users.email as reporter_email'
      )
      .leftJoin('users', 'reports.reporter_id', 'users.id')
      .orderBy('reports.created_at', 'desc');

    if (status) {
      query = query.where('reports.status', status);
    }
    if (type) {
      query = query.where('reports.target_type', type);
    }

    const reports = await query;

    // Lấy thêm thông tin bài viết/việc làm bị báo cáo
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let targetTitle = 'Nội dung không xác định';
        if (report.target_type === 'JOB') {
          const job = await db('jobs').where('id', report.target_id).first();
          if (job) targetTitle = job.title;
        } else if (report.target_type === 'COMMUNITY_POST') {
          const blog = await db('blogs').where('id', report.target_id).first();
          if (blog) targetTitle = blog.title;
        }
        return { ...report, target_title: targetTitle };
      })
    );

    res.status(200).json({ data: enrichedReports });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách báo cáo.' });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'RESOLVED' or 'REJECTED'

    if (!['RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
    }

    const updated = await db('reports')
      .where('id', id)
      .update({ status, updated_at: db.fn.now() })
      .returning('*');

    if (!updated.length) {
      return res.status(404).json({ error: 'Không tìm thấy báo cáo.' });
    }

    res.status(200).json({ message: 'Cập nhật trạng thái báo cáo thành công.', data: updated[0] });
  } catch (error) {
    console.error('Lỗi khi cập nhật báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật báo cáo.' });
  }
};

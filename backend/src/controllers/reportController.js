import db from '../db/knex.js';
import { sendRealtimeNotification } from '../socket.js';

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

export const getGroupedReports = async (req, res) => {
  try {
    const { status, type } = req.query;

    let query = db('reports')
      .select('target_type', 'target_id', 'status')
      .count('* as report_count')
      .max('created_at as latest_report_time');

    if (status) {
      query = query.where('status', status);
    }
    if (type) {
      query = query.where('target_type', type);
    }

    query = query.groupBy('target_type', 'target_id', 'status')
      .orderBy('latest_report_time', 'desc');

    const groupedReports = await query;

    // Lấy thông tin bài viết/việc làm
    const enrichedReports = await Promise.all(
      groupedReports.map(async (group) => {
        let targetTitle = 'Nội dung không xác định';
        let authorName = 'Unknown';
        
        if (group.target_type === 'JOB') {
          const job = await db('jobs').where('id', group.target_id).first();
          if (job) {
            targetTitle = job.title;
            const company = await db('companies').where('id', job.company_id).first();
            authorName = company ? company.name : 'Unknown';
          }
        } else if (group.target_type === 'COMMUNITY_POST') {
          const blog = await db('blogs').where('id', group.target_id).first();
          if (blog) {
            targetTitle = blog.title;
            const user = await db('users').where('id', blog.author_id).first();
            authorName = user ? user.full_name : 'Unknown';
          }
        }
        
        return { 
          target_type: group.target_type,
          target_id: group.target_id,
          report_count: group.report_count,
          latest_report_time: group.latest_report_time,
          target_title: targetTitle,
          author_name: authorName,
          status: group.status
        };
      })
    );

    res.status(200).json({ data: enrichedReports });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách báo cáo.' });
  }
};

export const getReportDetails = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const reports = await db('reports')
      .select(
        'reports.*',
        'users.full_name as reporter_name',
        'users.email as reporter_email'
      )
      .leftJoin('users', 'reports.reporter_id', 'users.id')
      .where('reports.target_type', targetType)
      .andWhere('reports.target_id', targetId)
      .orderBy('reports.created_at', 'desc');

    let targetData = null;
    if (targetType === 'JOB') {
      targetData = await db('jobs').where('id', targetId).first();
    } else if (targetType === 'COMMUNITY_POST') {
      targetData = await db('blogs').where('id', targetId).first();
    }

    res.status(200).json({ 
      data: {
        reports,
        target_data: targetData
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy chi tiết báo cáo.' });
  }
};

export const warnUser = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    let targetOwnerId = null;
    let targetTitle = '';

    if (targetType === 'JOB') {
      const job = await db('jobs').where('id', targetId).first();
      if (job) {
         targetOwnerId = job.hr_id;
         targetTitle = job.title;
         await db('jobs').where('id', targetId).update({ is_warned: true });
      }
    } else if (targetType === 'COMMUNITY_POST') {
      const blog = await db('blogs').where('id', targetId).first();
      if (blog) {
         targetOwnerId = blog.author_id;
         targetTitle = blog.title;
         await db('blogs').where('id', targetId).update({ is_warned: true });
      }
    }

    if (!targetOwnerId) {
      return res.status(404).json({ error: 'Không tìm thấy tác giả bài đăng.' });
    }

    // Create notification
    const [notification] = await db('notifications').insert({
      user_id: targetOwnerId,
      type: 'WARNING',
      title: 'Cảnh báo vi phạm nội dung',
      content: `Nội dung "${targetTitle}" của bạn đã nhận được nhiều báo cáo từ cộng đồng. Vui lòng kiểm tra lại nội dung đăng tải theo tiêu chuẩn cộng đồng của chúng tôi.`,
      link: targetType === 'JOB' ? `/jobs/${targetId}` : `/community/post/${targetId}`
    }).returning('*');

    sendRealtimeNotification(targetOwnerId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      link: notification.link,
      is_read: notification.is_read,
      created_at: notification.created_at
    });

    res.status(200).json({ message: 'Gửi cảnh báo thành công.' });
  } catch (error) {
    console.error('Lỗi khi gửi cảnh báo:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi cảnh báo.' });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    let targetTitle = '';
    let targetOwnerId = null;

    if (targetType === 'JOB') {
      const job = await db('jobs').where('id', targetId).first();
      if (!job) return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
      // Guard: already hidden
      if (job.status === 'REJECTED') {
        return res.status(400).json({ error: 'Nội dung này đã bị ẩn trước đó rồi.' });
      }
      targetTitle = job.title;
      targetOwnerId = job.hr_id;
      await db('jobs').where('id', targetId).update({ status: 'REJECTED' }); 
    } else if (targetType === 'COMMUNITY_POST') {
      const blog = await db('blogs').where('id', targetId).first();
      if (!blog) return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
      // Guard: already hidden
      if (blog.status === 'REJECTED') {
        return res.status(400).json({ error: 'Nội dung này đã bị ẩn trước đó rồi.' });
      }
      targetTitle = blog.title;
      targetOwnerId = blog.author_id;
      await db('blogs').where('id', targetId).update({ status: 'REJECTED' });
    }

    // Resolve all reports & get top reason for notification link
    const reports = await db('reports').where('target_type', targetType).andWhere('target_id', targetId);

    // Pick most common reason
    const reasonCounts = {};
    reports.forEach(r => { reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1; });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Khác';

    // Build link for author to see why their content was hidden
    const encodedTitle = encodeURIComponent(targetTitle);
    const encodedReason = encodeURIComponent(topReason);
    const hiddenPageLink = `/content-hidden?type=${targetType}&title=${encodedTitle}&reason=${encodedReason}`;

    await db('reports')
      .where('target_type', targetType)
      .andWhere('target_id', targetId)
      .update({ status: 'RESOLVED', updated_at: db.fn.now() });

    // Notify the author that their content was hidden
    if (targetOwnerId) {
      const [authorNotif] = await db('notifications').insert({
        user_id: targetOwnerId,
        type: 'WARNING',
        title: 'Nội dung bị ẩn do vi phạm',
        content: `Nội dung "${targetTitle}" của bạn đã bị ẩn khỏi hệ thống do vi phạm Tiêu chuẩn cộng đồng sau nhiều lượt báo cáo. Bấm để xem chi tiết.`,
        link: hiddenPageLink
      }).returning('*');

      sendRealtimeNotification(targetOwnerId, {
        id: authorNotif.id,
        type: authorNotif.type,
        title: authorNotif.title,
        content: authorNotif.content,
        link: authorNotif.link,
        is_read: authorNotif.is_read,
        created_at: authorNotif.created_at
      });
    }

    // Notify all reporters
    const uniqueReporterIds = [...new Set(reports.map(r => r.reporter_id))];

    for (const reporterId of uniqueReporterIds) {
      const [notification] = await db('notifications').insert({
        user_id: reporterId,
        type: 'SYSTEM',
        title: 'Báo cáo đã được xử lý',
        content: `Nội dung vi phạm "${targetTitle}" mà bạn báo cáo đã bị ẩn khỏi hệ thống. Cảm ơn bạn đã chung tay bảo vệ cộng đồng!`,
        link: null
      }).returning('*');

      sendRealtimeNotification(reporterId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        is_read: notification.is_read,
        created_at: notification.created_at
      });
    }

    res.status(200).json({ message: 'Ẩn nội dung thành công và đã thông báo tới tất cả người liên quan.' });
  } catch (error) {
    console.error('Lỗi khi ẩn nội dung:', error);
    res.status(500).json({ error: 'Lỗi server khi ẩn nội dung.' });
  }
};

export const unhideContent = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    let targetTitle = '';
    let targetOwnerId = null;

    if (targetType === 'JOB') {
      const job = await db('jobs').where('id', targetId).first();
      if (!job) return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
      if (job.status !== 'REJECTED') {
        return res.status(400).json({ error: 'Nội dung này hiện không bị ẩn.' });
      }
      targetTitle = job.title;
      targetOwnerId = job.hr_id;
      await db('jobs').where('id', targetId).update({ status: 'ACTIVE', is_warned: false });
    } else if (targetType === 'COMMUNITY_POST') {
      const blog = await db('blogs').where('id', targetId).first();
      if (!blog) return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
      if (blog.status !== 'REJECTED') {
        return res.status(400).json({ error: 'Nội dung này hiện không bị ẩn.' });
      }
      targetTitle = blog.title;
      targetOwnerId = blog.author_id;
      await db('blogs').where('id', targetId).update({ status: 'PUBLISHED', is_warned: false });
    }

    // Reopen the reports to PENDING so admin can track
    await db('reports')
      .where('target_type', targetType)
      .andWhere('target_id', targetId)
      .update({ status: 'PENDING', updated_at: db.fn.now() });

    // Notify the author that their content is visible again
    if (targetOwnerId) {
      const [authorNotif] = await db('notifications').insert({
        user_id: targetOwnerId,
        type: 'SYSTEM',
        title: 'Nội dung đã được gỡ ẩn',
        content: `Tốt tin! Nội dung "${targetTitle}" của bạn đã được quản trị viên gỡ ẩn và hiển thị trở lại trên nền tảng.`,
        link: targetType === 'JOB' ? `/jobs/${targetId}` : `/community/post/${targetId}`
      }).returning('*');

      sendRealtimeNotification(targetOwnerId, {
        id: authorNotif.id,
        type: authorNotif.type,
        title: authorNotif.title,
        content: authorNotif.content,
        link: authorNotif.link,
        is_read: authorNotif.is_read,
        created_at: authorNotif.created_at
      });
    }

    res.status(200).json({ message: 'Gỡ ẩn nội dung thành công.' });
  } catch (error) {
    console.error('Lỗi khi gỡ ẩn:', error);
    res.status(500).json({ error: 'Lỗi server khi gỡ ẩn nội dung.' });
  }
};

export const rejectReports = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    let targetTitle = 'Nội dung';
    if (targetType === 'JOB') {
      const job = await db('jobs').where('id', targetId).first();
      if (job) targetTitle = job.title;
    } else if (targetType === 'COMMUNITY_POST') {
      const blog = await db('blogs').where('id', targetId).first();
      if (blog) targetTitle = blog.title;
    }

    // Reject all reports
    await db('reports')
      .where('target_type', targetType)
      .andWhere('target_id', targetId)
      .update({ status: 'REJECTED', updated_at: db.fn.now() });

    // Notify reporters
    const reports = await db('reports').where('target_type', targetType).andWhere('target_id', targetId);
    const uniqueReporterIds = [...new Set(reports.map(r => r.reporter_id))];

    for (const reporterId of uniqueReporterIds) {
      const [notification] = await db('notifications').insert({
        user_id: reporterId,
        type: 'SYSTEM',
        title: 'Báo cáo không hợp lệ',
        content: `Bài viết "${targetTitle}" mà bạn báo cáo không phát hiện vi phạm nào. Cảm ơn bạn đã đóng góp!`,
        link: '#'
      }).returning('*');

      sendRealtimeNotification(reporterId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        link: notification.link,
        is_read: notification.is_read,
        created_at: notification.created_at
      });
    }

    res.status(200).json({ message: 'Đã bỏ qua báo cáo và thông báo tới người tố cáo.' });
  } catch (error) {
    console.error('Lỗi khi bỏ qua báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi bỏ qua báo cáo.' });
  }
};

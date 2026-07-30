import db from '../db/knex.js';
import { sendRealtimeNotification } from '../socket.js';
import { deleteCachePattern } from '../config/redis.js';

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

    // Kiểm tra không cho phép tự báo cáo bài của mình
    if (target_type === 'JOB') {
      const job = await db('jobs').where('id', target_id).first();
      if (!job) return res.status(404).json({ error: 'Không tìm thấy tin tuyển dụng.' });
      if (job.hr_id === reporter_id) {
        return res.status(400).json({ error: 'Bạn không thể tự báo cáo tin tuyển dụng của chính mình.' });
      }
    } else if (target_type === 'COMMUNITY_POST') {
      const blog = await db('blogs').where('id', target_id).first();
      if (!blog) return res.status(404).json({ error: 'Không tìm thấy bài viết cộng đồng.' });
      if (blog.author_id === reporter_id) {
        return res.status(400).json({ error: 'Bạn không thể tự báo cáo bài viết của chính mình.' });
      }
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
    // 1. Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, type } = req.query;

    let query = db('reports')
      .select('target_type', 'target_id', 'status')
      .count('* as report_count')
      .max('created_at as latest_report_time');

    if (status) query = query.where('status', status);
    if (type) query = query.where('target_type', type);

    query = query.groupBy('target_type', 'target_id', 'status')
      .orderBy('latest_report_time', 'desc')
      .limit(limit)
      .offset(offset);

    const groupedReports = await query;

    // 2. Fix N+1 Query: Fetch all related records in bulk
    const jobIds = groupedReports.filter(g => g.target_type === 'JOB').map(g => g.target_id);
    const blogIds = groupedReports.filter(g => g.target_type === 'COMMUNITY_POST').map(g => g.target_id);

    const jobsMap = {};
    if (jobIds.length > 0) {
      const jobs = await db('jobs')
        .select('jobs.id', 'jobs.title', 'companies.name as company_name')
        .leftJoin('companies', 'jobs.company_id', 'companies.id')
        .whereIn('jobs.id', jobIds);
      jobs.forEach(j => { jobsMap[j.id] = j; });
    }

    const blogsMap = {};
    if (blogIds.length > 0) {
      const blogs = await db('blogs')
        .select('blogs.id', 'blogs.title', 'users.full_name as author_name')
        .leftJoin('users', 'blogs.author_id', 'users.id')
        .whereIn('blogs.id', blogIds);
      blogs.forEach(b => { blogsMap[b.id] = b; });
    }

    // 3. Map Data safely & Parse Int
    const enrichedReports = groupedReports.map(group => {
      let targetTitle = 'Nội dung không xác định';
      let authorName = 'Unknown';

      if (group.target_type === 'JOB' && jobsMap[group.target_id]) {
        targetTitle = jobsMap[group.target_id].title;
        authorName = jobsMap[group.target_id].company_name || 'Unknown';
      } else if (group.target_type === 'COMMUNITY_POST' && blogsMap[group.target_id]) {
        targetTitle = blogsMap[group.target_id].title;
        authorName = blogsMap[group.target_id].author_name || 'Unknown';
      }

      return {
        target_type: group.target_type,
        target_id: group.target_id,
        report_count: parseInt(group.report_count, 10),
        latest_report_time: group.latest_report_time,
        target_title: targetTitle,
        author_name: authorName,
        status: group.status
      };
    });

    res.status(200).json({ data: enrichedReports, page, limit });
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

    await db.transaction(async (trx) => {
      if (targetType === 'JOB') {
        const job = await trx('jobs').where('id', targetId).first();
        if (job) {
          targetOwnerId = job.hr_id;
          targetTitle = job.title;
          await trx('jobs').where('id', targetId).update({ is_warned: true });
        }
      } else if (targetType === 'COMMUNITY_POST') {
        const blog = await trx('blogs').where('id', targetId).first();
        if (blog) {
          targetOwnerId = blog.author_id;
          targetTitle = blog.title;
          await trx('blogs').where('id', targetId).update({ is_warned: true });
        }
      }

      if (!targetOwnerId) {
        throw new Error('NOT_FOUND');
      }

      // Create notification
      const [notification] = await trx('notifications').insert({
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
    });

    res.status(200).json({ message: 'Gửi cảnh báo thành công.' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Không tìm thấy tác giả bài đăng.' });
    }
    console.error('Lỗi khi gửi cảnh báo:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi cảnh báo.' });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    await db.transaction(async (trx) => {
      let targetTitle = '';
      let targetOwnerId = null;

      if (targetType === 'JOB') {
        const job = await trx('jobs').where('id', targetId).first();
        if (!job) throw new Error('NOT_FOUND');
        if (job.status === 'REJECTED') throw new Error('ALREADY_HIDDEN');
        
        targetTitle = job.title;
        targetOwnerId = job.hr_id;
        await trx('jobs').where('id', targetId).update({ status: 'REJECTED' });
      } else if (targetType === 'COMMUNITY_POST') {
        const blog = await trx('blogs').where('id', targetId).first();
        if (!blog) throw new Error('NOT_FOUND');
        if (blog.status === 'REJECTED') throw new Error('ALREADY_HIDDEN');
        
        targetTitle = blog.title;
        targetOwnerId = blog.author_id;
        await trx('blogs').where('id', targetId).update({ status: 'REJECTED' });
      }

      // Resolve reports
      const reports = await trx('reports').where('target_type', targetType).andWhere('target_id', targetId);

      const reasonCounts = {};
      reports.forEach(r => { reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1; });
      const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Khác';

      let shortTitle = targetTitle.length > 25 ? targetTitle.slice(0, 25) + '...' : targetTitle;
      let shortReason = topReason.length > 25 ? topReason.slice(0, 25) + '...' : topReason;

      let encodedTitle = encodeURIComponent(shortTitle);
      let encodedReason = encodeURIComponent(shortReason);
      let hiddenPageLink = `/content-hidden?type=${targetType}&title=${encodedTitle}&reason=${encodedReason}`;

      if (hiddenPageLink.length > 240) {
        shortTitle = targetTitle.slice(0, 10) + '...';
        hiddenPageLink = `/content-hidden?type=${targetType}&title=${encodeURIComponent(shortTitle)}&reason=${encodedReason}`;
      }

      await trx('reports')
        .where('target_type', targetType)
        .andWhere('target_id', targetId)
        .update({ status: 'RESOLVED', updated_at: db.fn.now() });

      // Notify author
      if (targetOwnerId) {
        const [authorNotif] = await trx('notifications').insert({
          user_id: targetOwnerId,
          type: 'WARNING',
          title: 'Nội dung bị ẩn do vi phạm',
          content: `Nội dung "${targetTitle}" của bạn đã bị ẩn khỏi hệ thống do vi phạm Tiêu chuẩn cộng đồng sau nhiều lượt báo cáo. Bấm để xem chi tiết.`,
          link: hiddenPageLink
        }).returning('*');

        sendRealtimeNotification(targetOwnerId, { ...authorNotif });
      }

      // Notify reporters
      const uniqueReporterIds = [...new Set(reports.map(r => r.reporter_id))];
      for (const reporterId of uniqueReporterIds) {
        const [notification] = await trx('notifications').insert({
          user_id: reporterId,
          type: 'SYSTEM',
          title: 'Báo cáo đã được xử lý',
          content: `Nội dung vi phạm "${targetTitle}" mà bạn báo cáo đã bị ẩn khỏi hệ thống. Cảm ơn bạn đã chung tay bảo vệ cộng đồng!`,
          link: null
        }).returning('*');

        sendRealtimeNotification(reporterId, { ...notification });
      }
    });

    // Xóa Redis cache để trang cộng đồng không còn hiển thị bài đã bị ẩn
    if (targetType === 'COMMUNITY_POST') {
      await deleteCachePattern('blogs:published*');
      await deleteCachePattern(`blogs:detail:*blogs/${targetId}*`);
    }

    res.status(200).json({ message: 'Ẩn nội dung thành công và đã thông báo tới tất cả người liên quan.' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
    if (error.message === 'ALREADY_HIDDEN') return res.status(400).json({ error: 'Nội dung này đã bị ẩn trước đó rồi.' });
    console.error('Lỗi khi ẩn nội dung:', error);
    res.status(500).json({ error: 'Lỗi server khi ẩn nội dung.' });
  }
};

export const unhideContent = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    await db.transaction(async (trx) => {
      let targetTitle = '';
      let targetOwnerId = null;

      if (targetType === 'JOB') {
        const job = await trx('jobs').where('id', targetId).first();
        if (!job) throw new Error('NOT_FOUND');
        if (job.status !== 'REJECTED') throw new Error('NOT_HIDDEN');
        
        targetTitle = job.title;
        targetOwnerId = job.hr_id;
        await trx('jobs').where('id', targetId).update({ status: 'ACTIVE', is_warned: false });
      } else if (targetType === 'COMMUNITY_POST') {
        const blog = await trx('blogs').where('id', targetId).first();
        if (!blog) throw new Error('NOT_FOUND');
        if (blog.status !== 'REJECTED') throw new Error('NOT_HIDDEN');
        
        targetTitle = blog.title;
        targetOwnerId = blog.author_id;
        await trx('blogs').where('id', targetId).update({ status: 'PUBLISHED', is_warned: false });
      }

      await trx('reports')
        .where('target_type', targetType)
        .andWhere('target_id', targetId)
        .update({ status: 'PENDING', updated_at: db.fn.now() });

      if (targetOwnerId) {
        const [authorNotif] = await trx('notifications').insert({
          user_id: targetOwnerId,
          type: 'SYSTEM',
          title: 'Nội dung đã được gỡ ẩn',
          content: `Tin tốt! Nội dung "${targetTitle}" của bạn đã được quản trị viên gỡ ẩn và hiển thị trở lại trên nền tảng.`,
          link: targetType === 'JOB' ? `/jobs/${targetId}` : `/community/post/${targetId}`
        }).returning('*');

        sendRealtimeNotification(targetOwnerId, { ...authorNotif });
      }
    });

    // Xóa Redis cache để trang cộng đồng hiển thị lại bài vừa được gỡ ẩn
    if (targetType === 'COMMUNITY_POST') {
      await deleteCachePattern('blogs:published*');
      await deleteCachePattern(`blogs:detail:*blogs/${targetId}*`);
    }

    res.status(200).json({ message: 'Gỡ ẩn nội dung thành công.' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Không tìm thấy nội dung.' });
    if (error.message === 'NOT_HIDDEN') return res.status(400).json({ error: 'Nội dung này hiện không bị ẩn.' });
    console.error('Lỗi khi gỡ ẩn:', error);
    res.status(500).json({ error: 'Lỗi server khi gỡ ẩn nội dung.' });
  }
};

export const rejectReports = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    await db.transaction(async (trx) => {
      let targetTitle = 'Nội dung';
      if (targetType === 'JOB') {
        const job = await trx('jobs').where('id', targetId).first();
        if (job) targetTitle = job.title;
      } else if (targetType === 'COMMUNITY_POST') {
        const blog = await trx('blogs').where('id', targetId).first();
        if (blog) targetTitle = blog.title;
      }

      await trx('reports')
        .where('target_type', targetType)
        .andWhere('target_id', targetId)
        .update({ status: 'REJECTED', updated_at: db.fn.now() });

      const reports = await trx('reports').where('target_type', targetType).andWhere('target_id', targetId);
      const uniqueReporterIds = [...new Set(reports.map(r => r.reporter_id))];

      for (const reporterId of uniqueReporterIds) {
        const [notification] = await trx('notifications').insert({
          user_id: reporterId,
          type: 'SYSTEM',
          title: 'Báo cáo không hợp lệ',
          content: `Bài viết "${targetTitle}" mà bạn báo cáo không phát hiện vi phạm nào. Cảm ơn bạn đã đóng góp!`,
          link: '#'
        }).returning('*');

        sendRealtimeNotification(reporterId, { ...notification });
      }
    });

    res.status(200).json({ message: 'Đã bỏ qua báo cáo và thông báo tới người tố cáo.' });
  } catch (error) {
    console.error('Lỗi khi bỏ qua báo cáo:', error);
    res.status(500).json({ error: 'Lỗi server khi bỏ qua báo cáo.' });
  }
};

import db from '../db/knex.js';

/**
 * Lấy danh sách tất cả các tin tuyển dụng dành cho Admin kiểm duyệt
 */
export const getJobs = async (req, res) => {
  try {
    const jobs = await db('jobs')
      .leftJoin('companies', 'jobs.company_id', 'companies.id')
      .leftJoin('locations', 'jobs.location_id', 'locations.id')
      .leftJoin('job_types', 'jobs.job_type_id', 'job_types.id')
      .select([
        'jobs.id',
        'jobs.title',
        'companies.name as company',
        'jobs.salary_min',
        'jobs.salary_max',
        'jobs.salary_currency',
        'jobs.is_salary_visible',
        'locations.name as location',
        'job_types.name as type',
        'jobs.approval_status',
        'jobs.created_at'
      ]);

    const formattedJobs = jobs.map(job => {
      let salaryStr = 'Thỏa thuận';
      if (job.is_salary_visible && (job.salary_min || job.salary_max)) {
        const formatNum = (num) => num ? num.toLocaleString('vi-VN') + 'đ' : '';
        if (job.salary_min && job.salary_max) {
          salaryStr = `${formatNum(job.salary_min)} - ${formatNum(job.salary_max)}`;
        } else if (job.salary_min) {
          salaryStr = `Từ ${formatNum(job.salary_min)}`;
        } else if (job.salary_max) {
          salaryStr = `Đến ${formatNum(job.salary_max)}`;
        }
      }

      return {
        id: `JOB-${String(job.id).padStart(3, '0')}`,
        dbId: job.id,
        title: job.title,
        company: job.company || 'Doanh nghiệp ẩn danh',
        salary: salaryStr,
        location: job.location || 'Toàn quốc',
        type: job.type || 'Full-time',
        status: job.approval_status === 'APPROVED' ? 'Approved' :
                job.approval_status === 'REJECTED' ? 'Rejected' : 'Pending',
        postedDate: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : '',
        featured: false // Default fallback
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tin tuyển dụng kiểm duyệt:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách tin tuyển dụng.' });
  }
};

/**
 * Cập nhật phê duyệt/từ chối/ẩn tin tuyển dụng
 */
export const updateJobApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('JOB-') ? parseInt(id.replace('JOB-', '')) : parseInt(id);
    const { status } = req.body; // status is "Approved" or "Rejected"

    const approval_status = status === 'Approved' ? 'APPROVED' : 'REJECTED';

    const updatedRows = await db('jobs')
      .where({ id: dbId })
      .update({
        approval_status,
        approved_by: req.user.id,
        approved_at: new Date(),
        updated_at: new Date()
      });

    if (!updatedRows) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái tin tuyển dụng thành công.',
      status: status
    });
  } catch (error) {
    console.error('Lỗi khi kiểm duyệt tin tuyển dụng:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm duyệt tin tuyển dụng.' });
  }
};

/**
 * Lấy danh sách tất cả các bài viết cộng đồng dành cho Admin kiểm duyệt
 */
export const getBlogs = async (req, res) => {
  try {
    const blogs = await db('blogs')
      .leftJoin('users', 'blogs.author_id', 'users.id')
      .select([
        'blogs.id',
        'blogs.title',
        'users.full_name as author',
        'blogs.category',
        'blogs.view_count',
        'blogs.status',
        'blogs.created_at',
        'blogs.content'
      ]);

    const formattedBlogs = blogs.map(blog => {
      return {
        id: `BLOG-${String(blog.id).padStart(3, '0')}`,
        dbId: blog.id,
        title: blog.title,
        author: blog.author || 'Tác giả ẩn danh',
        category: blog.category || 'Chia sẻ',
        views: blog.view_count || 0,
        status: blog.status === 'PUBLISHED' ? 'Published' : 'Draft', // Map PENDING to Draft to show in Chờ kiểm duyệt
        postedDate: blog.created_at ? new Date(blog.created_at).toISOString().split('T')[0] : '',
        summary: blog.content ? blog.content.substring(0, 100) + '...' : ''
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedBlogs
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết kiểm duyệt:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách bài viết.' });
  }
};

/**
 * Kiểm duyệt phê duyệt/từ chối bài viết cộng đồng
 */
export const reviewBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('BLOG-') ? parseInt(id.replace('BLOG-', '')) : parseInt(id);
    const { status, reject_reason } = req.body; // status is "Published" or "Rejected"

    const dbStatus = status === 'Published' ? 'PUBLISHED' : 'REJECTED';

    const updateData = {
      status: dbStatus,
      approved_by: req.user.id,
      updated_at: new Date()
    };

    if (dbStatus === 'PUBLISHED') {
      updateData.published_at = new Date();
    } else if (dbStatus === 'REJECTED') {
      updateData.reject_reason = reject_reason || 'Bài viết không đạt tiêu chuẩn nội dung.';
    }

    const updatedRows = await db('blogs')
      .where({ id: dbId })
      .update(updateData);

    if (!updatedRows) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Kiểm duyệt bài viết thành công.',
      status: status
    });
  } catch (error) {
    console.error('Lỗi khi kiểm duyệt bài viết:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi kiểm duyệt bài viết.' });
  }
};

/**
 * Xóa/gỡ bài viết khỏi hệ thống
 */
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const dbId = id.startsWith('BLOG-') ? parseInt(id.replace('BLOG-', '')) : parseInt(id);

    const deletedRows = await db('blogs')
      .where({ id: dbId })
      .del();

    if (!deletedRows) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết để gỡ.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Gỡ bài viết khỏi hệ thống thành công.'
    });
  } catch (error) {
    console.error('Lỗi khi gỡ bài viết:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi gỡ bài viết.' });
  }
};

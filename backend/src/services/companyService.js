import db from '../db/knex.js';

/**
 * Lấy chi tiết thông tin công ty theo ID
 * Tự động ẩn thông tin liên hệ nếu HR thiết lập ẩn (contact_public = false)
 * 
 * @param {number} id - ID của Company
 * @param {number|null} requestingUserId - ID người dùng đang xem (optional)
 * @returns {Promise<object|null>}
 */
export const getCompanyById = async (id, requestingUserId = null) => {
  const company = await db('companies').where({ id }).first();
  if (!company) {
    return null;
  }

  // Tìm HR đại diện cho công ty này để kiểm tra cấu hình contact_public
  const hrUser = await db('users')
    .join('user_roles', 'users.id', 'user_roles.user_id')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .where('users.company_id', id)
    .where('roles.name', 'HR')
    .select('users.contact_public', 'users.contact_email', 'users.contact_phone')
    .first();

  // Mặc định contact_public là true nếu không tìm thấy HR tương ứng
  const isContactPublic = hrUser ? !!hrUser.contact_public : true;

  // Đếm số người theo dõi
  const followerCountRow = await db('company_followers').where({ company_id: id }).count('id as count').first();
  const followerCount = parseInt(followerCountRow?.count || 0);

  // Kiểm tra xem người dùng hiện tại có đang theo dõi không
  let isFollowing = false;
  if (requestingUserId) {
    const followRecord = await db('company_followers')
      .where({ company_id: id, user_id: requestingUserId })
      .first();
    isFollowing = !!followRecord;
  }

  const result = {
    ...company,
    contact_public: isContactPublic,
    follower_count: followerCount,
    is_following: isFollowing,
  };

  if (hrUser) {
    if (hrUser.contact_email) result.email = hrUser.contact_email;
    if (hrUser.contact_phone) result.phone = hrUser.contact_phone;
  }

  // Ẩn email và số điện thoại nếu cấu hình là ẩn
  if (!isContactPublic) {
    result.email = null;
    result.phone = null;
  }

  return result;
};

/**
 * Toggle theo dõi / bỏ theo dõi công ty
 * @param {number} companyId - ID công ty
 * @param {number} userId - ID ứng viên
 * @returns {Promise<{is_following: boolean, follower_count: number}>}
 */
export const toggleCompanyFollow = async (companyId, userId) => {
  const existing = await db('company_followers')
    .where({ company_id: companyId, user_id: userId })
    .first();

  if (existing) {
    // Đã follow rồi → Unfollow
    await db('company_followers').where({ company_id: companyId, user_id: userId }).delete();
  } else {
    // Chưa follow → Follow
    await db('company_followers').insert({ company_id: companyId, user_id: userId });
  }

  const followerCountRow = await db('company_followers').where({ company_id: companyId }).count('id as count').first();
  const followerCount = parseInt(followerCountRow?.count || 0);

  return {
    is_following: !existing,
    follower_count: followerCount,
  };
};

/**
 * Lấy danh sách ID của tất cả những ứng viên đang follow công ty
 * @param {number} companyId
 * @returns {Promise<number[]>}
 */
export const getCompanyFollowerIds = async (companyId) => {
  const rows = await db('company_followers').where({ company_id: companyId }).select('user_id');
  return rows.map(r => r.user_id);
};

/**
 * Lấy danh sách chi tiết ứng viên đang theo dõi công ty
 * @param {number} companyId 
 * @returns {Promise<object[]>}
 */
export const getCompanyFollowersProfiles = async (companyId) => {
  const followers = await db('company_followers')
    .join('users', 'company_followers.user_id', 'users.id')
    .where('company_followers.company_id', companyId)
    .select(
      'users.id',
      'users.email',
      'users.full_name',
      'users.avatar_url',
      'users.bio as title', // map bio to title for frontend
      'users.address as city', // map address to city for frontend
      'company_followers.created_at as followed_at'
    )
    .orderBy('company_followers.created_at', 'desc');
    
  return followers;
};


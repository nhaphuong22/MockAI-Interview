import db from '../db/knex.js';

/**
 * Lấy chi tiết thông tin công ty theo ID
 * Tự động ẩn thông tin liên hệ nếu HR thiết lập ẩn (contact_public = false)
 * 
 * @param {number} id - ID của Company
 * @returns {Promise<object|null>}
 */
export const getCompanyById = async (id) => {
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

  const result = {
    ...company,
    contact_public: isContactPublic,
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

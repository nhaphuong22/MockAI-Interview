import axiosClient from './axiosClient';

const paymentApi = {
  // ─── User-facing APIs ───
  getPackages: () => {
    const url = '/payments/packages';
    return axiosClient.get(url);
  },
  createVnpayUrl: (data) => {
    const url = '/payments/create-vnpay-url';
    return axiosClient.post(url, data);
  },

  // ─── Admin-only APIs ───
  // Get all packages (Candidate + HR) with total_sold metric
  getAllPackagesAdmin: () => axiosClient.get('/payments/admin/packages'),

  // RPC-style toggle — no body sent, backend flips is_active itself
  togglePackageStatus: (id) =>
    axiosClient.patch(`/payments/admin/packages/${id}/toggle-status`),

  // Update package price
  updatePackagePrice: (id, price) =>
    axiosClient.patch(`/payments/admin/packages/${id}/price`, { price }),

  // Paginated transaction history with optional filters
  getTransactionsAdmin: ({ page = 1, limit = 20, user_type = '', status = '', search = '' } = {}) =>
    axiosClient.get('/payments/admin/transactions', {
      params: { page, limit, user_type: user_type || undefined, status: status || undefined, search: search || undefined }
    }),

  // ─── Coupons Admin APIs ───
  getCouponsAdmin: () => axiosClient.get('/payments/admin/coupons'),
  createCouponAdmin: (data) => axiosClient.post('/payments/admin/coupons', data),
  toggleCouponStatusAdmin: (id) => axiosClient.patch(`/payments/admin/coupons/${id}/toggle-status`),
  deleteCouponAdmin: (id) => axiosClient.delete(`/payments/admin/coupons/${id}`),
};

export default paymentApi;

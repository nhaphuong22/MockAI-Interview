import axiosClient from './axiosClient';

const paymentApi = {
  getPackages: () => {
    const url = '/payments/packages';
    return axiosClient.get(url);
  },
  createVnpayUrl: (data) => {
    const url = '/payments/create-vnpay-url';
    return axiosClient.post(url, data);
  }
};

export default paymentApi;

import axiosInstance from "./axiosConfig";

const addressService = {
  // GET /users/{userId}/addresses - Lấy danh sách địa chỉ của user
  getAddresses: (userId) =>
    axiosInstance.get(`/users/${userId}/addresses`),

  // POST /users/{userId}/addresses - Thêm địa chỉ mới
  createAddress: (userId, payload) =>
    axiosInstance.post(`/users/${userId}/addresses`, payload),

  // PUT /users/{userId}/addresses/{addressId} - Cập nhật địa chỉ
  updateAddress: (userId, addressId, payload) =>
    axiosInstance.put(`/users/${userId}/addresses/${addressId}`, payload),

  // DELETE /users/{userId}/addresses/{addressId} - Xóa địa chỉ
  deleteAddress: (userId, addressId) =>
    axiosInstance.delete(`/users/${userId}/addresses/${addressId}`),

  // GET /locations/provinces - Lấy danh sách tỉnh/thành
  getProvinces: () =>
    axiosInstance.get("/locations/provinces"),

  // GET /locations/provinces/{code}/communes - Lấy danh sách xã/phường theo tỉnh
  getCommunes: (provinceCode) =>
    axiosInstance.get(`/locations/provinces/${provinceCode}/communes`),
};

export default addressService;


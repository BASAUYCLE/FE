import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { formDataOptions } from "./requestHelpers";

const USER = API_ENDPOINTS.USER;
const ADMIN = API_ENDPOINTS.ADMIN;
const UPLOAD = API_ENDPOINTS.UPLOAD;

function saveUserToStorage(user) {
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

const userService = {
  // ===== USER PROFILE =====
  // GET /users/myinfo - Lấy thông tin user hiện tại
  getProfile: () => axiosInstance.get(USER.MY_INFO),

  // PUT /users/myinfo - Cập nhật thông tin cá nhân
  updateProfile: async (userData) => {
    const response = await axiosInstance.put(USER.UPDATE_MY_INFO, userData, formDataOptions(userData));
    const user = response?.user ?? response?.result ?? response;
    saveUserToStorage(user);
    return response;
  },

  // GET /users/{userId} - Lấy thông tin user theo ID
  getUserById: (userId) => axiosInstance.get(USER.BY_ID(userId)),

  // GET /users/email/{email} — thường dùng cho admin tra cứu
  getUserByEmail: (email) => axiosInstance.get(USER.BY_EMAIL(email)),

  // PUT /users/{userId} - Cập nhật user (admin)
  updateUser: (userId, userData) => 
    axiosInstance.put(USER.UPDATE(userId), userData),

  // DELETE /users/myinfo hoặc /users/{userId} - Xóa tài khoản
  deleteAccount: async () => {
    const response = await axiosInstance.delete(USER.MY_INFO);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return response;
  },

  deleteUser: (userId) => axiosInstance.delete(USER.DELETE(userId)),

  // ===== ADMIN USERS =====
  // GET /users - Danh sách tất cả users
  getAllUsers: (params = {}) => 
    axiosInstance.get(USER.LIST, { params }),

  // GET /admin/users - Danh sách users (admin)
  getAdminUsers: (params = {}) => 
    axiosInstance.get(ADMIN.USERS, { params }),

  // GET /admin/users/pending - Danh sách users đang chờ duyệt CCCD
  getPendingUsers: (params = {}) =>
    axiosInstance.get(ADMIN.USERS_PENDING, { params }),

  // POST /admin/users/verify - Duyệt/Từ chối user
  // BE contract: { userId, action: "APPROVE" | "REJECT", reason? }
  verifyUser: (userId, action = "APPROVE", reason = null) =>
    axiosInstance.post(ADMIN.VERIFY_USER, {
      userId,
      action,
      reason: reason || undefined,
    }),

  // POST /admin/users/hide - Ẩn/Khóa tài khoản user
  // BE contract: { userId, reason }
  hideUser: (userId, reason) =>
    axiosInstance.post(ADMIN.HIDE_USER, {
      userId,
      reason,
    }),

  // ===== AVATAR/FILE =====
  // POST /users/myinfo/avatar - Upload avatar người dùng hiện tại
  uploadMyAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
      USER.MY_INFO_AVATAR,
      formData,
      formDataOptions(formData),
    );
  },

  // POST /api/upload/image - Upload avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(UPLOAD.IMAGE, formData, formDataOptions(formData));
  },
};

export default userService;

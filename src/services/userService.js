import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { formDataOptions } from "./requestHelpers";

const E = API_ENDPOINTS.USER;
const UPLOAD = API_ENDPOINTS.UPLOAD;

const updateLocalUser = (user) => {
  if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const userService = {
  getProfile: () => axiosInstance.get(E.MY_INFO),
  getUserById: (userId) => axiosInstance.get(E.BY_ID(userId)),

  updateProfile: async (userData) => {
    const response = await axiosInstance.put(E.UPDATE_MY_INFO, userData, formDataOptions(userData));
    updateLocalUser(response?.user);
    return response;
  },

  updateUser: (userId, userData) => axiosInstance.put(E.UPDATE(userId), userData),

  deleteAccount: async () => {
    const response = await axiosInstance.delete(E.MY_INFO);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return response;
  },

  deleteUser: (userId) => axiosInstance.delete(E.DELETE(userId)),
  getAllUsers: (params = {}) => axiosInstance.get(E.LIST, { params }),

  uploadAvatar: (file) => {
    const formData = new FormData();
    // Backend expects field name: "file" at POST /api/upload/image
    formData.append("file", file);
    return axiosInstance.post(UPLOAD.IMAGE, formData, formDataOptions(formData));
  },

  getBookingHistory: () => axiosInstance.get(E.BOOKINGS),
  getWallet: () => axiosInstance.get(E.WALLET),
  getWishlist: () => axiosInstance.get(E.WISHLIST),
  addToWishlist: (itemId) => axiosInstance.post(E.WISHLIST, { itemId }),
  removeFromWishlist: (itemId) => axiosInstance.delete(E.WISHLIST_ITEM(itemId)),
};

export default userService;

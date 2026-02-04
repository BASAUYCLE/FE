/**
 * Legacy API – dùng authService/userService. Prefer import từ './index'.
 * @deprecated Use authService, userService from './index' instead.
 */

import { API_CONFIG } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { authService, userService } from "./index";

const { BASE_URL } = API_CONFIG;

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.");
    }
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Lỗi kết nối: Backend server không phản hồi.");
    }
    throw error;
  }
};

export const userApi = {
  register: authService.register,
  login: authService.login,
  updateProfile: userService.updateProfile,
  changePassword: authService.changePassword,
};

export default apiCall;

import axios from "axios";
import { API_CONFIG } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";

const { BASE_URL, TIMEOUT } = API_CONFIG;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT ?? 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData: không gửi Content-Type để browser tự set multipart/form-data; boundary=...
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const getBackendMessage = (data) => {
  if (!data || typeof data !== "object") return null;
  const msg = data.message ?? data.msg ?? data.error;
  if (msg && typeof msg === "string") return msg;
  const result = data.result ?? data.data;
  if (result && typeof result === "object") {
    const rMsg = result.message ?? result.msg ?? result.error;
    if (rMsg && typeof rMsg === "string") return rMsg;
  }
  return null;
};

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      const errorMsg = `Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend có đang chạy tại ${BASE_URL}?\n2. CORS đã được enable chưa?`;
      console.error("Network Error:", errorMsg);
      return Promise.reject({ status: 0, message: errorMsg, data: null });
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = getBackendMessage(data) || error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      if (!PUBLIC_PATHS.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
      return Promise.reject({
        status: 401,
        message: getBackendMessage(data) || "Email hoặc mật khẩu không đúng. Kiểm tra lại (mật khẩu tối thiểu 8 ký tự).",
        data,
      });
    }

    return Promise.reject({ status, message, data });
  }
);

export default axiosInstance;

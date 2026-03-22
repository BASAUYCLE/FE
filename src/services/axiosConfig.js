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

// Gắn token vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData: để browser tự set Content-Type (multipart/form-data + boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy thông báo lỗi từ response backend (API dùng message/msg/error khác nhau)
function getErrorMessage(data) {
  if (!data || typeof data !== "object") return null;
  const msg =
    data.message ??
    data.msg ??
    data.detail ??
    data.title ??
    (typeof data.error === "string" ? data.error : null);
  if (typeof msg === "string" && msg.trim()) return msg;
  const inner = data.result ?? data.data;
  if (inner && typeof inner === "object") {
    const innerMsg =
      inner.message ?? inner.msg ?? inner.error ?? inner.detail;
    if (typeof innerMsg === "string") return innerMsg;
  }
  return null;
}

const LOGIN_PATHS = ["/login", "/register", "/forgot-password"];

/** Request POST /auth/login — chuẩn hóa 401 (Spring hay trả "Unauthenticated") */
function isAuthLoginRequest(config) {
  const u = String(config?.url ?? "");
  return u.includes("auth/login");
}

const LOGIN_WRONG_CREDENTIALS_MSG = "Sai mật khẩu hoặc email đăng nhập.";

function messageFor401LoginRequest(backendMsg) {
  const s = String(backendMsg || "")
    .toLowerCase()
    .trim();
  const generic =
    !s ||
    s.includes("unauthenticated") ||
    s === "unauthorized" ||
    s.includes("invalid credentials") ||
    s.includes("bad credentials") ||
    s.includes("full authentication is required");
  return generic ? LOGIN_WRONG_CREDENTIALS_MSG : backendMsg;
}

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      const message = `Cannot connect to server. Check: 1) Is backend running at ${BASE_URL}? 2) Is CORS enabled?`;
      console.error("Network Error:", message);
      return Promise.reject({ status: 0, message, data: null, response: null });
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const message = getErrorMessage(data) || error.message || "Something went wrong. Please try again.";

    if (status === 401) {
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      // Thông báo cho AuthContext/Header cập nhật lại trạng thái đăng nhập
      try {
        window.dispatchEvent(new Event("basauycle-auth-logout"));
      } catch (_) {}
      if (!LOGIN_PATHS.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
      const rawBackend = getErrorMessage(data);
      const isLoginPost =
        isAuthLoginRequest(error.config) &&
        String(error.config?.method || "get").toLowerCase() === "post";
      const msg401 = isLoginPost
        ? messageFor401LoginRequest(rawBackend || message)
        : rawBackend ||
          message ||
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      return Promise.reject({
        status: 401,
        message: msg401,
        data,
        response: error.response,
      });
    }

    return Promise.reject({
      status,
      message,
      data,
      response: error.response,
    });
  }
);

export default axiosInstance;

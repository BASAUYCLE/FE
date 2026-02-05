import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";

/**
 * Get token from object - hỗ trợ nhiều tên key (backend có thể dùng token, accessToken, jwtToken, ...)
 */
const getTokenFrom = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  const raw =
    obj.token ?? obj.accessToken ?? obj.jwt ?? obj.access_token ??
    obj.jwtToken ?? obj.tokenValue ?? obj.value ?? null;
  if (typeof raw === 'string') return raw;
  // Token có thể bọc trong object: { value: "..." } hoặc { accessToken: "..." }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw.token ?? raw.accessToken ?? raw.value ?? raw.jwt ?? null;
  }
  return null;
};

/**
 * Get user object from object - hỗ trợ nhiều tên key (backend có thể dùng user, authenticated, userInfo, ...)
 */
const getUserFrom = (obj) => {
  if (!obj || typeof obj !== 'object') return null;
  // authenticated có thể là object user HOẶC boolean - chỉ dùng khi là object
  const u = obj.user ?? obj.userInfo ?? obj.account ?? obj.userDetails ?? obj.data ?? null;
  let candidate = u;
  if (obj.authenticated && typeof obj.authenticated === 'object' && !Array.isArray(obj.authenticated)) {
    candidate = candidate ?? obj.authenticated;
  }
  if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
  if (obj.id != null || obj.email || obj.fullName) return obj;
  return null;
};

/**
 * Normalize login response - Backend có thể trả về nhiều format khác nhau
 */
const normalizeLoginResponse = (response) => {
  if (!response || typeof response !== 'object') return { token: null, user: null };

  // Format 1: Trực tiếp { token, user } hoặc { accessToken, userInfo }
  let token = getTokenFrom(response);
  let user = getUserFrom(response);
  if (token || user) return { token, user };

  // Format 2: Backend trả về { code, result } hoặc { data: { token, user } }
  const data = response.data ?? response.result ?? response.payload ?? response.body;
  if (data && typeof data === 'object') {
    token = getTokenFrom(data) || token;
    user = getUserFrom(data) || (data.id != null || data.email || data.fullName ? data : null) || user;
    // Nested: result.data hoặc result.result (token/user bên trong)
    if (!token || !user) {
      const inner = data.data ?? data.result ?? data.payload;
      if (inner && typeof inner === 'object') {
        token = getTokenFrom(inner) || token;
        user = getUserFrom(inner) || (inner.id != null || inner.email || inner.fullName ? inner : null) || user;
      }
    }
    // Backend có thể dùng key viết hoa: Token, User
    if (!token || !user) {
      const lowerKeys = {};
      for (const k of Object.keys(data)) lowerKeys[k.toLowerCase()] = data[k];
      token = token || getTokenFrom(lowerKeys);
      user = user || getUserFrom(lowerKeys);
    }
    if (token || user) return { token, user };
  }

  // Format 3: User fields flatten ở top-level { token, id, email, fullName, ... }
  if (response.id != null || response.email) {
    token = getTokenFrom(response) || token;
    const { token: _t, accessToken: _a, jwt: _j, access_token: _at, ...rest } = response;
    user = Object.keys(rest).length > 0 ? rest : user;
    return { token, user };
  }

  // Format 4: Bất kỳ object có 2 key - tìm value giống JWT (có dấu .) và object user
  const keys = Object.keys(response);
  if (keys.length >= 1) {
    for (const k of keys) {
      const v = response[k];
      if (typeof v === 'string' && v.includes('.') && v.length > 20) token = v;
      if (v && typeof v === 'object' && !Array.isArray(v) && (v.id != null || v.email)) user = v;
    }
    if (token || user) return { token, user };
  }

  return { token: getTokenFrom(response), user: null };
};

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Register new user
   * @param {FormData|Object} userData - User registration data (supports FormData for file uploads)
   * @returns {Promise} Response with user data and token
   */
  register: async (userData) => {
    if (userData instanceof FormData) {
      return axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials { email, password }
   * @returns {Promise} Response with user data and token
   */
  login: async (credentials) => {
    try {
      const rawResponse = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const keys = rawResponse ? Object.keys(rawResponse) : [];
      if (import.meta.env.DEV && keys.length > 0) {
        console.log("[Login] Response keys:", keys.join(", "));
        if (rawResponse.result && typeof rawResponse.result === "object") {
          console.log("[Login] result keys:", Object.keys(rawResponse.result).join(", "));
        }
      }

      const code = rawResponse?.code ?? rawResponse?.status;
      const result = rawResponse?.result ?? rawResponse?.data;

      // Xử lý trực tiếp format { code, result: { token, authenticated } } từ backend
      let token = null;
      let user = null;
      if (result && typeof result === "object") {
        const t = result.token ?? result.accessToken ?? result.jwt ?? result.access_token ?? result.jwtToken;
        if (t && typeof t === "string") token = t;
        // authenticated có thể là true (boolean) hoặc object user
        const isAuthenticated = result.authenticated === true || result.authenticated === "true";
        if (isAuthenticated && token) {
          user = {
            email: credentials?.email ?? "",
            fullName: (credentials?.email ?? "").split("@")[0] || "User",
            name: (credentials?.email ?? "").split("@")[0] || "User",
          };
        } else if (result.authenticated && typeof result.authenticated === "object") {
          user = result.authenticated;
        } else {
          user = getUserFrom(result);
        }
      }

      // Nếu chưa có token/user thì dùng normalize
      if (!token && !user) {
        const normalized = normalizeLoginResponse(rawResponse);
        token = normalized.token;
        user = normalized.user;
      }

      // Chỉ báo lỗi khi không có token và backend gửi code lỗi hoặc message
      const isSuccessCode = code === 200 || code === 0 || code === "200" || code === "0" || code == null;
      const resultObj = rawResponse?.result ?? rawResponse?.data;
      if (!token && !user) {
        if (!isSuccessCode && resultObj && typeof resultObj === "object") {
          const msg = resultObj.message ?? resultObj.msg ?? resultObj.error ?? "Đăng nhập thất bại.";
          throw { message: msg, status: code };
        }
        if (resultObj && typeof resultObj === "object" && (resultObj.message ?? resultObj.msg)) {
          throw {
            message: resultObj.message ?? resultObj.msg ?? "Đăng nhập thất bại.",
            status: rawResponse?.code,
          };
        }
      }

      // Có token nhưng chưa có user → tạo user tối thiểu để login thành công và redirect về home
      if (token && !user) {
        user = {
          email: credentials?.email ?? "",
          fullName: (credentials?.email ?? "").split("@")[0] || "User",
          name: (credentials?.email ?? "").split("@")[0] || "User",
        };
      }

      if (token && typeof token === "string") {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      }
      if (user && typeof user === "object") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return { token: token || null, user };
    } catch (error) {
      // 401 = backend từ chối (sai email/mật khẩu) - đảm bảo có message rõ ràng
      if (error?.status === 401 && !error?.message) {
        error.message = "Email hoặc mật khẩu không đúng. Mật khẩu tối thiểu 8 ký tự.";
      }
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise} Logout response
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      return response;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      // Backend may not implement /auth/logout (404) – still clear local session
      const status = error?.response?.status;
      if (status === 404 || status === 401) return null;
      throw error;
    }
  },

  verifyToken: () => axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY),

  refreshToken: async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
    if (response?.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    }
    return response;
  },

  forgotPassword: (email) => axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (resetData) => axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData),
  changePassword: (passwordData) => axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData),
};

export default authService;

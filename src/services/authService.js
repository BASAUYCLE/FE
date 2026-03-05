import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";

// Backend có thể dùng nhiều key cho token (token, accessToken, jwt, ...)
function getToken(obj) {
  if (!obj || typeof obj !== "object") return null;
  const raw =
    obj.token ?? obj.accessToken ?? obj.jwt ?? obj.access_token ??
    obj.jwtToken ?? obj.tokenValue ?? obj.value ?? null;
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw.token ?? raw.accessToken ?? raw.value ?? raw.jwt ?? null;
  }
  return null;
}

// Backend có thể dùng user, userInfo, account, ...
function getUser(obj) {
  if (!obj || typeof obj !== "object") return null;
  const u = obj.user ?? obj.userInfo ?? obj.account ?? obj.userDetails ?? obj.data ?? null;
  let candidate = u;
  if (obj.authenticated && typeof obj.authenticated === "object" && !Array.isArray(obj.authenticated)) {
    candidate = candidate ?? obj.authenticated;
  }
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) return candidate;
  if (obj.id != null || obj.email || obj.fullName) return obj;
  return null;
}

function normalizeLoginResponse(response) {
  if (!response || typeof response !== "object") return { token: null, user: null };

  let token = getToken(response);
  let user = getUser(response);
  if (token || user) return { token, user };

  const data = response.data ?? response.result ?? response.payload ?? response.body;
  if (data && typeof data === "object") {
    token = getToken(data) || token;
    user = getUser(data) || (data.id != null || data.email || data.fullName ? data : null) || user;
    if (!token || !user) {
      const inner = data.data ?? data.result ?? data.payload;
      if (inner && typeof inner === "object") {
        token = getToken(inner) || token;
        user = getUser(inner) || (inner.id != null || inner.email || inner.fullName ? inner : null) || user;
      }
    }
    if (!token || !user) {
      const lowerKeys = {};
      for (const k of Object.keys(data)) lowerKeys[k.toLowerCase()] = data[k];
      token = token || getToken(lowerKeys);
      user = user || getUser(lowerKeys);
    }
    if (token || user) return { token, user };
  }

  if (response.id != null || response.email) {
    token = getToken(response) || token;
    const { token: _t, accessToken: _a, jwt: _j, access_token: _at, ...rest } = response;
    user = Object.keys(rest).length > 0 ? rest : user;
    return { token, user };
  }

  const keys = Object.keys(response);
  if (keys.length >= 1) {
    for (const k of keys) {
      const v = response[k];
      if (typeof v === "string" && v.includes(".") && v.length > 20) token = v;
      if (v && typeof v === "object" && !Array.isArray(v) && (v.id != null || v.email)) user = v;
    }
    if (token || user) return { token, user };
  }

  return { token: getToken(response), user: null };
};

/**
 * Service xác thực – login, register, logout, đổi mật khẩu
 */
const authService = {
  // POST /auth/register - Đăng ký tài khoản (kèm CCCD)
  register: async (userData) => {
    if (userData instanceof FormData) {
      return axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },

  login: async (credentials) => {
    try {
      const rawResponse = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // BE trả về ApiResponse<AuthenticationResponse> với result.token và result.authenticated
      const result = rawResponse?.result ?? rawResponse?.data ?? rawResponse;
      
      let token = null;
      if (result && typeof result === "object") {
        token = result.token ?? result.accessToken ?? result.jwt;
      }
      
      // User info sẽ được fetch từ /users/myinfo, không phải từ login response
      let user = null;
      if (token && credentials?.email) {
        user = {
          email: credentials.email,
          fullName: credentials.fullName || credentials.email.split("@")[0] || "User",
          name: credentials.fullName || credentials.email.split("@")[0] || "User",
        };
      }
      
      if (!token) {
        const msg = result?.message ?? result?.msg ?? "Could not sign in. Please check your email and password.";
        throw { message: msg, status: 401 };
      }

      if (token && typeof token === "string") {
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      }
      if (user && typeof user === "object") {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return { token, user };
    } catch (error) {
      if (error?.status === 401 && !error?.message) {
        error.message = "Invalid email or password.";
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      return response;
    } catch (error) {
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
      // axiosConfig interceptor rejects with { status, message, data }
      if (error?.status === 404 || error?.status === 401) return null;
      throw error;
    }
  },

  verifyToken: () => axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY),

  refreshToken: async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
    if (response?.token) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    }
    return response;
  },

  forgotPassword: (email) => axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (resetData) => axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetData),
  changePassword: (passwordData) => axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData),
};

export default authService;

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { authService, userService } from "../services";
import { STORAGE_KEYS } from "../constants/storageKeys";

const AuthContext = createContext();

/** Chuẩn hóa user.role từ backend (có thể gửi user_role hoặc userRole) */
function normalizeUser(u) {
  if (!u || typeof u !== "object") return u;
  const role = u.role ?? u.userRole ?? u.user_role ?? "MEMBER";
  if (u.role === role) return u;
  return { ...u, role: String(role).toUpperCase() };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      const u = saved ? JSON.parse(saved) : null;
      return normalizeUser(u);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => setLoading(false), []);

  // Khi đã có token + user nhưng user chưa có role, gọi getProfile một lần để lấy role (ADMIN/INSPECTOR)
  useEffect(() => {
    if (!token || !user?.email) return;
    if (user.role ?? user.userRole ?? user.user_role) return; // đã có role, bỏ qua
    let cancelled = false;
    userService
      .getProfile()
      .then((profileRes) => {
        if (cancelled) return;
        const data = profileRes?.data ?? profileRes?.result ?? profileRes;
        const profileUser =
          data?.user ?? data?.userInfo ?? (typeof data?.id === "number" || data?.email ? data : null);
        if (profileUser && typeof profileUser === "object") {
          const normalized = normalizeUser(profileUser);
          setUser(normalized);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user?.email, user?.role, user?.userRole, user?.user_role]);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await authService.login(credentials);

      // authService already stores token and user in localStorage
      if (response.user && response.token) {
        setToken(response.token);
        let finalUser = normalizeUser(response.user);
        setUser(finalUser);
        // Đợi lấy profile để có role (ADMIN/INSPECTOR) trước khi return — dùng cho redirect đúng trang
        try {
          const profileRes = await userService.getProfile();
          const data = profileRes?.data ?? profileRes?.result ?? profileRes;
          const profileUser =
            data?.user ?? data?.userInfo ?? (typeof data?.id === "number" || data?.email ? data : null);
          if (profileUser && typeof profileUser === "object") {
            finalUser = normalizeUser(profileUser);
            setUser(finalUser);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(finalUser));
          }
        } catch (_) {}
        return { success: true, data: response, user: finalUser };
      }
      return {
        success: false,
        message:
          "Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu.",
      };
    } catch (error) {
      const msg =
        error?.message ||
        (typeof error === "string" ? error : "Đăng nhập thất bại");
      // Chỉ log console.error cho lỗi không mong đợi (mạng, server); lỗi sai mật khẩu không log đỏ
      if (
        import.meta.env.DEV &&
        error?.status !== 401 &&
        error?.status !== 403 &&
        !msg.includes("Đăng nhập")
      ) {
        console.error("[Auth] Login error:", error);
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // New method for direct login with user and token
  const loginWithSession = (userData, userToken) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setToken(userToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await authService.register(userData);

      // If registration includes auto-login (returns token)
      if (response.token && response.user) {
        const normalized = normalizeUser(response.user);
        setUser(normalized);
        setToken(response.token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
      }

      return { success: true, data: response };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: error.message || "Đăng ký thất bại" };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(userData);

      // userService already updates localStorage
      if (response.user) {
        const normalized = normalizeUser(response.user);
        setUser(normalized);
        return { success: true, data: normalized };
      } else {
        return { success: false, message: "Cập nhật thất bại" };
      }
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, message: error.message || "Cập nhật thất bại" };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await authService.changePassword(passwordData);

      return { success: true, data: response };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: error.message || "Đổi mật khẩu thất bại",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Only log if it's not a missing logout endpoint (404)
      if (error?.response?.status !== 404) {
        console.error("Logout error:", error);
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const isAuthenticated = () => !!token && !!user;

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      loginWithSession,
      register,
      updateProfile,
      changePassword,
      logout,
      isAuthenticated,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

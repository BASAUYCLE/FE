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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.TOKEN),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => setLoading(false), []);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await authService.login(credentials);

      // authService already stores token and user in localStorage
      if (response.user && response.token) {
        setUser(response.user);
        setToken(response.token);
        return { success: true, data: response };
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
    setUser(userData);
    setToken(userToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await authService.register(userData);

      // If registration includes auto-login (returns token)
      if (response.token && response.user) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
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
        setUser(response.user);
        return { success: true, data: response.user };
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
      // Call backend logout endpoint
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
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

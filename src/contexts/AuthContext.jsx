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

/** Chuẩn hóa user.role (backend có thể gửi user_role hoặc userRole) */
function normalizeUser(userObj) {
  if (!userObj || typeof userObj !== "object") return userObj;
  const role =
    userObj.role ?? userObj.userRole ?? userObj.user_role ?? "MEMBER";
  if (userObj.role === role) return userObj;
  return { ...userObj, role: String(role).toUpperCase() };
}

/** Thông báo thân thiện khi đăng nhập sai (BE hay trả "Unauthenticated", v.v.) */
function loginWrongCredentialsMessage(rawMsg, status) {
  if (status !== 401) return rawMsg;
  const s = String(rawMsg || "")
    .toLowerCase()
    .trim();
  if (
    !s ||
    s.includes("unauthenticated") ||
    s === "unauthorized" ||
    s.includes("invalid credentials") ||
    s.includes("bad credentials") ||
    s.includes("full authentication is required")
  ) {
    return "Sai mật khẩu hoặc email đăng nhập.";
  }
  return rawMsg;
}

/** Check if account is PENDING (waiting approval) – block login */
function isPendingVerification(user) {
  if (!user || typeof user !== "object") return false;
  const status = (user.is_verified ?? user.isVerified ?? user.status ?? "")
    .toString()
    .toUpperCase();
  return status === "PENDING";
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

/** Dùng trong component có thể render ngoài AuthProvider (vd. PostingStatusEffect); trả về null thay vì throw. */
export const useAuthOptional = () => useContext(AuthContext) ?? null;

export const AuthProvider = ({ children }) => {
  // Xoá dữ liệu cũ còn sót lại trong localStorage (migration sang sessionStorage)
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEYS.USER);
      const userObj = saved ? JSON.parse(saved) : null;
      return normalizeUser(userObj);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    sessionStorage.getItem(STORAGE_KEYS.TOKEN),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => setLoading(false), []);

  // Khi đã có token + user, gọi getProfile lấy role; nếu PENDING thì đăng xuất
  useEffect(() => {
    if (!token || !user?.email) return;
    let cancelled = false;
    userService
      .getProfile()
      .then((profileRes) => {
        if (cancelled) return;
        const data = profileRes?.data ?? profileRes?.result ?? profileRes;
        const profileUser =
          data?.user ??
          data?.userInfo ??
          (typeof data?.id === "number" || data?.email ? data : null);
        if (profileUser && typeof profileUser === "object") {
          if (isPendingVerification(profileUser)) {
            sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
            sessionStorage.removeItem(STORAGE_KEYS.USER);
            setToken(null);
            setUser(null);
            return;
          }
          const normalized = normalizeUser(profileUser);
          setUser(normalized);
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, user?.email]);

  const login = async (credentials) => {
    try {
      setLoading(true);

      const response = await authService.login(credentials);

      // authService đã lưu token và user vào localStorage
      if (response.user && response.token) {
        setToken(response.token);
        let finalUser = normalizeUser(response.user);
        setUser(finalUser);
        try {
          const profileRes = await userService.getProfile();
          const data = profileRes?.data ?? profileRes?.result ?? profileRes;
          const profileUser =
            data?.user ??
            data?.userInfo ??
            (typeof data?.id === "number" || data?.email ? data : null);
          if (profileUser && typeof profileUser === "object") {
            if (isPendingVerification(profileUser)) {
              setToken(null);
              setUser(null);
              sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
              sessionStorage.removeItem(STORAGE_KEYS.USER);
              return {
                success: false,
                message:
                  "Your account is pending approval. Please contact the administrator.",
              };
            }
            finalUser = normalizeUser(profileUser);
            setUser(finalUser);
            sessionStorage.setItem(
              STORAGE_KEYS.USER,
              JSON.stringify(finalUser),
            );
          }
        } catch (_) {}
        return { success: true, data: response, user: finalUser };
      }
      return {
        success: false,
        message: "Sai mật khẩu hoặc email đăng nhập.",
      };
    } catch (error) {
      const rawMsg =
        error?.message ||
        error?.data?.message ||
        (typeof error === "string" ? error : "Login failed");
      const isPendingBlock =
        error?.status === 403 &&
        (String(rawMsg).toLowerCase().includes("pending") ||
          String(rawMsg).toLowerCase().includes("verification"));
      const msg = isPendingBlock
        ? "Your account is pending approval. Please contact the administrator."
        : rawMsg;
      if (
        import.meta.env.DEV &&
        error?.status !== 401 &&
        error?.status !== 403 &&
        !rawMsg.includes("pending") &&
        !rawMsg.includes("approval")
      ) {
        console.error("[Auth] Login error:", error);
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginWithSession = (userData, userToken) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    setToken(userToken);
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
  };

  const register = async (userData) => {
    try {
      setLoading(true);

      const response = await authService.register(userData);
      const data = response?.data ?? response?.result ?? response;

      // Nếu đăng ký kèm auto-login (trả về token)
      const token = data?.token ?? response?.token;
      const userObj = data?.user ?? data?.userInfo ?? response?.user ?? data;
      if (token && userObj && typeof userObj === "object") {
        const normalized = normalizeUser(userObj);
        setUser(normalized);
        setToken(token);
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
      }

      return { success: true, data: response };
    } catch (error) {
      const msg =
        error?.message ??
        error?.data?.message ??
        error?.data?.msg ??
        "Registration failed.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(userData);

      // BE trả về ApiResponse<UserResponse> — user data nằm trong result, data, hoặc response trực tiếp
      const updatedUser =
        response?.result ??
        response?.data ??
        response?.user ??
        (response?.id || response?.email ? response : null);

      if (updatedUser && typeof updatedUser === "object") {
        const normalized = normalizeUser(updatedUser);
        setUser(normalized);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
        return { success: true, data: normalized };
      }

      // Nếu không có user data trong response nhưng request thành công (2xx), vẫn fetch lại profile
      try {
        const profileRes = await userService.getProfile();
        const data = profileRes?.data ?? profileRes?.result ?? profileRes;
        const profileUser =
          data?.user ??
          data?.userInfo ??
          (data?.id || data?.email ? data : null);
        if (profileUser) {
          const normalized = normalizeUser(profileUser);
          setUser(normalized);
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
          return { success: true, data: normalized };
        }
      } catch (_) {}

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      const msg =
        error?.message ??
        error?.data?.message ??
        error?.data?.msg ??
        "Update failed.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profileRes = await userService.getProfile();
      const data = profileRes?.data ?? profileRes?.result ?? profileRes;
      const profileUser =
        data?.user ??
        data?.userInfo ??
        (data?.id || data?.email ? data : null);
      if (profileUser && typeof profileUser === "object") {
        const normalized = normalizeUser(profileUser);
        setUser(normalized);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalized));
        return { success: true, data: normalized };
      }
      return { success: false, message: "Profile data not found." };
    } catch (error) {
      const msg =
        error?.message ??
        error?.data?.message ??
        error?.data?.msg ??
        "Failed to refresh profile.";
      return { success: false, message: msg };
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
        message: error.message || "Change password failed.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      if (error?.status !== 404) {
        console.error("Logout error:", error);
      }
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER);
    }
  };

  const isAuthenticated = () => !!token && !!user;

  // Lắng nghe sự kiện logout bắt buộc (401 từ axiosConfig) để đồng bộ header/session
  useEffect(() => {
    const handleForcedLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("basauycle-auth-logout", handleForcedLogout);
    return () => {
      window.removeEventListener("basauycle-auth-logout", handleForcedLogout);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      loginWithSession,
      register,
      updateProfile,
      refreshProfile,
      changePassword,
      logout,
      isAuthenticated,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

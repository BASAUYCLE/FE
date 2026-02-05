import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { userService } from "../services";

const WishlistContext = createContext(null);
const STORAGE_KEY_PREFIX = "basauycle-wishlist";

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

function loadWishlistFromStorage(userId) {
  try {
    const key = getStorageKey(userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [];
}

function saveWishlistToStorage(userId, items) {
  try {
    const key = getStorageKey(userId);
    if (Array.isArray(items) && items.length > 0) {
      localStorage.setItem(key, JSON.stringify(items));
    } else {
      localStorage.removeItem(key);
    }
  } catch (_) {}
}

export function WishlistProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const userId = user?.id ?? user?.email ?? null;
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const authenticated = isAuthenticated?.() ?? !!(token && user);

  // Clear wishlist and storage when user logs out
  useEffect(() => {
    if (!authenticated) {
      setWishlist([]);
      saveWishlistToStorage(null, []);
    }
  }, [authenticated]);

  // Normalize API response: axios returns response.data, backend may use data / wishlist / array
  const normalizeWishlist = useCallback((response) => {
    const raw = response?.data ?? response?.wishlist ?? response;
    return Array.isArray(raw) ? raw : [];
  }, []);

  // Fetch wishlist from backend when authenticated (chỉ gọi khi BE đã có GET /api/users/wishlist)
  // Set VITE_USE_WISHLIST_API=true trong .env khi backend đã implement wishlist API
  const useWishlistApi = import.meta.env.VITE_USE_WISHLIST_API === "true";

  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;
    const cached = loadWishlistFromStorage(userId);
    if (cached.length > 0) setWishlist(cached);

    if (!useWishlistApi) {
      setLoading(false);
      return;
    }

    setLoading(true);
    userService
      .getWishlist()
      .then((response) => {
        if (cancelled) return;
        const list = normalizeWishlist(response);
        setWishlist(list);
        saveWishlistToStorage(userId, list);
      })
      .catch(() => {
        if (!cancelled && cached.length > 0) {
          setWishlist(cached);
        } else if (!cancelled) {
          setWishlist([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, userId, normalizeWishlist, useWishlistApi]);

  const addToWishlist = useCallback(
    async (product) => {
      if (!authenticated) return;
      const itemId = product?.id ?? product;
      const productObj =
        typeof product === "object" && product !== null
          ? product
          : { id: itemId };
      if (!useWishlistApi) {
        setWishlist((prev) => {
          if (
            prev.some((p) => p.id === itemId || String(p.id) === String(itemId))
          )
            return prev;
          const next = [...prev, { ...productObj, addedAt: Date.now() }];
          saveWishlistToStorage(userId, next);
          return next;
        });
        return;
      }
      try {
        await userService.addToWishlist(itemId);
        const response = await userService.getWishlist();
        const list = normalizeWishlist(response);
        setWishlist(list);
        saveWishlistToStorage(userId, list);
      } catch {
        setWishlist((prev) => {
          if (
            prev.some((p) => p.id === itemId || String(p.id) === String(itemId))
          )
            return prev;
          const next = [...prev, { ...productObj, addedAt: Date.now() }];
          saveWishlistToStorage(userId, next);
          return next;
        });
      }
    },
    [authenticated, userId, normalizeWishlist, useWishlistApi],
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!authenticated) return;
      if (!useWishlistApi) {
        setWishlist((prev) => {
          const next = prev.filter(
            (p) => p.id !== productId && String(p.id) !== String(productId),
          );
          saveWishlistToStorage(userId, next);
          return next;
        });
        return;
      }
      try {
        await userService.removeFromWishlist(productId);
        const response = await userService.getWishlist();
        const list = normalizeWishlist(response);
        setWishlist(list);
        saveWishlistToStorage(userId, list);
      } catch {
        setWishlist((prev) => {
          const next = prev.filter(
            (p) => p.id !== productId && String(p.id) !== String(productId),
          );
          saveWishlistToStorage(userId, next);
          return next;
        });
      }
    },
    [authenticated, userId, normalizeWishlist, useWishlistApi],
  );

  const isInWishlist = useCallback(
    (productId) =>
      wishlist.some(
        (p) => p.id === productId || String(p.id) === String(productId),
      ),
    [wishlist],
  );

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isAuthenticated: authenticated,
    }),
    [
      wishlist,
      loading,
      authenticated,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

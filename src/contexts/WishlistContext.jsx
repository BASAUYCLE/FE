import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { message } from "antd";
import { useAuth } from "./AuthContext";
import { wishlistService } from "../services";
import { formatCurrency } from "../utils/formatCurrency";
import { isProductBlockedForWishlist } from "../utils/postAvailability";

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
  const userId = user?.id ?? user?.userId ?? user?.email ?? null;
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const authenticated = isAuthenticated?.() ?? !!(token && user);

  // Xóa wishlist và storage khi user đăng xuất
  useEffect(() => {
    if (!authenticated) {
      setWishlist([]);
      saveWishlistToStorage(null, []);
    }
  }, [authenticated]);

  // Chuẩn hóa response API từ /wishlist endpoint (BE có thể trả postId, post: { ... })
  const normalizeWishlist = useCallback((response) => {
    const result = response?.result ?? response?.data ?? response;
    const list = Array.isArray(result) ? result : [];
    return list.map((item) => {
      if (typeof item !== "object" || item === null) return item;
      const post = item.post ?? item;
      const id = item.postId ?? item.id ?? post?.postId ?? post?.id;
      const thumb =
        post?.images?.find((i) => i?.isThumbnail) ?? post?.images?.[0];
      const imageUrl =
        thumb?.imageUrl ?? thumb?.image_url ?? item.image ?? item.thumbnailUrl;

      const name =
        post?.bicycleName ??
        post?.bicycle_name ??
        item.bicycleName ??
        item.name;

      const priceNum = post?.price ?? item.price ?? 0;
      const priceDisplay =
        typeof priceNum === "number"
          ? formatCurrency(priceNum)
          : String(priceNum ?? "0");

      const brand =
        post?.brandName ??
        post?.brand ??
        post?.brand_name ??
        post?.brandLabel ??
        post?.brand?.brandName ??
        item.brand ??
        null;

      const category =
        post?.category ??
        post?.categoryName ??
        post?.bicycleType ??
        post?.categoryLabel ??
        item.category ??
        null;

      const frameSize = post?.frameSize ?? post?.size ?? item.frameSize ?? null;
      const modelYear =
        post?.modelYear ??
        post?.model_year ??
        post?.year ??
        item.modelYear ??
        item.year ??
        null;

      const baseSpecs = {
        ...(post?.specs ?? {}),
        ...(item.specs ?? {}),
      };

      return {
        ...item,
        id: id ?? item.id,
        postId: item.postId ?? id,
        name: name ?? item.name ?? "Untitled",
        image: imageUrl ?? item.image,
        price: priceDisplay,
        rawPrice: typeof priceNum === "number" ? priceNum : undefined,
        brand,
        category: category ?? item.category,
        frameSize,
        modelYear,
        specs: {
          ...baseSpecs,
          brand,
          category,
          frameSize,
          modelYear,
        },
      };
    });
  }, []);

  // Gọi API wishlist khi đã đăng nhập
  const useWishlistApi = import.meta.env.VITE_USE_WISHLIST_API !== "false"; // Mặc định là true

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
    wishlistService
      .getMyWishlist()
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
  }, [authenticated, userId, useWishlistApi, normalizeWishlist]);

  const addToWishlist = useCallback(
    async (product) => {
      if (!authenticated) return;
      const itemId = product?.postId ?? product?.id ?? product;
      const postId = itemId != null ? Number(itemId) : NaN;
      if (typeof postId !== "number" || !Number.isFinite(postId)) {
        console.warn("[Wishlist] Invalid postId for addToWishlist:", product);
        return;
      }
      const productObj =
        typeof product === "object" && product !== null
          ? product
          : { id: postId, postId };
      if (isProductBlockedForWishlist(productObj)) {
        message.warning(
          "This listing can’t be added to your wishlist because it’s in a transaction or already sold.",
        );
        return;
      }
      if (!useWishlistApi) {
        setWishlist((prev) => {
          if (
            prev.some(
              (p) =>
                (p.id ?? p.postId) === postId ||
                String(p.id ?? p.postId) === String(postId),
            )
          )
            return prev;
          const next = [
            ...prev,
            { ...productObj, id: postId, postId, addedAt: Date.now() },
          ];
          saveWishlistToStorage(userId, next);
          return next;
        });
        return;
      }
      try {
        await wishlistService.addToWishlist(postId);
        const response = await wishlistService.getMyWishlist();
        const list = normalizeWishlist(response);
        setWishlist(list);
        saveWishlistToStorage(userId, list);
      } catch (err) {
        const msg =
          err?.message ?? err?.data?.message ?? "Could not add to wishlist.";
        message.error(msg);
        setWishlist((prev) => {
          if (
            prev.some(
              (p) =>
                (p.id ?? p.postId) === postId ||
                String(p.id ?? p.postId) === String(postId),
            )
          )
            return prev;
          const next = [
            ...prev,
            { ...productObj, id: postId, postId, addedAt: Date.now() },
          ];
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
      const postId = productId != null ? Number(productId) : NaN;
      const matchId = (p) =>
        (p.postId ?? p.id) === productId ||
        (p.postId ?? p.id) === postId ||
        String(p.postId ?? p.id) === String(productId);
      if (!useWishlistApi) {
        setWishlist((prev) => {
          const next = prev.filter((p) => !matchId(p));
          saveWishlistToStorage(userId, next);
          return next;
        });
        return;
      }
      if (!Number.isFinite(postId)) return;
      try {
        await wishlistService.removeFromWishlist(postId);
        const response = await wishlistService.getMyWishlist();
        const list = normalizeWishlist(response);
        setWishlist(list);
        saveWishlistToStorage(userId, list);
      } catch {
        setWishlist((prev) => {
          const next = prev.filter((p) => !matchId(p));
          saveWishlistToStorage(userId, next);
          return next;
        });
      }
    },
    [authenticated, userId, normalizeWishlist, useWishlistApi],
  );

  const isInWishlist = useCallback(
    (productId) => {
      if (productId == null) return false;
      const id = Number(productId);
      return wishlist.some((p) => {
        const pid = p.postId ?? p.id;
        return (
          pid === productId || pid === id || String(pid) === String(productId)
        );
      });
    },
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

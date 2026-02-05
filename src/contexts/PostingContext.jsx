import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { POSTING_STATUS } from "../constants/postingStatus";
import postService from "../services/postService";
import { formatCurrency } from "../utils/formatCurrency";

const PostingContext = createContext(null);
const STORAGE_KEY_PREFIX = "basauycle-postings";

function getStorageKey(sellerId) {
  return sellerId != null ? `${STORAGE_KEY_PREFIX}-${sellerId}` : null;
}

function savePostingsToStorage(sellerId, list) {
  try {
    const key = getStorageKey(sellerId);
    if (!key) return;
    if (Array.isArray(list) && list.length > 0) {
      localStorage.setItem(key, JSON.stringify(list));
    } else {
      localStorage.removeItem(key);
    }
  } catch (_) {}
}

function loadPostingsFromStorage(sellerId) {
  try {
    const key = getStorageKey(sellerId);
    if (!key) return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function generatePostingId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `POST-2024-${n}`;
}

/**
 * Build posting from Post form data.
 * Payload: { bikeName, brand, category, frameSize, frameMaterial, price, imageUrl?, imageUrls?, status? }
 * sellerId: current user id (or email) so we can hide Buy Now on own listings.
 */
function buildPosting(
  payload,
  status = POSTING_STATUS.PENDING_REVIEW,
  sellerId = null,
) {
  const now = new Date();
  const imageUrls =
    payload.imageUrls?.length > 0
      ? payload.imageUrls
      : payload.imageUrl
        ? [payload.imageUrl]
        : [];
  return {
    id: payload.id ?? payload.backendPostId ?? `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postingId: payload.postingId ?? payload.backendPostId ?? generatePostingId(),
    bikeName: payload.bikeName || "Untitled",
    brand: payload.brand,
    brandId: payload.brandId,
    biketype: payload.biketype ?? null,
    category: payload.category,
    categoryId: payload.categoryId,
    frameSize: payload.frameSize || "",
    frameMaterial: payload.frameMaterial,
    groupset: payload.groupset,
    brakeType: payload.brakeType,
    modelYear: payload.modelYear,
    color: payload.color,
    description: payload.description,
    price: payload.price || "",
    priceDisplay: payload.priceDisplay ?? (payload.price ? `$${payload.price}` : ""),
    imageUrl: payload.imageUrl || imageUrls[0] || null,
    imageUrls,
    status: payload.postStatus ?? payload.status ?? status,
    rejectionReason: payload.rejectionReason ?? null,
    sellerId: sellerId ?? payload.sellerId ?? null,
    views: payload.views ?? 0,
    createdAt: payload.createdAt ?? now.toISOString(),
    updatedAt: payload.updatedAt ?? now.toISOString(),
  };
}

export function PostingProvider({ children }) {
  const [postings, setPostings] = useState([]);
  const [publicPostings, setPublicPostings] = useState([]);

  const addPosting = useCallback(
    (payload, status = POSTING_STATUS.PENDING_REVIEW, sellerId = null) => {
      const posting = buildPosting(payload, status, sellerId);
      setPostings((prev) => {
        const next = [posting, ...prev];
        savePostingsToStorage(sellerId, next);
        return next;
      });
      return posting;
    },
    [],
  );

  const updatePostingStatus = useCallback((id, status) => {
    setPostings((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
      );
      const sellerId = prev.find((p) => p.id === id)?.sellerId;
      if (sellerId != null) savePostingsToStorage(sellerId, next);
      return next;
    });
  }, []);

  /** Gọi API cập nhật trạng thái (Ẩn/Hiển thị) rồi cập nhật state. Dùng khi member bấm Ẩn/Hiển thị để Marketplace cập nhật theo. */
  const updatePostingStatusOnServer = useCallback(async (id, status) => {
    const postId = id != null ? Number(id) || id : null;
    if (postId == null) return Promise.reject(new Error("Không có ID bài đăng."));
    await postService.updatePostStatus(postId, status);
    setPostings((prev) => {
      const next = prev.map((p) =>
        p.id === id || p.id === postId || p.backendPostId === postId
          ? { ...p, status, updatedAt: new Date().toISOString() }
          : p,
      );
      const sellerId = prev.find((p) => p.id === id || p.id === postId || p.backendPostId === postId)?.sellerId;
      if (sellerId != null) savePostingsToStorage(sellerId, next);
      return next;
    });
  }, []);

  const updatePosting = useCallback((id, payload) => {
    setPostings((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const imageUrls =
          payload.imageUrls?.length > 0
            ? payload.imageUrls
            : payload.imageUrl
              ? [payload.imageUrl]
              : p.imageUrls;
        return {
          ...p,
          ...payload,
          imageUrls,
          imageUrl: payload.imageUrl ?? imageUrls[0] ?? p.imageUrl,
          updatedAt: new Date().toISOString(),
        };
      });
      const sellerId = prev.find((p) => p.id === id)?.sellerId;
      if (sellerId != null) savePostingsToStorage(sellerId, next);
      return next;
    });
  }, []);

  /** Xóa bài đăng: gọi API DELETE /posts/:postId rồi cập nhật state. Trả về Promise (resolve khi thành công, reject khi API lỗi). */
  const deletePosting = useCallback(async (id) => {
    const postId = id != null ? Number(id) || id : null;
    if (postId == null) return Promise.reject(new Error("Không có ID bài đăng."));
    await postService.deletePost(postId);
    setPostings((prev) => {
      const removed = prev.find((p) => p.id === id || p.id === postId || p.backendPostId === postId);
      const next = prev.filter((p) => p.id !== id && p.id !== postId && p.backendPostId !== postId);
      if (removed?.sellerId != null) savePostingsToStorage(removed.sellerId, next);
      return next;
    });
  }, []);

  /**
   * Tải tin đăng của seller từ BE (luồng 2 bước: PENDING → ADMIN_APPROVED → AVAILABLE | REJECTED).
   * Gọi khi vào Quản lý tin đăng để đồng bộ với database.
   */
  /**
   * Trích mảng bài đăng từ response (hỗ trợ result, data, content - Spring Page, v.v.)
   */
  const extractListFromResponse = useCallback((res) => {
    if (!res || typeof res !== "object") return [];
    if (Array.isArray(res)) return res;
    const r = res.result ?? res.data ?? res;
    if (Array.isArray(r)) return r;
    if (r && typeof r === "object" && Array.isArray(r.content)) return r.content;
    const inner = res.result ?? res.data;
    if (inner && typeof inner === "object" && Array.isArray(inner.content)) return inner.content;
    return [];
  }, []);

  /** Map một row từ API (posts/seller hoặc posts/status) sang posting object */
  const mapRowToPosting = useCallback((row) => {
    const postId = row.postId ?? row.post_id;
    const images = row?.images ?? [];
    const thumb = images.find((i) => i?.isThumbnail);
    const imageUrl = thumb?.imageUrl ?? thumb?.image_url ?? images[0]?.imageUrl ?? images[0]?.image_url ?? null;
    const imageUrls = images.map((i) => i?.imageUrl ?? i?.image_url).filter(Boolean);
    const price = row.price;
    const postStatus = row.postStatus ?? row.post_status ?? POSTING_STATUS.PENDING;
    const sellerIdRow = row.sellerId ?? row.seller_id;
    return buildPosting(
      {
        id: postId,
        backendPostId: postId,
        postingId: postId,
        bikeName: row.bicycleName ?? row.bicycle_name,
        brand: row.brandName ?? row.brand_name,
        brandId: row.brandId ?? row.brand_id,
        category: row.categoryName ?? row.category_name,
        categoryId: row.categoryId ?? row.category_id,
        frameSize: row.size,
        frameMaterial: row.frameMaterial ?? row.frame_material,
        groupset: row.groupset,
        brakeType: row.brakeType ?? row.brake_type,
        modelYear: row.modelYear ?? row.model_year,
        color: row.bicycleColor ?? row.bicycle_color,
        description: row.bicycleDescription ?? row.bicycle_description,
        price,
        priceDisplay: typeof price === "number" ? formatCurrency(price) : (row.priceDisplay ?? ""),
        imageUrl,
        imageUrls,
        postStatus,
        rejectionReason: row.rejectionReason ?? row.rejection_reason ?? null,
        sellerId: sellerIdRow,
        views: row.views,
        createdAt: row.createdAt ?? row.created_at,
        updatedAt: row.updatedAt ?? row.updated_at,
      },
      postStatus,
      sellerIdRow,
    );
  }, []);

  /**
   * Tải tin đăng từ API; nếu API lỗi hoặc chưa có endpoint thì dùng cache localStorage (tránh mất bài khi reload).
   * Luôn gộp với cache để hiển thị đủ bài (kể cả khi API trả về thiếu hoặc phân trang).
   */
  const loadPostingsBySeller = useCallback(async (sellerId) => {
    if (!sellerId) return [];
    const cached = loadPostingsFromStorage(sellerId);
    try {
      const res = await postService.getPostsBySeller(sellerId);
      const list = extractListFromResponse(res);
      const mapped = list.map(mapRowToPosting);
      // Gộp API + cache + state hiện tại để hiển thị đủ bài (API có thể trả 1 trang hoặc thiếu)
      setPostings((prev) => {
        const byId = new Map(mapped.map((p) => [p.id, p]));
        [...cached, ...prev].forEach((p) => {
          if (p?.id != null && !byId.has(p.id)) byId.set(p.id, p);
        });
        const merged = [...byId.values()].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        savePostingsToStorage(sellerId, merged);
        return merged;
      });
      return mapped;
    } catch (err) {
      console.warn("[PostingContext] loadPostingsBySeller failed, using cache:", err?.message);
      const cached = loadPostingsFromStorage(sellerId);
      if (cached.length > 0) {
        setPostings(cached);
        return cached;
      }
      throw err;
    }
  }, [extractListFromResponse, mapRowToPosting]);

  /**
   * Tải tin đăng công khai (đã duyệt / đang hiển thị) cho Home & Marketplace.
   * Thử 1) GET /posts rồi lọc status; 2) nếu lỗi thì thử GET /posts/status/AVAILABLE và ADMIN_APPROVED.
   */
  const loadPublicPostings = useCallback(async () => {
    const allowedStatuses = [POSTING_STATUS.AVAILABLE, POSTING_STATUS.ADMIN_APPROVED];
    const normalizeStatus = (s) => (s ? String(s).toUpperCase() : "");

    const filterAndMap = (list) => {
      const byId = new Map();
      (list || []).forEach((row) => {
        const status = normalizeStatus(row.postStatus ?? row.post_status ?? row.status);
        if (!allowedStatuses.includes(status)) return;
        const p = mapRowToPosting(row);
        if (p?.id != null) byId.set(p.id, p);
      });
      return [...byId.values()];
    };

    try {
      const res = await postService.getPosts();
      const list = extractListFromResponse(res);
      const merged = filterAndMap(list);
      if (merged.length > 0) {
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setPublicPostings(merged);
        return merged;
      }
    } catch (_) {}

    try {
      const [resAvailable, resApproved] = await Promise.all([
        postService.getPostsByStatus(POSTING_STATUS.AVAILABLE),
        postService.getPostsByStatus(POSTING_STATUS.ADMIN_APPROVED),
      ]);
      const listA = extractListFromResponse(resAvailable);
      const listB = extractListFromResponse(resApproved);
      const byId = new Map();
      [...listA, ...listB].forEach((row) => {
        const p = mapRowToPosting(row);
        if (p?.id != null) byId.set(p.id, p);
      });
      const merged = [...byId.values()].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
      setPublicPostings(merged);
      return merged;
    } catch (err) {
      console.warn("[PostingContext] loadPublicPostings failed:", err?.message);
      setPublicPostings([]);
      return [];
    }
  }, [extractListFromResponse, mapRowToPosting]);

  const getPostingById = useCallback(
    (id) => {
      if (id == null) return null;
      const match = (p) => p.id == id || (typeof id === "string" && !isNaN(Number(id)) && p.id === Number(id));
      return (
        postings.find(match) ??
        publicPostings.find(match) ??
        null
      );
    },
    [postings, publicPostings],
  );

  const value = useMemo(
    () => ({
      postings,
      publicPostings,
      addPosting,
      updatePostingStatus,
      updatePostingStatusOnServer,
      updatePosting,
      deletePosting,
      loadPostingsBySeller,
      loadPublicPostings,
      getPostingById,
    }),
    [
      postings,
      publicPostings,
      addPosting,
      updatePostingStatus,
      updatePostingStatusOnServer,
      updatePosting,
      deletePosting,
      loadPostingsBySeller,
      loadPublicPostings,
      getPostingById,
    ],
  );
  return (
    <PostingContext.Provider value={value}>{children}</PostingContext.Provider>
  );
}

export function usePostings() {
  const ctx = useContext(PostingContext);
  if (!ctx) throw new Error("usePostings must be used within PostingProvider");
  return ctx;
}

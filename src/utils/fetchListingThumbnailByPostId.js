import postService from "../services/postService";
import orderService from "../services/orderService";
import { pickListingThumbnailUrl } from "./listingThumbnailUrl";

/** Dedupe concurrent requests + memo kết quả theo postId (cùng session). */
const cache = new Map();
const inflight = new Map();

const orderPostIdCache = new Map();
const orderPostIdInflight = new Map();

/**
 * Khi API dispute list chỉ có orderId (không có postId) — lấy postId từ GET /orders/{id}.
 * @param {string|number|null|undefined} orderId
 * @returns {Promise<string|null>}
 */
export async function fetchPostIdFromOrderId(orderId) {
  if (orderId == null || String(orderId).trim() === "") return null;
  const key = String(orderId);
  if (orderPostIdCache.has(key)) return orderPostIdCache.get(key);
  if (orderPostIdInflight.has(key)) return orderPostIdInflight.get(key);

  const promise = (async () => {
    try {
      const res = await orderService.getById(orderId);
      const row = res?.result ?? res?.data ?? res;
      const pid =
        row?.postId ??
        row?.post_id ??
        row?.bikeId ??
        row?.bike_id ??
        row?.post?.postId ??
        row?.post?.id ??
        null;
      const out = pid != null ? String(pid) : null;
      orderPostIdCache.set(key, out);
      return out;
    } catch {
      orderPostIdCache.set(key, null);
      return null;
    } finally {
      orderPostIdInflight.delete(key);
    }
  })();

  orderPostIdInflight.set(key, promise);
  return promise;
}

/** Chuẩn hóa payload GET /images/post/{id} (ApiResponse, mảng trực tiếp, hoặc { images: [] }). */
function unwrapImagesArray(res) {
  if (Array.isArray(res)) return res;
  const top = res?.result ?? res?.data ?? res;
  if (Array.isArray(top)) return top;
  if (top && typeof top === "object") {
    const inner =
      top.images ??
      top.bicycleImages ??
      top.imageList ??
      top.content ??
      top.items;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

/**
 * Lấy URL thumbnail tin đăng theo postId (khi API dispute không kèm ảnh).
 * Dùng GET /images/post/{postId} rồi pickListingThumbnailUrl.
 *
 * @param {string|number|null|undefined} postId
 * @returns {Promise<string|null>}
 */
export async function fetchListingThumbnailByPostId(postId) {
  if (postId == null || String(postId).trim() === "") return null;
  const key = String(postId);
  if (cache.has(key)) return cache.get(key);
  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const res = await postService.getPostImages(postId);
      const arr = unwrapImagesArray(res);
      const url = pickListingThumbnailUrl({ images: arr });
      cache.set(key, url);
      return url;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

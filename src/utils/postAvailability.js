import { POSTING_STATUS } from "../constants/postingStatus";

/** Lấy trạng thái bài đăng từ nhiều shape (card, API, context). */
export function getPostStatusUpper(item) {
  if (!item || typeof item !== "object") return "";
  const s =
    item.postStatus ??
    item.status ??
    item.postingStatus ??
    item.post?.postStatus ??
    item.post?.status ??
    "";
  return String(s).trim().toUpperCase();
}

/**
 * Đang có giao dịch (PROCESSING / DEPOSITED) hoặc đã bán — không thêm wishlist / không mua thêm.
 */
export function isPostUnavailableForTransaction(statusUpper) {
  if (!statusUpper) return false;
  return (
    statusUpper === POSTING_STATUS.PROCESSING ||
    statusUpper === POSTING_STATUS.DEPOSITED ||
    statusUpper === POSTING_STATUS.SOLD
  );
}

export function isProductBlockedForWishlist(product) {
  return isPostUnavailableForTransaction(getPostStatusUpper(product));
}

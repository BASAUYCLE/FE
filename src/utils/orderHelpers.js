import { ORDER_STATUS } from "../constants/orderStatus";

export function isOrderExpired(order) {
  if (!order?.expiresAt) return false;
  return new Date(order.expiresAt) <= new Date();
}

export function getExpirationLabel(expiresAt) {
  if (!expiresAt) return "";
  const end = new Date(expiresAt);
  const now = new Date();
  const diffMs = end - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    const daysAgo = Math.abs(diffDays);
    if (daysAgo === 0) return "Expired today";
    if (daysAgo === 1) return "Expired yesterday";
    return `Expired ${daysAgo}d ago`;
  }
  if (diffHours < 24) return `Expires in ${diffHours}h`;
  return `Expires in ${diffDays}d`;
}

/**
 * Trả về status hiển thị.
 * Với hệ thống mới không có expiresAt-based EXPIRED nữa.
 */
export function getEffectiveStatus(order) {
  return order?.status ?? ORDER_STATUS.DEPOSITED;
}

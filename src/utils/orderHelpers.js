import { ORDER_STATUS } from "../constants/orderStatus";

/**
 * @param {{ expiresAt: string|Date }} order
 * @returns {boolean}
 */
export function isOrderExpired(order) {
  if (!order?.expiresAt) return false;
  return new Date(order.expiresAt) <= new Date();
}

/**
 * @param {string|Date} expiresAt
 * @returns {string} e.g. "Expires in 12h", "Expires in 2d", "Expired yesterday"
 */
export function getExpirationLabel(expiresAt) {
  if (!expiresAt) return "";
  const end = new Date(expiresAt);
  const now = new Date();
  const diffMs = end - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
 * Normalize status: PAID stays PAID; if past expiresAt, treat as EXPIRED
 * @param {{ status: string, expiresAt: string|Date }} order
 */
export function getEffectiveStatus(order) {
  if (order?.status === ORDER_STATUS.PAID) return ORDER_STATUS.PAID;
  if (isOrderExpired(order)) return ORDER_STATUS.EXPIRED;
  return order?.status || ORDER_STATUS.DEPOSIT_AWAITING;
}

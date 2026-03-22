import { ORDER_STATUS } from "../constants/orderStatus";

/** Đơn cọc: deposit < total (theo logic BE DisputeService). */
export function isDepositOrder(order) {
  const t = Number(order?.totalPrice ?? 0);
  const d = Number(order?.depositAmount ?? 0);
  return t > 0 && d < t - 1e-9;
}

/**
 * BE: SHIPPING + đơn cọc có thể mở dispute (từ chối nhận COD).
 * DELIVERED + đã trả full (không còn cọc) có thể mở dispute trong cửa sổ.
 */
export function canBuyerOpenDispute(order) {
  if (!order) return false;
  const s = order.status;
  const dep = isDepositOrder(order);
  if (s === ORDER_STATUS.SHIPPING && dep) return true;
  if (s === ORDER_STATUS.DELIVERED && !dep) return true;
  return false;
}

/** Hạn mặc định nếu không đọc system-config (BE key DISPUTE_WINDOW_DAYS). */
export function defaultDisputeWindowDays() {
  return 3;
}

export function parseDisputeWindowEnd(order, windowDays = defaultDisputeWindowDays()) {
  const raw = order?.deliveredAt ?? order?.shippedAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + Number(windowDays) * 86400000);
}

export function isLikelyInsideDisputeWindow(order, windowDays = defaultDisputeWindowDays()) {
  const end = parseDisputeWindowEnd(order, windowDays);
  if (!end) return true;
  return Date.now() <= end.getTime();
}

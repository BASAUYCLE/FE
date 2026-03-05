/** Payment – lịch sử thanh toán, refund */

/** Field của Payment */
export const PAYMENT_FIELDS = [
  "id", "bookingId", "userId", "amount", "currency", "method", "status", "transactionId", "createdAt", "updatedAt",
];

/** Payment rỗng */
export function getDefaultPayment() {
  return {
    id: null,
    bookingId: null,
    userId: null,
    amount: null,
    currency: "VND",
    method: "",
    status: "PENDING",
    transactionId: "",
    createdAt: null,
    updatedAt: null,
  };
}

/** Chuẩn hóa payment từ response API */
export function normalizePayment(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    bookingId: raw.bookingId ?? raw.booking_id,
    userId: raw.userId ?? raw.user_id,
    amount: raw.amount,
    currency: raw.currency ?? "VND",
    method: raw.method ?? raw.paymentMethod,
    status: raw.status ?? "PENDING",
    transactionId: raw.transactionId ?? raw.transaction_id,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export default normalizePayment;

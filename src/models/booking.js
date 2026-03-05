/** Booking – thuê xe, chuẩn hóa từ API */

/** Field của Booking */
export const BOOKING_FIELDS = [
  "id", "bikeId", "userId", "startDate", "endDate", "status", "totalPrice", "createdAt", "updatedAt",
];

/** Booking rỗng */
export function getDefaultBooking() {
  return {
    id: null,
    bikeId: null,
    userId: null,
    startDate: "",
    endDate: "",
    status: "PENDING",
    totalPrice: null,
    createdAt: null,
    updatedAt: null,
  };
}

/** Chuẩn hóa booking từ response API */
export function normalizeBooking(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    bikeId: raw.bikeId ?? raw.bike_id,
    userId: raw.userId ?? raw.user_id,
    startDate: raw.startDate ?? raw.start_date,
    endDate: raw.endDate ?? raw.end_date,
    status: raw.status ?? "PENDING",
    totalPrice: raw.totalPrice ?? raw.total_price,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export default normalizeBooking;

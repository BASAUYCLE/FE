/**
 * Mock bookings data for mockAPI when backend is unavailable.
 * Format tương thích với mockStaffApi.getBookingsByStation.
 */
export const MOCK_BOOKINGS = [
  { bookingId: 1, vehicleModel: "Model A", startAt: "2024-01-01", endAt: "2024-01-05", totalPrice: 500000, status: "CONFIRMED" },
  { bookingId: 2, vehicleModel: "Model B", startAt: "2024-01-10", endAt: "2024-01-12", totalPrice: 300000, status: "PENDING" },
  { bookingId: 3, vehicleModel: "Model C", startAt: "2024-01-15", endAt: "2024-01-20", totalPrice: 800000, status: "COMPLETED" },
  { bookingId: 4, vehicleModel: "Model D", startAt: "2024-01-22", endAt: "2024-01-25", totalPrice: 450000, status: "CANCELLED" },
  { bookingId: 5, vehicleModel: "Model E", startAt: "2024-02-01", endAt: "2024-02-07", totalPrice: 600000, status: "CONFIRMED" },
  { bookingId: 6, vehicleModel: "Model F", startAt: "2024-02-10", endAt: "2024-02-12", totalPrice: 350000, status: "PENDING" },
  { bookingId: 7, vehicleModel: "Model G", startAt: "2024-02-15", endAt: "2024-02-18", totalPrice: 400000, status: "COMPLETED" },
  { bookingId: 8, vehicleModel: "Model H", startAt: "2024-02-20", endAt: "2024-02-22", totalPrice: 250000, status: "CONFIRMED" },
  { bookingId: 9, vehicleModel: "Model I", startAt: "2024-03-01", endAt: "2024-03-05", totalPrice: 550000, status: "PENDING" },
  { bookingId: 10, vehicleModel: "Model J", startAt: "2024-03-10", endAt: "2024-03-15", totalPrice: 700000, status: "CONFIRMED" },
];

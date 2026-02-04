import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.BOOKINGS;

const bookingService = {
  createBooking: (bookingData) => axiosInstance.post(E.CREATE, bookingData),
  getMyBookings: (params = {}) => axiosInstance.get(E.LIST, { params }),
  getBookingById: (bookingId) => axiosInstance.get(E.BY_ID(bookingId)),
  cancelBooking: (bookingId, reason = "") => axiosInstance.put(E.CANCEL(bookingId), { reason }),
  updateBookingStatus: (bookingId, status) => axiosInstance.put(E.UPDATE_STATUS(bookingId), { status }),
  getBookingStats: () => axiosInstance.get(E.STATS),
  extendBooking: (bookingId, newEndDate) => axiosInstance.put(E.EXTEND(bookingId), { newEndDate }),
  rateBooking: (bookingId, ratingData) => axiosInstance.post(E.RATE(bookingId), ratingData),
};

export default bookingService;

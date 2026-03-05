import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.BOOKINGS;

const bookingService = {
  createBooking: (bookingData) => axiosInstance.post(ENDPOINTS.CREATE, bookingData),
  getMyBookings: (params = {}) => axiosInstance.get(ENDPOINTS.LIST, { params }),
  getBookingById: (bookingId) => axiosInstance.get(ENDPOINTS.BY_ID(bookingId)),
  cancelBooking: (bookingId, reason = "") => axiosInstance.put(ENDPOINTS.CANCEL(bookingId), { reason }),
  updateBookingStatus: (bookingId, status) => axiosInstance.put(ENDPOINTS.UPDATE_STATUS(bookingId), { status }),
  getBookingStats: () => axiosInstance.get(ENDPOINTS.STATS),
  extendBooking: (bookingId, newEndDate) => axiosInstance.put(ENDPOINTS.EXTEND(bookingId), { newEndDate }),
  rateBooking: (bookingId, ratingData) => axiosInstance.post(ENDPOINTS.RATE(bookingId), ratingData),
};

export default bookingService;

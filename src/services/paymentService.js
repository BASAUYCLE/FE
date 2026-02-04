import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.PAYMENTS;

const paymentService = {
  createPayment: (paymentData) => axiosInstance.post(E.CREATE, paymentData),
  getPaymentById: (paymentId) => axiosInstance.get(E.BY_ID(paymentId)),
  verifyPayment: (verificationData) => axiosInstance.post(E.VERIFY, verificationData),
  getPaymentHistory: (params = {}) => axiosInstance.get(E.HISTORY, { params }),
  requestRefund: (paymentId, reason = "") => axiosInstance.post(E.REFUND(paymentId), { reason }),
  getPaymentMethods: () => axiosInstance.get(E.METHODS),
};

export default paymentService;

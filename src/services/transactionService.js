import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.TRANSACTIONS || {};

const transactionService = {
  // GET /transactions - Lấy lịch sử giao dịch của user
  getHistory: (params = {}) =>
    axiosInstance.get("/transactions", { params }),

  // GET /transactions/{transactionId} - Chi tiết 1 giao dịch
  getById: (transactionId) =>
    axiosInstance.get(`/transactions/${transactionId}`),
};

export default transactionService;

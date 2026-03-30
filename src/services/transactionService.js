import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.TRANSACTIONS || {};

const transactionService = {
  // GET /transactions — user transaction history
  getHistory: (params = {}) =>
    axiosInstance.get(ENDPOINTS.LIST ?? "/transactions", { params }),

  // GET /transactions/{transactionId} - Chi tiết 1 giao dịch
  getById: (transactionId) =>
    axiosInstance.get(
      ENDPOINTS.BY_ID ? ENDPOINTS.BY_ID(transactionId) : `/transactions/${transactionId}`,
    ),

  /**
   * POST /transactions/withdraw — withdrawal request (min 50,000 VND, bank details).
   * @param {{ amount: number, bankName: string, bankAccountNumber: string, bankAccountHolder: string }} payload
   */
  requestWithdrawal: (payload) =>
    axiosInstance.post(ENDPOINTS.WITHDRAW ?? "/transactions/withdraw", payload),
};

export default transactionService;

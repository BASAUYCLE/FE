import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ADMIN = API_ENDPOINTS.ADMIN;

const adminService = {
  /** Revenue stats: period week | month | quarter */
  getRevenueStats: (period = "week") =>
    axiosInstance.get(ADMIN.REVENUE_STATS(period)),

  /** Inspection reports (admin) */
  getInspectionReports: (params = {}) =>
    axiosInstance.get(ADMIN.INSPECTION_REPORTS, { params }),

  /** Toàn bộ giao dịch của tất cả member (admin view) */
  getAllTransactions: (params = {}) =>
    axiosInstance.get(ADMIN.TRANSACTIONS, { params }),

  /** POST /admin/transactions/{id}/approve — approve withdrawal */
  approveWithdrawal: (transactionId) =>
    axiosInstance.post(ADMIN.TRANSACTION_WITHDRAW_APPROVE(transactionId)),

  /** POST /admin/transactions/{id}/reject — reject withdrawal */
  rejectWithdrawal: (transactionId) =>
    axiosInstance.post(ADMIN.TRANSACTION_WITHDRAW_REJECT(transactionId)),
};

export default adminService;

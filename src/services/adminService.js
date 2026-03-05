import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ADMIN = API_ENDPOINTS.ADMIN;

const adminService = {
  /** Thống kê doanh thu theo period: week | month | quarter */
  getRevenueStats: (period = "week") =>
    axiosInstance.get(ADMIN.REVENUE_STATS(period)),

  /** Danh sách báo cáo kiểm định (admin) */
  getInspectionReports: (params = {}) =>
    axiosInstance.get(ADMIN.INSPECTION_REPORTS, { params }),

  /** Toàn bộ giao dịch của tất cả member (admin view) */
  getAllTransactions: (params = {}) =>
    axiosInstance.get(ADMIN.TRANSACTIONS, { params }),
};

export default adminService;

import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.INSPECTION;

const inspectionService = {
  // GET /inspection/pending - Danh sách bài chờ kiểm định (ADMIN_APPROVED)
  getPendingInspections: (params = {}) =>
    axiosInstance.get(ENDPOINTS.PENDING, { params }),

  // POST /inspection/{postId}/submit - Nộp kết quả kiểm định
  submitInspection: (postId, payload) =>
    axiosInstance.post(ENDPOINTS.SUBMIT(postId), payload),

  // GET /inspection/{postId}/report - Chi tiết báo cáo kiểm định
  getInspectionReport: (postId) =>
    axiosInstance.get(ENDPOINTS.REPORT(postId)),

  // GET /inspection/disputes - Danh sách tranh chấp
  getDisputes: (params = {}) =>
    axiosInstance.get(ENDPOINTS.DISPUTES, { params }),

  // GET /inspection/completed - Danh sách kiểm định đã hoàn thành
  getCompletedInspections: (params = {}) =>
    axiosInstance.get(ENDPOINTS.COMPLETED, { params }),
};

export default inspectionService;

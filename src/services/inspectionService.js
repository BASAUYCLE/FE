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
};

export default inspectionService;

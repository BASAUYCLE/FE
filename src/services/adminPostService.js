import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.ADMIN_POSTS;

const adminPostService = {
  // GET /admin/posts - Lấy tất cả bài đăng
  getAllPosts: (params = {}) =>
    axiosInstance.get(ENDPOINTS.LIST, { params }),

  // GET /admin/posts/status/{status} - Lọc bài đăng theo status
  getPostsByStatus: (status) =>
    axiosInstance.get(ENDPOINTS.BY_STATUS(status)),

  // GET /admin/posts/pending - Lấy danh sách bài đăng chờ duyệt
  getPendingPosts: () =>
    axiosInstance.get(ENDPOINTS.PENDING),

  // PUT /admin/posts/{postId}/approve - Duyệt bài đăng
  approvePost: (postId) =>
    axiosInstance.put(ENDPOINTS.APPROVE(postId)),

  // PUT /admin/posts/{postId}/reject - Từ chối bài đăng
  rejectPost: (postId, payload = {}) =>
    axiosInstance.put(ENDPOINTS.REJECT(postId), payload),

  // PUT /admin/posts/{postId}/hide - Ẩn bài đăng
  hidePost: (postId) =>
    axiosInstance.put(ENDPOINTS.HIDE(postId)),

  // GET /admin/posts/approval-history - Lịch sử inspector duyệt bài
  getApprovalHistory: () =>
    axiosInstance.get(ENDPOINTS.APPROVAL_HISTORY),
};

export default adminPostService;


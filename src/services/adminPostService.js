import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.ADMIN_POSTS;

const adminPostService = {
  /** GET /admin/posts/pending – danh sách bài đăng chờ duyệt (có thumbnail) */
  getPendingPosts: () => axiosInstance.get(E.PENDING),

  /** PUT /admin/posts/:postId/approve – admin duyệt nội dung → post_status ADMIN_APPROVED (chờ Inspector kiểm định) */
  approvePost: (postId) => axiosInstance.put(E.APPROVE(postId)),

  /** PUT /admin/posts/:postId/reject – admin từ chối (Tên, giá, mô tả...) → post_status REJECTED, lưu rejection_reason */
  rejectPost: (postId, payload) =>
    axiosInstance.put(E.REJECT(postId), payload),
};

export default adminPostService;

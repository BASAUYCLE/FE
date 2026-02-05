import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.ADMIN_POSTS;

const adminPostService = {
  /** GET /admin/posts/pending – danh sách bài đăng chờ duyệt (có thumbnail) */
  getPendingPosts: () => axiosInstance.get(E.PENDING),

  /** PUT /admin/posts/:postId/approve – admin duyệt bài → status ADMIN_APPROVED */
  approvePost: (postId) => axiosInstance.put(E.APPROVE(postId)),
};

export default adminPostService;

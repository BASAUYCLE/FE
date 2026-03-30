import axiosInstance from "./axiosConfig";

const feedbackService = {
  // GET /feedbacks/sellers/{sellerId} — tất cả feedback của 1 seller
  getFeedbacksBySeller: (sellerId) =>
    axiosInstance.get(`/feedbacks/sellers/${sellerId}`),

  // GET /feedbacks/sellers/{sellerId}/rating — trung bình rating + tổng số review
  getSellerRating: (sellerId) =>
    axiosInstance.get(`/feedbacks/sellers/${sellerId}/rating`),

  // GET /feedbacks/orders/{orderId} — feedback cho một đơn cụ thể
  getFeedbackByOrder: (orderId) =>
    axiosInstance.get(`/feedbacks/orders/${orderId}`),

  // POST /feedbacks/orders/{orderId} — tạo feedback cho đơn COMPLETED
  createFeedback: (orderId, payload) =>
    axiosInstance.post(`/feedbacks/orders/${orderId}`, payload),

  // PUT /feedbacks/orders/{orderId} — cập nhật feedback hiện có
  updateFeedback: (orderId, payload) =>
    axiosInstance.put(`/feedbacks/orders/${orderId}`, payload),

  // DELETE /feedbacks/orders/{orderId}
  deleteFeedback: (orderId) =>
    axiosInstance.delete(`/feedbacks/orders/${orderId}`),

  // GET /feedbacks/posts/{postId} — đánh giá theo bài đăng
  getFeedbacksByPost: (postId) =>
    axiosInstance.get(`/feedbacks/posts/${postId}`),
};

export default feedbackService;


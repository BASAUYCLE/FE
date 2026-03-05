import axiosInstance from "./axiosConfig";

const wishlistService = {
  // POST /wishlist/{postId} - Thêm bài đăng vào danh sách yêu thích
  addToWishlist: (postId) =>
    axiosInstance.post(`/wishlist/${postId}`),

  // DELETE /wishlist/{postId} - Xóa bài đăng khỏi danh sách yêu thích
  removeFromWishlist: (postId) =>
    axiosInstance.delete(`/wishlist/${postId}`),

  // GET /wishlist - Lấy danh sách yêu thích của user
  getMyWishlist: () =>
    axiosInstance.get("/wishlist"),

  // GET /wishlist/check/{postId} - Kiểm tra bài đăng có trong wishlist không
  checkWishlist: (postId) =>
    axiosInstance.get(`/wishlist/check/${postId}`),
};

export default wishlistService;

import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { formDataOptions } from "./requestHelpers";

const E = API_ENDPOINTS;

const postService = {
  // ===== METADATA =====
  getBrands: () => axiosInstance.get(E.BRANDS.LIST),
  getCategories: () => axiosInstance.get(E.CATEGORIES.LIST),
  getPostFormMetadata: () => axiosInstance.get(E.METADATA.POST_FORM),

  // ===== PUBLIC API (POSTS) =====
  // GET /posts - Danh sách tất cả bài đăng
  getPosts: (params) => axiosInstance.get(E.POSTS.LIST, { params }),

  // GET /posts/{postId} - Chi tiết bài đăng
  getPostById: (postId) => axiosInstance.get(E.POSTS.BY_ID(postId)),

  // GET /posts/seller/{sellerId} - Bài đăng của seller
  getPostsBySeller: (sellerId) =>
    axiosInstance.get(E.POSTS.BY_SELLER(sellerId)),

  // GET /posts/status/{status} - Bài đăng theo status
  getPostsByStatus: (status) =>
    axiosInstance.get(E.POSTS.BY_STATUS(status)),

  // GET /posts/search?minPrice=&maxPrice= - Tìm kiếm theo giá
  searchPostsByPrice: (minPrice, maxPrice) =>
    axiosInstance.get(E.POSTS.SEARCH_BY_PRICE, {
      params: { minPrice, maxPrice },
    }),

  // ===== USER'S POSTS =====
  // GET /posts/my-posts - Bài đăng của user đang đăng nhập
  getMyPosts: () => axiosInstance.get(E.POSTS.MY_POSTS),

  // GET /posts/drafts - Danh sách bài nháp
  getMyDrafts: () => axiosInstance.get(E.POSTS.DRAFTS),

  // ===== CREATE/UPDATE =====
  // POST /posts - Tạo bài đăng
  createPost: (payload) =>
    axiosInstance.post(E.POSTS.CREATE, payload),

  // POST /posts/draft - Tạo bài nháp
  createDraftPost: (payload) =>
    axiosInstance.post(E.POSTS.DRAFT, payload),

  // PUT /posts/draft/{postId}/submit - Nộp bài nháp để duyệt (status: DRAFTED → PENDING)
  // Backend: Confirms this endpoint exists and takes NO request body, only postId
  submitDraft: (postId) =>
    axiosInstance.put(E.POSTS.DRAFT_SUBMIT(postId)),

  // PUT /posts/{postId} - Cập nhật bài đăng
  updatePost: (postId, payload) =>
    axiosInstance.put(E.POSTS.UPDATE(postId), payload),

  // DELETE /posts/{postId} - Xóa bài đăng
  deletePost: (postId) =>
    axiosInstance.delete(E.POSTS.DELETE(postId)),

  // ===== IMAGES =====
  // BE BicycleImageController + BicycleImageCreateRequest: POST /images, multipart/form-data
  // BE (BicycleImageCreateRequest) nhận: postId, image (MultipartFile), imageType, isThumbnail
  // imageType hợp lệ: OVERALL_DRIVE_SIDE, COCKPIT_AREA, DRIVETRAIN_CLOSEUP, FRONT_BRAKE, REAR_BRAKE, DEFECT_POINT, ...
  uploadPostImage: async ({ postId, imageFile, imageType, isThumbnail = false }) => {
    const file = imageFile?.originFileObj ?? imageFile;
    if (!file || !(file instanceof File || file instanceof Blob)) {
      return Promise.reject(new Error("Ảnh không hợp lệ (thiếu file)."));
    }
    const fileName = file instanceof File ? file.name : (file.name || "image.jpg");

    const formData = new FormData();
    formData.append("postId", String(postId));
    formData.append("image", file, fileName);
    formData.append("imageType", String(imageType));
    formData.append("isThumbnail", isThumbnail === true || String(isThumbnail).toLowerCase() === "true");

    const opts = formDataOptions(formData);
    // Upload + Cloudinary có thể mất >15s; tăng timeout cho request này
    const uploadTimeout = 60000; // 60 giây
    return axiosInstance.post(E.IMAGES.CREATE, formData, { ...opts, timeout: uploadTimeout });
  },

  // GET /images/post/{postId} - Lấy ảnh của bài đăng
  getPostImages: (postId) =>
    axiosInstance.get(E.IMAGES.BY_POST(postId)),

  // GET /images/{imageId} - Chi tiết ảnh
  getImageById: (imageId) =>
    axiosInstance.get(E.IMAGES.BY_ID(imageId)),

  // PUT /images/{imageId} - Cập nhật ảnh
  updateImage: (imageId, payload) =>
    axiosInstance.put(E.IMAGES.UPDATE(imageId), payload),

  // DELETE /images/{imageId} - Xóa ảnh
  deleteImage: (imageId) =>
    axiosInstance.delete(E.IMAGES.DELETE(imageId)),
};

export default postService;

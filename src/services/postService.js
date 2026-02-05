import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { formDataOptions } from "./requestHelpers";

const E = API_ENDPOINTS;

const postService = {
  // Dropdown data
  getBrands: () => axiosInstance.get(E.BRANDS.LIST),
  getCategories: () => axiosInstance.get(E.CATEGORIES.LIST),

  // Posts
  createPost: (payload) => axiosInstance.post(E.POSTS.CREATE, payload),
  getPostById: (postId) => axiosInstance.get(E.POSTS.BY_ID(postId)),
  updatePost: (postId, payload) => axiosInstance.put(E.POSTS.UPDATE(postId), payload),
  /** Cập nhật trạng thái bài đăng (Ẩn/Hiển thị). BE cần nhận postStatus trong body (BicyclePostUpdateRequest). */
  updatePostStatus: (postId, postStatus) =>
    axiosInstance.put(E.POSTS.UPDATE(postId), { postStatus }),
  /** GET /posts/seller/:sellerId – danh sách tin đăng của thành viên (luồng 2 bước: PENDING, ADMIN_APPROVED, AVAILABLE, REJECTED, DRAFTED...) */
  getPostsBySeller: (sellerId) => axiosInstance.get(E.POSTS.BY_SELLER(sellerId)),
  /** GET /posts/status/:status – danh sách tin đăng theo trạng thái (cho Home/Marketplace: AVAILABLE, ADMIN_APPROVED) */
  getPostsByStatus: (status) => axiosInstance.get(E.POSTS.BY_STATUS(status)),
  /** GET /posts – danh sách tin đăng (backend có thể hỗ trợ query ?status=AVAILABLE) */
  getPosts: (params) => axiosInstance.get(E.POSTS.LIST, { params }),
  /** Xóa bài đăng (chỉ owner). DELETE /posts/:postId */
  deletePost: (postId) => axiosInstance.delete(E.POSTS.DELETE(postId)),

  /**
   * Upload ảnh theo BE BASAUYCLE: POST /images, multipart/form-data.
   * BE (BicycleImageCreateRequest) nhận: postId, image (MultipartFile), imageType, isThumbnail.
   * imageType hợp lệ: OVERALL_DRIVE_SIDE, COCKPIT_AREA, DRIVETRAIN_CLOSEUP, FRONT_BRAKE, REAR_BRAKE, DEFECT_POINT, ...
   */
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
    return axiosInstance.post(E.IMAGES.CREATE, formData, opts);
  },
};

export default postService;


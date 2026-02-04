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

  // Images (BE tự upload Cloudinary và gắn vào post)
  uploadPostImage: ({ postId, imageFile, imageType, isThumbnail = false }) => {
    const formData = new FormData();
    formData.append("postId", String(postId));
    formData.append("image", imageFile);
    formData.append("imageType", String(imageType));
    formData.append("isThumbnail", String(!!isThumbnail));
    return axiosInstance.post(E.IMAGES.CREATE, formData, formDataOptions(formData));
  },
};

export default postService;


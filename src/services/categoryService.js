import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.CATEGORIES;

const categoryService = {
  list: () => axiosInstance.get(E.LIST),

  getById: (categoryId) => axiosInstance.get(E.BY_ID(categoryId)),

  create: (payload) => axiosInstance.post(E.LIST, payload),

  update: (categoryId, payload) =>
    axiosInstance.put(E.BY_ID(categoryId), payload),

  remove: (categoryId) => axiosInstance.delete(E.BY_ID(categoryId)),
};

export default categoryService;

import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { formDataOptions } from "./requestHelpers";

const E = API_ENDPOINTS.BIKES;

const bikeService = {
  getAllBikes: (params = {}) => axiosInstance.get(E.LIST, { params }),
  getBikeById: (bikeId) => axiosInstance.get(E.BY_ID(bikeId)),
  searchBikes: (query, filters = {}) => axiosInstance.get(E.SEARCH, { params: { q: query, ...filters } }),
  getFeaturedBikes: (limit = 10) => axiosInstance.get(E.FEATURED, { params: { limit } }),
  getCategories: () => axiosInstance.get(E.CATEGORIES),
  createBike: (bikeData) => axiosInstance.post(E.CREATE, bikeData, formDataOptions(bikeData)),
  updateBike: (bikeId, bikeData) => axiosInstance.put(E.UPDATE(bikeId), bikeData, formDataOptions(bikeData)),
  deleteBike: (bikeId) => axiosInstance.delete(E.DELETE(bikeId)),
  checkAvailability: (bikeId, dateRange) => axiosInstance.post(E.AVAILABILITY(bikeId), dateRange),
};

export default bikeService;

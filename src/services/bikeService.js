import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { formDataOptions } from "./requestHelpers";

const ENDPOINTS = API_ENDPOINTS.BIKES;

const bikeService = {
  getAllBikes: (params = {}) => axiosInstance.get(ENDPOINTS.LIST, { params }),
  getBikeById: (bikeId) => axiosInstance.get(ENDPOINTS.BY_ID(bikeId)),
  searchBikes: (query, filters = {}) => axiosInstance.get(ENDPOINTS.SEARCH, { params: { q: query, ...filters } }),
  getFeaturedBikes: (limit = 10) => axiosInstance.get(ENDPOINTS.FEATURED, { params: { limit } }),
  getCategories: () => axiosInstance.get(ENDPOINTS.CATEGORIES),
  createBike: (bikeData) => axiosInstance.post(ENDPOINTS.CREATE, bikeData, formDataOptions(bikeData)),
  updateBike: (bikeId, bikeData) => axiosInstance.put(ENDPOINTS.UPDATE(bikeId), bikeData, formDataOptions(bikeData)),
  deleteBike: (bikeId) => axiosInstance.delete(ENDPOINTS.DELETE(bikeId)),
  checkAvailability: (bikeId, dateRange) => axiosInstance.post(ENDPOINTS.AVAILABILITY(bikeId), dateRange),
};

export default bikeService;

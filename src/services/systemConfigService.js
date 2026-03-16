import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.SYSTEM_CONFIG;

const systemConfigService = {
  /** GET /system-config — lấy tất cả config */
  getAll: () => axiosInstance.get(E.LIST),

  /** GET /system-config/{key} — lấy giá trị theo key */
  getByKey: (key) => axiosInstance.get(E.BY_KEY(key)),
};

export default systemConfigService;

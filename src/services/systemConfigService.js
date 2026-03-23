import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.SYSTEM_CONFIG;
const LEGACY_SYSTEM_CONFIG_BASE = "/system-config";

const systemConfigService = {
  /** GET config list (ưu tiên /admin/config, fallback /system-config) */
  getAll: async () => {
    try {
      return await axiosInstance.get(E.LIST);
    } catch (err) {
      const status = err?.status ?? 0;
      if (status === 403 || status === 404) {
        return axiosInstance.get(LEGACY_SYSTEM_CONFIG_BASE);
      }
      throw err;
    }
  },

  /** GET config theo key (ưu tiên /admin/config/{key}, fallback /system-config/{key}) */
  getByKey: async (key) => {
    try {
      return await axiosInstance.get(E.BY_KEY(key));
    } catch (err) {
      const status = err?.status ?? 0;
      if (status === 403 || status === 404) {
        return axiosInstance.get(`${LEGACY_SYSTEM_CONFIG_BASE}/${key}`);
      }
      throw err;
    }
  },

  /**
   * PUT /admin/config/{key} — cập nhật giá trị theo key
   */
  updateByKey: (key, value) =>
    axiosInstance.put(E.BY_KEY(key), { configValue: value }),
};

export default systemConfigService;

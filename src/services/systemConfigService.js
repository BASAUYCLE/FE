import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.SYSTEM_CONFIG;

const systemConfigService = {
  /** GET /system-config — lấy tất cả config */
  getAll: () => axiosInstance.get(E.LIST),

  /** GET /system-config/{key} — lấy giá trị theo key */
  getByKey: (key) => axiosInstance.get(E.BY_KEY(key)),

  /**
   * PUT /system-config/{key} — cập nhật giá trị theo key
   * Payload linh hoạt vì BE có thể dùng configValue/value/config_value.
   */
  updateByKey: (key, value) =>
    axiosInstance.put(E.BY_KEY(key), {
      configKey: key,
      configValue: value,
      value,
      config_value: value,
    }),
};

export default systemConfigService;

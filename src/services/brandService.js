import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { formDataOptions } from "./requestHelpers";

const E = API_ENDPOINTS.BRANDS;

const brandService = {
  list: () => axiosInstance.get(E.LIST),

  getById: (brandId) => axiosInstance.get(E.BY_ID(brandId)),

  /**
   * POST /brands — multipart: brandName, brandLogo (optional), brandOriginCountry (optional)
   */
  create: (data) => {
    const fd = new FormData();
    fd.append("brandName", data.brandName ?? "");
    if (data.brandOriginCountry != null && data.brandOriginCountry !== "") {
      fd.append("brandOriginCountry", data.brandOriginCountry);
    }
    if (data.brandLogo instanceof File) {
      fd.append("brandLogo", data.brandLogo);
    }
    return axiosInstance.post(E.LIST, fd, formDataOptions(fd));
  },

  update: (brandId, data) => {
    const fd = new FormData();
    if (data.brandName != null) fd.append("brandName", data.brandName);
    if (data.brandOriginCountry != null) {
      fd.append("brandOriginCountry", data.brandOriginCountry);
    }
    if (data.brandLogo instanceof File) {
      fd.append("brandLogo", data.brandLogo);
    }
    return axiosInstance.put(E.BY_ID(brandId), fd, formDataOptions(fd));
  },

  remove: (brandId) => axiosInstance.delete(E.BY_ID(brandId)),
};

export default brandService;

import axiosInstance from "./axiosConfig";

const locationService = {
  // GET /locations/provinces - Lấy danh sách tất cả tỉnh/thành phố
  getAllProvinces: () =>
    axiosInstance.get("/locations/provinces"),

  // GET /locations/provinces/{provinceCode}/communes - Lấy danh sách xã/phường theo tỉnh
  getCommunesByProvince: (provinceCode) =>
    axiosInstance.get(`/locations/provinces/${provinceCode}/communes`),
};

export default locationService;

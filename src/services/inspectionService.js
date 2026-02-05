import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.INSPECTION;

const inspectionService = {
  /** GET /inspection/pending – danh sách bài chờ kiểm định (summary + thumbnail) */
  getPendingInspections: () => axiosInstance.get(E.PENDING),

  /**
   * POST /inspection/:postId/submit – nộp kết quả kiểm định
   * @param {number} postId
   * @param {{ result: 'PASS'|'FAIL', overallCondition: 'EXCELLENT'|'GOOD'|'FAIR'|'POOR', notes: string }} payload
   */
  submitInspection: (postId, payload) =>
    axiosInstance.post(E.SUBMIT(postId), payload),
};

export default inspectionService;

import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.DISPUTES;

const disputeService = {
  /** POST /disputes — multipart: orderId, reason, proofImage */
  createDispute: ({ orderId, reason, proofImageFile }) => {
    const form = new FormData();
    form.append("orderId", String(orderId));
    form.append("reason", reason ?? "");
    const file = proofImageFile?.originFileObj ?? proofImageFile;
    if (file instanceof File || file instanceof Blob) {
      form.append("proofImage", file, file.name || "proof.jpg");
    }
    return axiosInstance.post(E.BASE, form);
  },

  getById: (disputeId) => axiosInstance.get(E.BY_ID(disputeId)),

  getMyDisputes: () => axiosInstance.get(E.MY_DISPUTES),

  /** GET /disputes/inspector/my-disputes — INSPECTOR */
  getInspectorMyDisputes: () => axiosInstance.get(E.INSPECTOR_MY_DISPUTES),

  /** GET /disputes/admin/all — ADMIN, danh sách toàn bộ */
  getAdminAllDisputes: () => axiosInstance.get(E.ADMIN_ALL),

  addInspectorNote: (disputeId, note) =>
    axiosInstance.put(E.INSPECTOR_NOTE(disputeId), { note }),

  adminApprove: (disputeId, note) =>
    axiosInstance.put(
      E.ADMIN_APPROVE(disputeId),
      note != null && String(note).trim() !== "" ? { note: String(note).trim() } : {},
    ),

  adminReject: (disputeId, note) =>
    axiosInstance.put(
      E.ADMIN_REJECT(disputeId),
      note != null && String(note).trim() !== "" ? { note: String(note).trim() } : {},
    ),

  updateShippingInfo: (disputeId, payload) =>
    axiosInstance.put(E.SHIPPING_INFO(disputeId), payload),

  /**
   * Seller xác nhận đã nhận hàng trả.
   * BE: PUT {path} — không body (disputeId đủ trong URL).
   */
  confirmReturnReceipt: async (disputeId) => {
    const path = E.CONFIRM_RETURN(disputeId);
    try {
      return await axiosInstance.put(path);
    } catch (e) {
      if (e?.status === 405) {
        return await axiosInstance.post(path);
      }
      throw e;
    }
  },
};

export default disputeService;

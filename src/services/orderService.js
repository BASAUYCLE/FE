import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const E = API_ENDPOINTS.ORDERS || {};

const orderService = {
  // POST /orders — tạo đơn mới (B1: payFull=false / B2: payFull=true)
  createOrder: (data) => axiosInstance.post(E.CREATE, data),

  // GET /orders/my-orders — lịch sử mua của buyer
  getMyOrders: (params = {}) => axiosInstance.get(E.MY_ORDERS, { params }),

  // GET /orders/my-sales — lịch sử bán của seller
  getMySales: (params = {}) => axiosInstance.get(E.MY_SALES, { params }),

  // GET /orders/{id} — chi tiết đơn
  getById: (orderId) => axiosInstance.get(E.BY_ID(orderId)),

  // PUT /orders/{id}/pay — B3: Buyer trả phần còn lại
  payRemaining: (orderId) => axiosInstance.put(E.PAY_REMAINING(orderId)),

  // PUT /orders/{id}/shipping — B4: Seller xác nhận giao hàng (multipart)
  confirmShipping: (orderId, { shippingMethod, shippingTrackingNumber, proofImageFile }) => {
    const form = new FormData();
    form.append("shippingMethod", shippingMethod || "");
    form.append("shippingTrackingNumber", shippingTrackingNumber || "");
    if (proofImageFile) {
      const file = proofImageFile?.originFileObj ?? proofImageFile;
      if (file instanceof File || file instanceof Blob) {
        form.append("proofImage", file, file.name || "proof.jpg");
      }
    }
    return axiosInstance.put(E.CONFIRM_SHIPPING(orderId), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // PUT /orders/{id}/confirm-delivery — B5: Buyer xác nhận nhận hàng
  confirmDelivery: (orderId) => axiosInstance.put(E.CONFIRM_DELIVERY(orderId)),

  // PUT /orders/{id}/complete — Complete the order explicitly
  completeOrder: (orderId) => axiosInstance.put(E.COMPLETE(orderId)),

  // PUT /orders/{id}/cancel — B6/B7: Hủy đơn (buyer mất cọc / seller hoàn tiền)
  cancelOrder: (orderId) => axiosInstance.put(E.CANCEL(orderId)),
};

export default orderService;


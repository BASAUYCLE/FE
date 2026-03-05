/**
 * FE order statuses — ánh xạ 1-1 với BE OrderStatus enum:
 *   DEPOSITED   → buyer đã đặt cọc, chờ thanh toán phần còn lại
 *   PAID        → đã thanh toán đủ, chờ seller giao hàng
 *   SHIPPING    → đang giao hàng
 *   COMPLETED   → giao hàng thành công, giao dịch hoàn tất
 *   CANCELLED   → đã hủy
 */
export const ORDER_STATUS = {
  DEPOSITED:  "DEPOSITED",
  PAID:       "PAID",
  SHIPPING:   "SHIPPING",
  COMPLETED:  "COMPLETED",
  CANCELLED:  "CANCELLED",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.DEPOSITED]:  "Deposited",
  [ORDER_STATUS.PAID]:       "Paid",
  [ORDER_STATUS.SHIPPING]:   "Shipping",
  [ORDER_STATUS.COMPLETED]:  "Completed",
  [ORDER_STATUS.CANCELLED]:  "Cancelled",
};

export const ORDER_STATUS_TAG_COLOR = {
  [ORDER_STATUS.DEPOSITED]:  "orange",
  [ORDER_STATUS.PAID]:       "blue",
  [ORDER_STATUS.SHIPPING]:   "geekblue",
  [ORDER_STATUS.COMPLETED]:  "green",
  [ORDER_STATUS.CANCELLED]:  "default",
};

/**
 * FE order statuses — ánh xạ BE OrderStatus enum:
 *   DELIVERED  → buyer đã xác nhận nhận hàng, chờ hết cửa sổ dispute hoặc dispute
 *   DISPUTED   → đang tranh chấp
 */
export const ORDER_STATUS = {
  DEPOSITED:  "DEPOSITED",
  PAID:       "PAID",
  SHIPPING:   "SHIPPING",
  DELIVERED:  "DELIVERED",
  DISPUTED:   "DISPUTED",
  COMPLETED:  "COMPLETED",
  CANCELLED:  "CANCELLED",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.DEPOSITED]:  "Deposited",
  [ORDER_STATUS.PAID]:       "Paid",
  [ORDER_STATUS.SHIPPING]:   "Shipping",
  [ORDER_STATUS.DELIVERED]:  "Delivered",
  [ORDER_STATUS.DISPUTED]:   "Disputed",
  [ORDER_STATUS.COMPLETED]:  "Completed",
  [ORDER_STATUS.CANCELLED]:  "Cancelled",
};

export const ORDER_STATUS_TAG_COLOR = {
  [ORDER_STATUS.DEPOSITED]:  "orange",
  [ORDER_STATUS.PAID]:       "blue",
  [ORDER_STATUS.SHIPPING]:   "geekblue",
  [ORDER_STATUS.DELIVERED]:  "cyan",
  [ORDER_STATUS.DISPUTED]:   "volcano",
  [ORDER_STATUS.COMPLETED]:  "green",
  [ORDER_STATUS.CANCELLED]:  "default",
};

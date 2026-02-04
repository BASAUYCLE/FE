/** Order payment status for third-party exchange (escrow) logic */

export const ORDER_STATUS = {
  DEPOSIT_AWAITING: "DEPOSIT_AWAITING",
  FULL_PAYMENT: "FULL_PAYMENT",
  EXPIRED: "EXPIRED",
  PAID: "PAID",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.DEPOSIT_AWAITING]: "Deposit Awaiting",
  [ORDER_STATUS.FULL_PAYMENT]: "Full Payment",
  [ORDER_STATUS.EXPIRED]: "Expired",
  [ORDER_STATUS.PAID]: "Paid",
};

export const ORDER_STATUS_TAG_COLOR = {
  [ORDER_STATUS.DEPOSIT_AWAITING]: "gold",
  [ORDER_STATUS.FULL_PAYMENT]: "blue",
  [ORDER_STATUS.EXPIRED]: "default",
  [ORDER_STATUS.PAID]: "green",
};

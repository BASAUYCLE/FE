/** Khớp BE DisputeStatus enum */
export const DISPUTE_STATUS = {
  OPEN: "OPEN",
  REVIEWING: "REVIEWING",
  APPROVED: "APPROVED",
  RETURN_SHIPPED: "RETURN_SHIPPED",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
};

export const DISPUTE_STATUS_LABEL = {
  [DISPUTE_STATUS.OPEN]: "Open",
  [DISPUTE_STATUS.REVIEWING]: "Reviewing",
  [DISPUTE_STATUS.APPROVED]: "Approved — return item",
  [DISPUTE_STATUS.RETURN_SHIPPED]: "Return shipped",
  [DISPUTE_STATUS.RESOLVED]: "Resolved",
  [DISPUTE_STATUS.REJECTED]: "Rejected",
};

/** Màu Tag Ant Design theo trạng thái */
export function disputeStatusTagColor(st) {
  switch (st) {
    case DISPUTE_STATUS.OPEN:
      return "orange";
    case DISPUTE_STATUS.REVIEWING:
      return "gold";
    case DISPUTE_STATUS.APPROVED:
      return "blue";
    case DISPUTE_STATUS.RETURN_SHIPPED:
      return "geekblue";
    case DISPUTE_STATUS.RESOLVED:
      return "green";
    case DISPUTE_STATUS.REJECTED:
      return "default";
    default:
      return "default";
  }
}

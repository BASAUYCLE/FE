/** Listing status for bike postings (backend flow: PENDING → ADMIN_APPROVED → AVAILABLE | REJECTED) */

export const POSTING_STATUS = {
  PENDING: "PENDING",
  ADMIN_APPROVED: "ADMIN_APPROVED",
  AVAILABLE: "AVAILABLE",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  VERIFIED: "VERIFIED",
  PENDING_REVIEW: "PENDING_REVIEW",
  SOLD: "SOLD",
  DRAFT: "DRAFT",
  DRAFTED: "DRAFTED",
  DEPOSITED: "DEPOSITED",
  HIDDEN: "HIDDEN",
  EXPIRED: "EXPIRED",
};

export const POSTING_STATUS_LABEL = {
  [POSTING_STATUS.PENDING]: "Pending",
  [POSTING_STATUS.ADMIN_APPROVED]: "Admin Approved",
  [POSTING_STATUS.AVAILABLE]: "Available",
  [POSTING_STATUS.REJECTED]: "Rejected",
  [POSTING_STATUS.ACTIVE]: "Active",
  [POSTING_STATUS.VERIFIED]: "Verified",
  [POSTING_STATUS.PENDING_REVIEW]: "Pending Review",
  [POSTING_STATUS.SOLD]: "Sold",
  [POSTING_STATUS.DRAFT]: "Draft",
  [POSTING_STATUS.DRAFTED]: "Drafted",
  [POSTING_STATUS.DEPOSITED]: "Deposited",
  [POSTING_STATUS.HIDDEN]: "Hidden",
  [POSTING_STATUS.EXPIRED]: "Expired",
};

/** Labels for Manage Listings tabs (Vietnamese) – luồng 2 bước */
export const POSTING_STATUS_LABEL_VI = {
  [POSTING_STATUS.PENDING]: "Chờ duyệt",
  [POSTING_STATUS.ADMIN_APPROVED]: "Đã duyệt (chờ kiểm định)",
  [POSTING_STATUS.AVAILABLE]: "Đang hiển thị",
  [POSTING_STATUS.VERIFIED]: "Đã qua kiểm định",
  [POSTING_STATUS.REJECTED]: "Bị từ chối",
  [POSTING_STATUS.DRAFT]: "Bản nháp",
  [POSTING_STATUS.DRAFTED]: "Bản nháp",
  [POSTING_STATUS.DEPOSITED]: "Đã đặt cọc",
  [POSTING_STATUS.SOLD]: "Đã bán",
  [POSTING_STATUS.HIDDEN]: "Đã ẩn",
};

export const POSTING_STATUS_TAG_COLOR = {
  [POSTING_STATUS.PENDING]: "blue",
  [POSTING_STATUS.ADMIN_APPROVED]: "cyan",
  [POSTING_STATUS.AVAILABLE]: "green",
  [POSTING_STATUS.REJECTED]: "red",
  [POSTING_STATUS.ACTIVE]: "green",
  [POSTING_STATUS.VERIFIED]: "cyan",
  [POSTING_STATUS.PENDING_REVIEW]: "blue",
  [POSTING_STATUS.SOLD]: "default",
  [POSTING_STATUS.DRAFT]: "orange",
  [POSTING_STATUS.DRAFTED]: "orange",
  [POSTING_STATUS.DEPOSITED]: "purple",
  [POSTING_STATUS.HIDDEN]: "default",
  [POSTING_STATUS.EXPIRED]: "default",
};

/** Inspector: overallCondition (tình trạng tổng thể) */
export const OVERALL_CONDITION = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
};

export const OVERALL_CONDITION_LABEL = {
  [OVERALL_CONDITION.EXCELLENT]: "Xuất sắc – Như mới",
  [OVERALL_CONDITION.GOOD]: "Tốt – Có dấu hiệu sử dụng nhẹ",
  [OVERALL_CONDITION.FAIR]: "Trung bình – Có hao mòn rõ",
  [OVERALL_CONDITION.POOR]: "Kém – Cần sửa chữa",
};

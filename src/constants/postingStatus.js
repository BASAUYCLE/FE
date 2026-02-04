/** Listing status for bike postings */

export const POSTING_STATUS = {
  ACTIVE: "ACTIVE",
  VERIFIED: "VERIFIED",
  PENDING_REVIEW: "PENDING_REVIEW",
  REJECTED: "REJECTED",
  SOLD: "SOLD",
  DRAFT: "DRAFT",
  EXPIRED: "EXPIRED",
};

export const POSTING_STATUS_LABEL = {
  [POSTING_STATUS.ACTIVE]: "Active",
  [POSTING_STATUS.VERIFIED]: "Verified",
  [POSTING_STATUS.PENDING_REVIEW]: "Pending Review",
  [POSTING_STATUS.REJECTED]: "Rejected",
  [POSTING_STATUS.SOLD]: "Sold",
  [POSTING_STATUS.DRAFT]: "Draft",
  [POSTING_STATUS.EXPIRED]: "Expired",
};

/** Labels for Manage Listings tabs (Vietnamese) */
export const POSTING_STATUS_LABEL_VI = {
  [POSTING_STATUS.ACTIVE]: "Đang hiển thị",
  [POSTING_STATUS.VERIFIED]: "Đã qua kiểm định",
  [POSTING_STATUS.REJECTED]: "Bị từ chối",
  [POSTING_STATUS.DRAFT]: "Bản nháp",
};

export const POSTING_STATUS_TAG_COLOR = {
  [POSTING_STATUS.ACTIVE]: "green",
  [POSTING_STATUS.VERIFIED]: "cyan",
  [POSTING_STATUS.PENDING_REVIEW]: "blue",
  [POSTING_STATUS.REJECTED]: "red",
  [POSTING_STATUS.SOLD]: "default",
  [POSTING_STATUS.DRAFT]: "orange",
  [POSTING_STATUS.EXPIRED]: "default",
};

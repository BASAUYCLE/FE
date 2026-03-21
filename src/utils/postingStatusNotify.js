import { POSTING_STATUS } from "../constants/postingStatus";

const REJECTION_ONCE_KEY = "basauycle-rejection-first-seen";

/** Chuẩn hóa status từ BE (casing / khoảng trắng) */
export function normalizePostingStatus(status) {
  if (status == null || status === "") return "";
  return String(status).toUpperCase().trim().replace(/\s+/g, "_");
}

function loadRejectionOnceMap() {
  try {
    const raw = localStorage.getItem(REJECTION_ONCE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {}
  }
}

function saveRejectionOnceMap(map) {
  try {
    localStorage.setItem(REJECTION_ONCE_KEY, JSON.stringify(map));
  } catch (_) {}
}

/**
 * Gọi addNotification khi cần thông báo từ chối / duyệt / lên sàn.
 * @param {object} p — posting { id, bikeName, status, rejectionReason }
 * @param {string|undefined} prevStatusRaw — trạng thái lần trước (localStorage)
 * @param {function} addNotification — từ NotificationContext
 */
export function emitPostingStatusNotifications(p, prevStatusRaw, addNotification) {
  if (!addNotification || !p) return;

  const idKey = String(p.id ?? p.backendPostId ?? "");
  const name = p.bikeName || "Listing";
  const curr = normalizePostingStatus(p.status);
  const prev = normalizePostingStatus(prevStatusRaw);

  if (
    curr === POSTING_STATUS.ADMIN_APPROVED &&
    (prev === POSTING_STATUS.PENDING ||
      prev === POSTING_STATUS.PENDING_REVIEW)
  ) {
    addNotification({
      title: "Listing approved",
      message: `"${name}" has been approved by admin and is awaiting inspection.`,
      type: "success",
    });
    return;
  }

  if (
    curr === POSTING_STATUS.AVAILABLE &&
    (prev === POSTING_STATUS.PENDING ||
      prev === POSTING_STATUS.PENDING_REVIEW ||
      prev === POSTING_STATUS.ADMIN_APPROVED)
  ) {
    addNotification({
      title: "Listing is live",
      message: `"${name}" has passed inspection and is now on Marketplace.`,
      type: "success",
    });
    return;
  }

  if (curr !== POSTING_STATUS.REJECTED) return;
  if (prev === POSTING_STATUS.REJECTED) return;

  if (prev) {
    addNotification({
      title: "Listing rejected",
      message: p.rejectionReason
        ? `"${name}" was rejected: ${p.rejectionReason}`
        : `"${name}" has been rejected.`,
      type: "warning",
    });
    return;
  }

  // Lần đầu thấy tin đã REJECTED (chưa có prev trong storage) — vẫn báo 1 lần cho member
  const once = loadRejectionOnceMap();
  if (idKey && !once[idKey]) {
    addNotification({
      title: "Listing rejected",
      message: p.rejectionReason
        ? `"${name}" was rejected: ${p.rejectionReason}`
        : `"${name}" has been rejected.`,
      type: "warning",
    });
    once[idKey] = true;
    saveRejectionOnceMap(once);
  }
}

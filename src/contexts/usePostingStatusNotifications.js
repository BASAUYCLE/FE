import { useEffect, useContext } from "react";
import { useAuthOptional } from "./AuthContext";
import { usePostings } from "./PostingContext";
import { NotificationContext } from "./NotificationContext";
import { POSTING_STATUS } from "../constants/postingStatus";

const STORAGE_KEY = "basauycle-posting-status-prev";

// So sánh trạng thái tin đăng với localStorage, thông báo khi duyệt/hiển thị/từ chối
// Dùng useAuthOptional để không throw khi render ngoài AuthProvider (tránh lỗi console)
export function usePostingStatusNotifications() {
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const notifCtx = useContext(NotificationContext) ?? null;
  const addNotification = notifCtx?.addNotification ?? null;

  let postings = [];
  try {
    const ctx = usePostings();
    postings = Array.isArray(ctx?.postings) ? ctx.postings : [];
  } catch {
    postings = [];
  }

  useEffect(() => {
    if (!user || !addNotification || !Array.isArray(postings) || postings.length === 0) {
      return;
    }
    let prev = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) prev = JSON.parse(raw);
    } catch (_) {}
    for (const p of postings) {
      const prevStatus = prev[p.id];
      const name = p.bikeName || "Listing";
      if (
        p.status === POSTING_STATUS.ADMIN_APPROVED &&
        prevStatus === POSTING_STATUS.PENDING
      ) {
        addNotification({
          title: "Listing approved",
          message: `"${name}" has been approved by admin and is awaiting inspection.`,
          type: "success",
        });
      } else if (
        p.status === POSTING_STATUS.AVAILABLE &&
        (prevStatus === POSTING_STATUS.PENDING ||
          prevStatus === POSTING_STATUS.ADMIN_APPROVED)
      ) {
        addNotification({
          title: "Listing is live",
          message: `"${name}" has passed inspection and is now on Marketplace.`,
          type: "success",
        });
      } else if (
        p.status === POSTING_STATUS.REJECTED &&
        prevStatus &&
        prevStatus !== POSTING_STATUS.REJECTED
      ) {
        addNotification({
          title: "Listing rejected",
          message: p.rejectionReason
            ? `"${name}" was rejected: ${p.rejectionReason}`
            : `"${name}" has been rejected.`,
          type: "warning",
        });
      }
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Object.fromEntries(postings.map((p) => [p.id, p.status]))),
      );
    } catch (_) {}
  }, [user, postings, addNotification]);
}

import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePostings } from "../contexts/PostingContext";
import { useNotifications } from "../contexts/useNotifications";
import { POSTING_STATUS } from "../constants/postingStatus";

const POSTING_STATUS_STORAGE_KEY = "basauycle-posting-status-prev";

/**
 * Chạy khi user đã đăng nhập: so sánh trạng thái tin đăng với snapshot trong localStorage.
 * Nếu có bài chuyển sang ADMIN_APPROVED, AVAILABLE hoặc REJECTED thì thông báo cho member.
 * Postings có thể được tải từ Manage Listings, Home (FeaturedBikes) hoặc Marketplace.
 */
export default function PostingStatusNotificationSync() {
  const { user } = useAuth();
  const { postings } = usePostings();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user || !postings.length || !addNotification) return;
    let prev = {};
    try {
      const raw = localStorage.getItem(POSTING_STATUS_STORAGE_KEY);
      if (raw) prev = JSON.parse(raw);
    } catch (_) {}
    for (const p of postings) {
      const id = p.id;
      const status = p.status;
      const prevStatus = prev[id];
      const name = p.bikeName || "Tin đăng";
      if (status === POSTING_STATUS.ADMIN_APPROVED && prevStatus === POSTING_STATUS.PENDING) {
        addNotification({
          title: "Tin đăng đã được duyệt",
          message: `"${name}" đã được admin duyệt và đang chờ kiểm định.`,
          type: "success",
        });
      } else if (
        status === POSTING_STATUS.AVAILABLE &&
        (prevStatus === POSTING_STATUS.PENDING || prevStatus === POSTING_STATUS.ADMIN_APPROVED)
      ) {
        addNotification({
          title: "Tin đăng đã hiển thị",
          message: `"${name}" đã qua kiểm định và đang hiển thị trên Marketplace.`,
          type: "success",
        });
      } else if (
        status === POSTING_STATUS.REJECTED &&
        prevStatus &&
        prevStatus !== POSTING_STATUS.REJECTED
      ) {
        addNotification({
          title: "Tin đăng bị từ chối",
          message: p.rejectionReason
            ? `"${name}" bị từ chối: ${p.rejectionReason}`
            : `"${name}" đã bị từ chối.`,
          type: "warning",
        });
      }
    }
    try {
      localStorage.setItem(
        POSTING_STATUS_STORAGE_KEY,
        JSON.stringify(Object.fromEntries(postings.map((p) => [p.id, p.status]))),
      );
    } catch (_) {}
  }, [user, postings, addNotification]);

  return null;
}

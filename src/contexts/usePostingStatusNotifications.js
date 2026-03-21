import { useEffect, useContext } from "react";
import { useAuthOptional } from "./AuthContext";
import { usePostings } from "./PostingContext";
import { NotificationContext } from "./NotificationContext";
import { emitPostingStatusNotifications } from "../utils/postingStatusNotify";

const STORAGE_KEY = "basauycle-posting-status-prev";

function getPrevStatus(prevMap, postingId) {
  if (postingId == null) return undefined;
  return (
    prevMap[postingId] ??
    prevMap[String(postingId)] ??
    prevMap[Number(postingId)]
  );
}

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
      const prevStatus = getPrevStatus(prev, p.id);
      emitPostingStatusNotifications(p, prevStatus, addNotification);
    }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          Object.fromEntries(postings.map((p) => [p.id, p.status])),
        ),
      );
    } catch (_) {}
  }, [user, postings, addNotification]);
}

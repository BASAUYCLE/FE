import { useEffect, useContext, useMemo } from "react";
import { useAuthOptional } from "./AuthContext";
import { usePostings } from "./PostingContext";
import { NotificationContext } from "./NotificationContextBase";
import { emitPostingStatusNotifications } from "../utils/postingStatusNotify";

const STORAGE_KEY_PREFIX = "basauycle-posting-status-prev";

function normalizeUserId(user) {
  return user?.id ?? user?.userId ?? user?.user_id ?? user?.email ?? null;
}

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

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
  const userId = normalizeUserId(user);
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
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
      const raw = localStorage.getItem(storageKey);
      if (raw) prev = JSON.parse(raw);
    } catch (_) {}
    for (const p of postings) {
      const prevStatus = getPrevStatus(prev, p.id);
      emitPostingStatusNotifications(p, prevStatus, addNotification);
    }
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(
          Object.fromEntries(postings.map((p) => [p.id, p.status])),
        ),
      );
    } catch (_) {}
  }, [user, postings, addNotification, storageKey]);
}

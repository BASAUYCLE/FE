import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePostings } from "../contexts/PostingContext";

/**
 * Đồng bộ GET /posts/my-posts khi member đăng nhập / focus tab để trạng thái tin
 * (REJECTED, …) cập nhật kịp — thông báo chuông phụ thuộc vào PostingContext.postings.
 */
export default function MemberPostingsSync() {
  const { user } = useAuth();
  const { loadMyListings } = usePostings();
  const sellerId = user?.userId ?? user?.user_id ?? user?.id ?? null;

  useEffect(() => {
    if (sellerId == null || !loadMyListings) return;
    loadMyListings(sellerId).catch(() => {});
  }, [sellerId, loadMyListings]);

  useEffect(() => {
    if (sellerId == null || !loadMyListings) return;
    const onFocus = () => {
      loadMyListings(sellerId).catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sellerId, loadMyListings]);

  return null;
}

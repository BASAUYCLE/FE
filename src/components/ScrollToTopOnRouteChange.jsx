import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Khi chuyển route (vd. Home ↔ Marketplace ↔ Wishlist), cuộn về đầu trang.
 * React Router không làm việc này mặc định nên nếu đang ở cuối trang, trang mới vẫn giữ scroll cũ.
 */
export default function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (typeof document !== "undefined") {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

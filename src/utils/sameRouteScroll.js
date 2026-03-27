/**
 * Chuẩn hóa pathname (bỏ query/hash, bỏ slash cuối trừ root).
 * @param {string} pathOrHref
 * @returns {string | null}
 */
export function normalizePathname(pathOrHref) {
  if (pathOrHref == null || pathOrHref === "" || pathOrHref === "#")
    return null;
  let p = String(pathOrHref).split("?")[0].split("#")[0];
  if (!p || p === "") return "/";
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/**
 * Khi đã ở đúng route đó, bấm lại link (logo, nav, footer…) thì cuộn lên đầu trang.
 * Gọi trong onClick của <Link> / <NavLink>.
 *
 * @param {React.MouseEvent} event
 * @param {string} href — ví dụ "/marketplace", "/"
 * @param {string} currentPathname — từ useLocation().pathname
 */
export function onSameRouteScrollToTop(event, href, currentPathname) {
  if (!event || href == null || href === "#") return;
  const target = normalizePathname(href);
  const current = normalizePathname(currentPathname);
  if (target == null || current == null) return;
  if (target === current) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

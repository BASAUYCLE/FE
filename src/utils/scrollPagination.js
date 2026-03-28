/**
 * Cuộn về đầu nội dung sau khi đổi trang danh sách (phân trang).
 * Admin/Inspector: vùng cuộn là `.app-sidebar-body`.
 * Các trang public (Marketplace, …): cuộn `window`.
 *
 * @param {{ behavior?: ScrollBehavior }} [options]
 */
export function scrollToTopAfterPagination(options = {}) {
  const behavior = options.behavior ?? "auto";
  const sidebarBody = document.querySelector(".app-sidebar-body");
  if (sidebarBody instanceof HTMLElement) {
    sidebarBody.scrollTo({ top: 0, behavior });
  }
  window.scrollTo({ top: 0, behavior });
}

/** Cấu hình navbar thống nhất cho toàn bộ web */

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Sell", href: "/post" },
  { label: "Wishlist", href: "/wishlist" },
];

const ROUTE_TO_ACTIVE_LINK = {
  "/": "Home",
  "/marketplace": "Marketplace",
  "/post": "Sell",
  "/manage-listings": "Manage Listings",
  "/wishlist": "Wishlist",
  "/account": "Account",
  "/wallet": "Home",
  "/payment": "Home",
};

export function getActiveLink(pathname) {
  if (ROUTE_TO_ACTIVE_LINK[pathname]) {
    return ROUTE_TO_ACTIVE_LINK[pathname];
  }
  if (pathname.startsWith("/product/")) return null;
  return null;
}

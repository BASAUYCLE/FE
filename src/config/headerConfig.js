// Liên kết nav chính (Home, Marketplace, Wishlist)
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Wishlist", href: "/wishlist" },
];

// Admin và Inspector chỉ thấy Home + Marketplace (không Sell, không Wishlist)
export function getNavLinksForRole(role) {
  const roleUpper = (role ?? "MEMBER").toUpperCase();
  if (roleUpper === "ADMIN" || roleUpper === "INSPECTOR") {
    return NAV_LINKS.filter((link) => link.label !== "Wishlist");
  }
  return NAV_LINKS;
}

// Nhãn nav cần highlight theo path hiện tại
const PATH_TO_ACTIVE_LABEL = {
  "/": "Home",
  "/marketplace": "Marketplace",
  "/post": "Home",
  "/manage-listings": "Manage Listings",
  "/wishlist": "Wishlist",
  "/account": "Account",
  "/wallet": "Home",
  "/payment": "Home",
};

export function getActiveLink(pathname) {
  if (pathname && PATH_TO_ACTIVE_LABEL[pathname]) {
    return PATH_TO_ACTIVE_LABEL[pathname];
  }
  if (pathname?.startsWith("/product/")) return null;
  return null;
}

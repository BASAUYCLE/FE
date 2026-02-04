export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin-dashboard" },
  { label: "User Management", href: "/admin-users" },
  { label: "Listings", href: "/admin-listings" },
  { label: "Tin đã duyệt", href: "/admin-approved-listings" },
  { label: "Doanh thu", href: "/admin-revenue" },
  { label: "Báo cáo kiểm duyệt", href: "/admin-inspection-reports" },
  { label: "Categories", href: "/admin-categories" },
  { label: "Transactions", href: "/admin-transactions" },
  { label: "Reports", href: "/admin-reports" },
];

const ADMIN_ROUTE_TO_ACTIVE_LINK = {
  "/admin-dashboard": "Dashboard",
  "/admin-users": "User Management",
  "/admin-listings": "Listings",
  "/admin-listing": "Listings",
  "/admin-approved-listings": "Tin đã duyệt",
  "/admin-revenue": "Doanh thu",
  "/admin-inspection-reports": "Báo cáo kiểm duyệt",
  "/admin-categories": "Categories",
  "/admin/category": "Categories",
  "/admin-transactions": "Transactions",
  "/admin-reports": "Reports",
};

export function getAdminActiveLink(pathname) {
  return ADMIN_ROUTE_TO_ACTIVE_LINK[pathname] ?? null;
}

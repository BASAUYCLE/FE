export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin-dashboard" },
  { label: "Users", href: "/admin-users" },
  { label: "Listings", href: "/admin-listings" },
  { label: "Approved", href: "/admin-approved-listings" },
  { label: "Revenue", href: "/admin-revenue" },
  { label: "Inspections", href: "/admin-inspection-reports" },
  { label: "Categories", href: "/admin-categories" },
  { label: "Transactions", href: "/admin-transactions" },
  { label: "Reports", href: "/admin-reports" },
];

const ADMIN_ROUTE_TO_ACTIVE_LINK = {
  "/admin-dashboard": "Dashboard",
  "/admin-users": "Users",
  "/admin-listings": "Listings",
  "/admin-listing": "Listings",
  "/admin-approved-listings": "Approved",
  "/admin-revenue": "Revenue",
  "/admin-inspection-reports": "Inspections",
  "/admin-categories": "Categories",
  "/admin/category": "Categories",
  "/admin-transactions": "Transactions",
  "/admin-reports": "Reports",
};

export function getAdminActiveLink(pathname) {
  return ADMIN_ROUTE_TO_ACTIVE_LINK[pathname] ?? null;
}

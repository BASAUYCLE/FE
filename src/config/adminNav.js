// Admin sidebar links — edit paths or labels here.
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin-dashboard" },
  { label: "Users", href: "/admin-users" },
  { label: "Listings", href: "/admin-listings" },
  { label: "Approved", href: "/admin-approved-listings" },
  { label: "Catalog", href: "/admin-catalog" },
  { label: "Revenue", href: "/admin-revenue" },
  { label: "Inspections", href: "/admin-inspection-reports" },
  { label: "Transactions", href: "/admin-transactions" },
  { label: "Withdrawals", href: "/admin-withdrawals" },
  { label: "Disputes", href: "/admin-disputes" },
  { label: "Config", href: "/admin-config" },
];

// Nhãn nav cần highlight theo path hiện tại
const PATH_TO_ACTIVE_LABEL = {
  "/admin-dashboard": "Dashboard",
  "/admin-users": "Users",
  "/admin-listings": "Listings",
  "/admin-listing": "Listings",
  "/admin-approved-listings": "Approved",
  "/admin-catalog": "Catalog",
  "/admin-brands": "Catalog",
  "/admin-categories": "Catalog",
  "/admin-revenue": "Revenue",
  "/admin-inspection-reports": "Inspections",
  "/admin-transactions": "Transactions",
  "/admin-withdrawals": "Withdrawals",
  "/admin-disputes": "Disputes",
  "/admin-config": "Config",
};

export function getAdminActiveLink(pathname) {
  if (pathname?.startsWith("/product/")) return "Listings";
  return PATH_TO_ACTIVE_LABEL[pathname] ?? null;
}

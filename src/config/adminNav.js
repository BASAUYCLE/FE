// Link menu admin – sửa path hoặc label tại đây
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin-dashboard" },
  { label: "Users", href: "/admin-users" },
  { label: "Listings", href: "/admin-listings" },
  { label: "Approved", href: "/admin-approved-listings" },
  { label: "Revenue", href: "/admin-revenue" },
  { label: "Inspections", href: "/admin-inspection-reports" },
  { label: "Transactions", href: "/admin-transactions" },
  { label: "Reports", href: "/admin-reports" },
<<<<<<< HEAD
  { label: "Config", href: "/admin-config" },
=======
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
];

// Nhãn nav cần highlight theo path hiện tại
const PATH_TO_ACTIVE_LABEL = {
  "/admin-dashboard": "Dashboard",
  "/admin-users": "Users",
  "/admin-listings": "Listings",
  "/admin-listing": "Listings",
  "/admin-approved-listings": "Approved",
  "/admin-revenue": "Revenue",
  "/admin-inspection-reports": "Inspections",
  "/admin-transactions": "Transactions",
  "/admin-reports": "Reports",
<<<<<<< HEAD
  "/admin-config": "Config",
=======
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
};

export function getAdminActiveLink(pathname) {
  if (pathname?.startsWith("/product/")) return "Listings";
  return PATH_TO_ACTIVE_LABEL[pathname] ?? null;
}

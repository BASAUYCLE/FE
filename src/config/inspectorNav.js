/** Cấu hình nav cho trang Inspector (kiểm định xe) */

export const INSPECTOR_NAV_LINKS = [
  { label: "Dashboard", href: "/inspector" },
  { label: "Inspection Details", href: "/inspector/details" },
  { label: "Completed", href: "/inspector/completed" },
  { label: "Dispute Center", href: "/inspector/disputes" },
];

const INSPECTOR_ROUTE_TO_ACTIVE_LINK = {
  "/inspector": "Dashboard",
  "/inspector/details": "Inspection Details",
  "/inspector/completed": "Completed",
  "/inspector/disputes": "Dispute Center",
};

/** Active tab by route so clicking each nav item switches page and highlights correctly */
export function getInspectorActiveLink(pathname) {
  if (pathname.startsWith("/inspector/disputes")) return "Dispute Center";
  if (pathname.startsWith("/inspector/details")) return "Inspection Details";
  if (pathname.startsWith("/inspector/completed")) return "Completed";
  if (pathname.match(/^\/inspector\/[^/]+$/) && pathname !== "/inspector/details" && pathname !== "/inspector/completed") return "Inspection Details";
  return INSPECTOR_ROUTE_TO_ACTIVE_LINK[pathname] ?? "Dashboard";
}

// Liên kết nav Inspector (quy trình kiểm định)
export const INSPECTOR_NAV_LINKS = [
  { label: "Dashboard", href: "/inspector" },
  { label: "Inspection Details", href: "/inspector/details" },
  { label: "Dispute Center", href: "/inspector/disputes" },
  { label: "Scoring guide", href: "/guide-inspection" },
];

const PATH_TO_ACTIVE_LABEL = {
  "/inspector": "Dashboard",
  "/inspector/details": "Inspection Details",
  "/inspector/disputes": "Dispute Center",
  "/guide-inspection": "Scoring guide",
};

// Trả về nhãn nav đang active theo path hiện tại
export function getInspectorActiveLink(pathname) {
  if (!pathname) return "Dashboard";
  if (pathname === "/guide-inspection") return "Scoring guide";
  if (pathname.startsWith("/inspector/disputes")) return "Dispute Center";
  if (pathname.startsWith("/inspector/details")) return "Inspection Details";
  // VD: /inspector/123 (trang chi tiết) → highlight "Inspection Details"
  const isInspectorSubPage = pathname.startsWith("/inspector/");
  if (isInspectorSubPage) {
    return PATH_TO_ACTIVE_LABEL[pathname] ?? "Inspection Details";
  }
  return PATH_TO_ACTIVE_LABEL[pathname] ?? "Dashboard";
}

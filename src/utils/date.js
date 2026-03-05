// Format ngày dùng chung (tránh lặp ở nhiều file)
export function formatDate(isoString, opts = {}) {
  if (isoString == null || isoString === "") return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const locale = opts.locale ?? "vi-VN";
  return d.toLocaleDateString(locale, {
    day: opts.day ?? "2-digit",
    month: opts.month ?? "short",
    year: opts.year ?? "numeric",
    ...opts,
  });
}

// Format ngày + giờ (thông báo, inspection)
export function formatDateTime(isoString) {
  if (isoString == null || isoString === "") return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

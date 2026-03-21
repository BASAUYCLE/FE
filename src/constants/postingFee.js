/** Giá trị mặc định khi BE chưa cấu hình hoặc API lỗi (đồng bộ admin dashboard) */
export const POSTING_FEE_FALLBACK_VND = 50_000;

/**
 * Chuẩn hóa giá trị POSTING_FEE từ response GET /system-config/POSTING_FEE
 */
export function parsePostingFeeVnd(res) {
  const raw =
    res?.result ??
    res?.data ??
    res?.configValue ??
    res?.config_value ??
    res?.value;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return raw;
  const str = raw != null ? String(raw) : "";
  const digits = str.replace(/[^\d]/g, "");
  const n = digits ? Number(digits) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : POSTING_FEE_FALLBACK_VND;
}

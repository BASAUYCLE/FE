/** Giá trị mặc định khi BE chưa cấu hình hoặc API lỗi (đồng bộ admin dashboard) */
export const POSTING_FEE_FALLBACK_VND = 50_000;
const POSTING_FEE_CACHE_KEY = "basauycle_posting_fee_vnd";

/**
 * Chuẩn hóa giá trị POSTING_FEE từ response GET /admin/config/POSTING_FEE
 */
export function parsePostingFeeVnd(res) {
  const result = res?.result ?? res?.data ?? res;
  const raw =
    result?.configValue ??
    result?.config_value ??
    result?.value ??
    res?.configValue ??
    res?.config_value ??
    res?.value ??
    result;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return raw;
  const str = raw != null ? String(raw) : "";
  const digits = str.replace(/[^\d]/g, "");
  const n = digits ? Number(digits) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : POSTING_FEE_FALLBACK_VND;
}

export function readCachedPostingFeeVnd() {
  try {
    const raw = localStorage.getItem(POSTING_FEE_CACHE_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

export function writeCachedPostingFeeVnd(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return;
  try {
    localStorage.setItem(POSTING_FEE_CACHE_KEY, String(Math.round(n)));
  } catch {
    // ignore storage errors (private mode/quota)
  }
}

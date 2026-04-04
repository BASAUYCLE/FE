/**
 * Known backend `code` values → user-facing English messages.
 * Extend as you document more API contracts.
 */
export const API_ERROR_MESSAGE_BY_CODE = Object.freeze({
  /** Inspection: score not in {0, 3, 7, 10} */
  1089:
    "Invalid inspection scores: each criterion must be exactly 0, 3, 7, or 10.",
  /** Post not in status allowed for the action (e.g. inspection submit) */
  1033:
    "This action is not allowed for the current listing status. The post may not be admin-approved or may already be processed.",
});

/**
 * @param {unknown} code — BE body `code` (number or string)
 * @returns {string | null}
 */
export function messageForApiErrorCode(code) {
  if (code === null || code === undefined || code === "") return null;
  const n = Number(code);
  if (!Number.isFinite(n)) return null;
  return API_ERROR_MESSAGE_BY_CODE[n] ?? null;
}

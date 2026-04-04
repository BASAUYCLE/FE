/**
 * Tiện ích chấm điểm kiểm định — khớp BE (INSPECTION_API_GUIDE.md).
 * Preview trên FE; kết quả chính thức lấy từ response POST /inspection/{postId}/submit.
 */

import { OVERALL_CONDITION } from "../constants/postingStatus";

/** Chỉ 0, 3, 7, 10 — khác sẽ bị BE từ chối (1089). */
export const VALID_INSPECTION_SCORES = Object.freeze([0, 3, 7, 10]);

/** Thứ tự field gửi API */
export const INSPECTION_SCORE_KEYS = Object.freeze([
  "colorScore",
  "frameScore",
  "groupsetScore",
  "brakeScore",
  "controlScore",
  "wheelScore",
]);

/** Trọng số % (tổng 100) — khớp guide */
export const INSPECTION_WEIGHTS = Object.freeze({
  colorScore: 10,
  frameScore: 30,
  groupsetScore: 25,
  brakeScore: 15,
  controlScore: 10,
  wheelScore: 10,
});

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isValidInspectionScore(value) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    VALID_INSPECTION_SCORES.includes(value)
  );
}

/**
 * @param {Partial<Record<string, number>>} scores
 * @returns {{ valid: true } | { valid: false, invalidKey: string, invalidValue: unknown }}
 */
export function validateInspectionScores(scores) {
  if (!scores || typeof scores !== "object") {
    return { valid: false, invalidKey: "(root)", invalidValue: scores };
  }
  for (const key of INSPECTION_SCORE_KEYS) {
    const v = scores[key];
    if (!isValidInspectionScore(v)) {
      return { valid: false, invalidKey: key, invalidValue: v };
    }
  }
  return { valid: true };
}

/**
 * conditionPercent = Σ (score/10 × weight), sau đó cap 100 → 99.
 * @param {Record<string, number>} scores — đủ 6 key, mỗi giá trị 0–10
 * @returns {number} NaN nếu thiếu key hoặc điểm không hợp lệ
 */
export function calculateConditionPercent(scores) {
  const check = validateInspectionScores(scores);
  if (!check.valid) return NaN;

  let sum = 0;
  for (const key of INSPECTION_SCORE_KEYS) {
    const s = scores[key];
    sum += (s / 10) * INSPECTION_WEIGHTS[key];
  }

  let pct = sum;
  if (pct >= 100) pct = 99;
  return Math.round(pct * 10) / 10;
}

/**
 * @param {number} percent — đã cap 99 nếu cần
 * @returns {keyof typeof OVERALL_CONDITION | null}
 */
export function overallConditionFromPercent(percent) {
  if (typeof percent !== "number" || Number.isNaN(percent)) return null;
  if (percent >= 90) return OVERALL_CONDITION.EXCELLENT;
  if (percent >= 70) return OVERALL_CONDITION.GOOD;
  if (percent >= 50) return OVERALL_CONDITION.FAIR;
  return OVERALL_CONDITION.POOR;
}

/**
 * Khung = 0 hoặc phanh = 0 → luôn FAIL (BE).
 * @param {Partial<Record<string, number>>} scores
 */
export function isCriticalFrameOrBrakeFail(scores) {
  return scores?.frameScore === 0 || scores?.brakeScore === 0;
}

/**
 * @param {Record<string, number>} scores
 * @returns {"PASS" | "FAIL"}
 */
export function predictInspectionResult(scores) {
  const pct = calculateConditionPercent(scores);
  if (Number.isNaN(pct)) return "FAIL";
  if (pct < 50) return "FAIL";
  if (isCriticalFrameOrBrakeFail(scores)) return "FAIL";
  return "PASS";
}

/**
 * Gợi ý hiển thị cảnh báo trên form (không thay thế validateInspectionScores).
 * @param {Partial<Record<string, number>>} scores
 * @returns {string[]} mã gợi ý: critical_frame_brake | below_50
 */
export function inspectionPreviewWarnings(scores) {
  const warnings = [];
  if (isCriticalFrameOrBrakeFail(scores)) {
    warnings.push("critical_frame_brake");
  }
  const pct = calculateConditionPercent(
    validateInspectionScores(scores).valid ? scores : {},
  );
  if (!Number.isNaN(pct) && pct < 50) {
    warnings.push("below_50");
  }
  return warnings;
}

/**
 * Một object snapshot cho UI preview (progress bar, badge…).
 * @param {Partial<Record<string, number>>} scores — có thể thiếu field khi đang nhập dần
 * @returns {{
 *   complete: boolean,
 *   conditionPercent: number | null,
 *   overallCondition: string | null,
 *   result: "PASS" | "FAIL" | null,
 *   warnings: string[]
 * }}
 */
export function buildInspectionPreview(scores) {
  const complete = validateInspectionScores(scores).valid;
  if (!complete) {
    return {
      complete: false,
      conditionPercent: null,
      overallCondition: null,
      result: null,
      warnings: inspectionPreviewWarnings(scores),
    };
  }

  const conditionPercent = calculateConditionPercent(scores);
  const overallCondition = overallConditionFromPercent(conditionPercent);
  const result = predictInspectionResult(scores);

  return {
    complete: true,
    conditionPercent,
    overallCondition,
    result,
    warnings: inspectionPreviewWarnings(scores),
  };
}

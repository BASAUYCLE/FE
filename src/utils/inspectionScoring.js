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

/**
 * Tiêu chí cơ khí — điểm 0 ⇒ FAIL (BE `InspectionService#determineResult`).
 * `colorScore` không thuộc nhóm này.
 */
export const MECHANICAL_SCORE_KEYS = Object.freeze([
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
 * Cap % theo điểm thấp nhất — khớp BE `InspectionService#applyMinScoreCeiling`.
 * @param {number} conditionPercent — đã qua bước ≥100 → 99
 * @param {Record<string, number>} scores — đủ 6 key
 */
export function applyMinScoreCeiling(conditionPercent, scores) {
  const vals = INSPECTION_SCORE_KEYS.map((k) => scores[k]).filter((v) =>
    Number.isFinite(v),
  );
  if (vals.length < INSPECTION_SCORE_KEYS.length) return conditionPercent;
  const minScore = Math.min(...vals);
  if (minScore <= 3) return Math.min(conditionPercent, 69.0);
  if (minScore === 7) return Math.min(conditionPercent, 89.0);
  return conditionPercent;
}

/**
 * conditionPercent = Σ (score/10 × weight) → ≥100 → 99 → applyMinScoreCeiling → làm tròn 1 chữ số.
 * Khớp BE `InspectionService` (tính %, xe cũ không 100%, cap theo min tiêu chí).
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
  pct = applyMinScoreCeiling(pct, scores);
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
 * Một điểm tiêu chí (chỉ 0, 3, 7, 10) → một trong 4 mức tình trạng hiển thị biên bản.
 * Khớp rubric: 10 như mới · 7 sử dụng nhẹ · 3 thay thế/chỉnh sửa · 0 hư hỏng nặng.
 * @param {unknown} score
 * @returns {typeof OVERALL_CONDITION[keyof typeof OVERALL_CONDITION] | null}
 */
export function overallConditionKeyFromInspectionScore(score) {
  const n = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  if (n === 10) return OVERALL_CONDITION.EXCELLENT;
  if (n === 7) return OVERALL_CONDITION.GOOD;
  if (n === 3) return OVERALL_CONDITION.FAIR;
  if (n === 0) return OVERALL_CONDITION.POOR;
  return null;
}

/**
 * Bất kỳ bộ phận cơ khí nào = 0 → FAIL (BE; `colorScore` = 0 không kích hoạt rule này).
 * @param {Partial<Record<string, number>>} scores
 */
export function isMechanicalZeroFail(scores) {
  if (!scores) return false;
  return MECHANICAL_SCORE_KEYS.some((k) => scores[k] === 0);
}

/**
 * @deprecated Dùng `isMechanicalZeroFail` — BE mở rộng ngoài khung/phanh
 * @param {Partial<Record<string, number>>} scores
 */
export function isCriticalFrameOrBrakeFail(scores) {
  return isMechanicalZeroFail(scores);
}

/**
 * Khớp BE `InspectionService#determineResult`.
 * @param {Record<string, number>} scores
 * @returns {"PASS" | "FAIL"}
 */
export function predictInspectionResult(scores) {
  if (!validateInspectionScores(scores).valid) return "FAIL";
  const pct = calculateConditionPercent(scores);
  if (Number.isNaN(pct)) return "FAIL";

  if (isMechanicalZeroFail(scores)) return "FAIL";

  if (scores.frameScore <= 3 && scores.groupsetScore <= 3) return "FAIL";

  const countOfThrees = INSPECTION_SCORE_KEYS.filter(
    (k) => scores[k] === 3,
  ).length;
  if (countOfThrees >= 3 || pct < 50) return "FAIL";

  return "PASS";
}

/**
 * Gợi ý hiển thị cảnh báo trên form (không thay thế validateInspectionScores).
 * @param {Partial<Record<string, number>>} scores
 * @returns {string[]} mã: mechanical_zero | franken_frame_groupset | too_many_threes | below_50
 */
export function inspectionPreviewWarnings(scores) {
  const warnings = [];
  const complete = validateInspectionScores(scores).valid;
  if (!complete) return warnings;

  if (isMechanicalZeroFail(scores)) {
    warnings.push("mechanical_zero");
  }
  if (scores.frameScore <= 3 && scores.groupsetScore <= 3) {
    warnings.push("franken_frame_groupset");
  }
  const countOfThrees = INSPECTION_SCORE_KEYS.filter(
    (k) => scores[k] === 3,
  ).length;
  if (countOfThrees >= 3) {
    warnings.push("too_many_threes");
  }

  const pct = calculateConditionPercent(scores);
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

/**
 * Rubric hiển thị UI — khớp INSPECTION_API_GUIDE (4 mức điểm + 6 tiêu chí).
 * Logic tính toán: `src/utils/inspectionScoring.js`.
 */

import { VALID_INSPECTION_SCORES } from "../utils/inspectionScoring";

export { VALID_INSPECTION_SCORES };

/**
 * Bộ phận cơ khí — điểm 0 ⇒ FAIL (BE `InspectionService`).
 * `colorScore` không nằm trong nhóm này.
 */
export const INSPECTION_MECHANICAL_CRITERIA_KEYS = Object.freeze(
  new Set([
    "frameScore",
    "groupsetScore",
    "brakeScore",
    "controlScore",
    "wheelScore",
  ]),
);

/** Alias ngắn cho UI (badge “critical” / 0 → FAIL) */
export const INSPECTION_CRITICAL_CRITERIA_KEYS =
  INSPECTION_MECHANICAL_CRITERIA_KEYS;

/** 4 mức điểm cho radio / button group / dropdown */
export const INSPECTION_SCORE_OPTIONS = Object.freeze([
  {
    value: 10,
    labelVi: "Như mới",
    labelEn: "Like new",
    hintVi: "Như mới, nguyên bản, không có dấu hiệu sử dụng",
    hintEn: "Like new, original, no signs of use",
    emoji: "🟢",
  },
  {
    value: 7,
    labelVi: "Nguyên bản, sử dụng nhẹ",
    labelEn: "Original, light use",
    hintVi: "Nguyên bản nhưng có dấu hiệu sử dụng nhẹ",
    hintEn: "Original but with light signs of use",
    emoji: "🟡",
  },
  {
    value: 3,
    labelVi: "Thay thế / chỉnh sửa",
    labelEn: "Replaced / modified",
    hintVi: "Có dấu hiệu thay thế hoặc chỉnh sửa",
    hintEn: "Signs of replacement or modification",
    emoji: "🟠",
  },
  {
    value: 0,
    labelVi: "Hư hỏng nặng",
    labelEn: "Severely damaged",
    hintVi: "Hư hỏng nặng, không có khả năng sử dụng",
    hintEn: "Severely damaged, not fit for use",
    emoji: "🔴",
  },
]);

/**
 * @param {unknown} score
 * @returns {(typeof INSPECTION_SCORE_OPTIONS)[number] | null}
 */
export function getInspectionScoreOption(score) {
  const n = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(n)) return null;
  for (let i = 0; i < INSPECTION_SCORE_OPTIONS.length; i++) {
    if (INSPECTION_SCORE_OPTIONS[i].value === n) {
      return INSPECTION_SCORE_OPTIONS[i];
    }
  }
  return null;
}

/**
 * Inspector rubric description (EN) for a saved score — text only, same `hintEn` as the form (no numeric prefix).
 * @param {unknown} score
 * @returns {string | null}
 */
export function formatInspectorScoreRubricLineEn(score) {
  const opt = getInspectionScoreOption(score);
  if (!opt) return null;
  return opt.hintEn;
}

/**
 * Thứ tự hiển thị form — trùng key API.
 * Trọng số chỉ để hiển thị; công thức + cap % trong `inspectionScoring.js` (khớp BE).
 */
export const INSPECTION_CRITERIA_ROWS = Object.freeze([
  {
    key: "colorScore",
    weightPercent: 10,
    labelVi: "Sơn & thẩm mỹ",
    labelEn: "Paint & aesthetics",
    hintVi: "Sơn, tổng thể ngoại hình",
    hintEn: "Paint and overall appearance",
  },
  {
    key: "frameScore",
    weightPercent: 30,
    labelVi: "Khung xe",
    labelEn: "Frame",
    hintVi: "Ống khung, mối hàn, thẳng khung và tình trạng kết cấu",
    hintEn: "Frame tubes, welds, alignment, and structural condition",
  },
  {
    key: "groupsetScore",
    weightPercent: 25,
    labelVi: "Bộ truyền động",
    labelEn: "Groupset / drivetrain",
    hintVi: "Groupset",
    hintEn: "Drivetrain condition",
  },
  {
    key: "brakeScore",
    weightPercent: 15,
    labelVi: "Phanh",
    labelEn: "Brakes",
    hintVi: "Lực phanh, má phanh, đĩa hoặc vành, dây hoặc dầu phanh",
    hintEn: "Braking power; pads, rotors or rims, cables or hydraulics",
  },
  {
    key: "controlScore",
    weightPercent: 10,
    labelVi: "Ghi đông & tay lái",
    labelEn: "Cockpit / controls",
    hintVi: "Control",
    hintEn: "Handlebar, stem, levers",
  },
  {
    key: "wheelScore",
    weightPercent: 10,
    labelVi: "Bánh & lốp",
    labelEn: "Wheels & tires",
    hintVi: "Wheel",
    hintEn: "Wheels and tires",
  },
]);

/** Mã cảnh báo từ inspectionPreviewWarnings → chuỗi hiển thị */
export const INSPECTION_PREVIEW_WARNING_TEXT_VI = Object.freeze({
  mechanical_zero:
    "Một bộ phận cơ khí (khung, truyền động, phanh, ghi đông, bánh) đang 0 điểm — hệ thống sẽ ghi nhận FAIL.",
  franken_frame_groupset:
    "Khung và bộ truyền động đều ≤ 3 điểm (xe chắp vá nặng) — FAIL.",
  too_many_threes:
    "Có từ 3 tiêu chí trở lên đang 3 điểm — FAIL.",
  below_50:
    "Tổng tình trạng dưới 50% — kết quả dự kiến là FAIL.",
});

export const INSPECTION_PREVIEW_WARNING_TEXT_EN = Object.freeze({
  mechanical_zero:
    "A mechanical score (frame, drivetrain, brakes, cockpit, wheels) is 0 — the system will record FAIL.",
  franken_frame_groupset:
    "Frame and drivetrain are both ≤ 3 (heavy Franken-bike pattern) — FAIL.",
  too_many_threes:
    "Three or more criteria are scored 3 — FAIL.",
  below_50: "Overall condition is under 50% — expected result is FAIL.",
});

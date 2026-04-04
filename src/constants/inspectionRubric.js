/**
 * Rubric hiển thị UI — khớp INSPECTION_API_GUIDE (4 mức điểm + 6 tiêu chí).
 * Logic tính toán: `src/utils/inspectionScoring.js`.
 */

import { VALID_INSPECTION_SCORES } from "../utils/inspectionScoring";

export { VALID_INSPECTION_SCORES };

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
 * Thứ tự hiển thị form — trùng key API.
 * Trọng số chỉ để hiển thị; công thức thực tế trong inspectionScoring.INSPECTION_WEIGHTS.
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
    hintVi: "Nếu 0 điểm → tự động FAIL",
    hintEn: "Score 0 forces FAIL",
    critical: true,
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
    hintVi: "Nếu 0 điểm → tự động FAIL",
    hintEn: "Score 0 forces FAIL",
    critical: true,
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
  critical_frame_brake:
    "Khung hoặc phanh đang 0 điểm — hệ thống sẽ ghi nhận FAIL bất kể tổng điểm.",
  below_50:
    "Tổng tình trạng dưới 50% — kết quả dự kiến là FAIL.",
});

export const INSPECTION_PREVIEW_WARNING_TEXT_EN = Object.freeze({
  critical_frame_brake:
    "Frame or brake score is 0 — the system will record FAIL regardless of the total score.",
  below_50: "Overall condition is under 50% — expected result is FAIL.",
});

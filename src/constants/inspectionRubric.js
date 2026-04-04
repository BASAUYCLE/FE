/**
 * Rubric hiển thị UI — khớp INSPECTION_API_GUIDE (4 mức điểm + 6 tiêu chí).
 * Logic tính toán: `src/utils/inspectionScoring.js`.
 */

import { VALID_INSPECTION_SCORES } from "../utils/inspectionScoring";

export { VALID_INSPECTION_SCORES };

/** 4 mức điểm cho radio / button group */
export const INSPECTION_SCORE_OPTIONS = Object.freeze([
  {
    value: 10,
    labelVi: "Như mới",
    hintVi: "Không có dấu hiệu sử dụng nhiều",
    emoji: "🟢",
  },
  {
    value: 7,
    labelVi: "Tốt",
    hintVi: "Nguyên bản, có dấu hiệu sử dụng nhẹ",
    emoji: "🟡",
  },
  {
    value: 3,
    labelVi: "Tạm ổn",
    hintVi: "Có dấu hiệu thay thế hoặc chỉnh sửa",
    emoji: "🟠",
  },
  {
    value: 0,
    labelVi: "Hỏng",
    hintVi: "Hư hỏng nặng, khả năng sử dụng thấp",
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
    hintVi: "Sơn, tổng thể ngoại hình",
  },
  {
    key: "frameScore",
    weightPercent: 30,
    labelVi: "Khung xe",
    hintVi: "Nếu 0 điểm → tự động FAIL",
    critical: true,
  },
  {
    key: "groupsetScore",
    weightPercent: 25,
    labelVi: "Bộ truyền động",
    hintVi: "Groupset",
  },
  {
    key: "brakeScore",
    weightPercent: 15,
    labelVi: "Phanh",
    hintVi: "Nếu 0 điểm → tự động FAIL",
    critical: true,
  },
  {
    key: "controlScore",
    weightPercent: 10,
    labelVi: "Ghi đông & tay lái",
    hintVi: "Control",
  },
  {
    key: "wheelScore",
    weightPercent: 10,
    labelVi: "Bánh & lốp",
    hintVi: "Wheel",
  },
]);

/** Mã cảnh báo từ inspectionPreviewWarnings → chuỗi hiển thị */
export const INSPECTION_PREVIEW_WARNING_TEXT_VI = Object.freeze({
  critical_frame_brake:
    "Khung hoặc phanh đang 0 điểm — hệ thống sẽ ghi nhận FAIL bất kể tổng điểm.",
  below_50:
    "Tổng tình trạng dưới 50% — kết quả dự kiến là FAIL.",
});

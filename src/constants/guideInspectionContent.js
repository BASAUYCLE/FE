/**
 * Nội dung hướng dẫn kiểm định — khớp `inspectionScoring.js` & `inspectionRubric.js` / BE.
 * Dùng trang GuideInspection; có thể tái sử dụng cho tooltip hoặc FAQ sau này.
 */

import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_SCORE_OPTIONS,
} from "./inspectionRubric";

export { INSPECTION_CRITERIA_ROWS, INSPECTION_SCORE_OPTIONS };

/** Tiêu đề & đoạn mở đầu trang */
export const GUIDE_INSPECTION_HERO = Object.freeze({
  titleEn: "Inspection & condition score",
  titleVi: "Kiểm định & phần trăm tình trạng",
  leadVi:
    "BASAUYCLE dùng rubric 6 tiêu chí, mỗi tiêu chí chỉ nhận một trong bốn điểm cố định (0, 3, 7, 10). Từ các điểm này, hệ thống tính phần trăm tình trạng (conditionPercent) và quyết định PASS/FAIL theo quy tắc thống nhất giữa frontend (preview) và backend (kết quả chính thức sau khi inspector submit).",
  leadEn:
    "BASAUYCLE uses a six-criterion rubric. Each criterion is scored with exactly one of four fixed values (0, 3, 7, 10). From those scores the system derives a condition percentage (conditionPercent) and PASS/FAIL using the same rules on the preview and on the server after the inspector submits.",
});

/**
 * Luồng & chỗ xem báo cáo — khớp ProductDetail, ProductPreviewModal, Manage Listings.
 */
export const GUIDE_INSPECTION_MEMBER = Object.freeze({
  titleVi: "Dành cho thành viên (người bán & người mua)",
  titleEn: "For members (sellers & buyers)",
  introVi:
    "Bạn không nhập điểm rubric; inspector và hệ thống xử lý. Phần dưới mô tả trạng thái tin đăng và chỗ xem % / PASS-FAIL trên giao diện.",
  introEn:
    "Members do not enter rubric scores; inspectors and the system do. Below: listing statuses and where the UI shows the condition % and PASS/FAIL.",

  sellerFlow: Object.freeze({
    titleVi: "Luồng người bán",
    titleEn: "Seller journey",
    bulletsVi: [
      "Đăng hoặc chỉnh sửa tin, gửi duyệt — tin ở trạng thái chờ admin (ví dụ Pending).",
      "Admin duyệt nội dung → tin chuyển sang trạng thái đã duyệt, chờ kiểm định (ADMIN_APPROVED): lúc này xe xếp hàng để inspector chấm điểm.",
      "Inspector gửi báo cáo: nếu PASS, tin thường được đưa lên sàn (Available) kèm % và báo cáo; nếu FAIL, tin không hiển thị như xe đạt chuẩn — theo chính sách backend (xem trạng thái trong Quản lý tin đăng / Manage listings).",
      "Theo dõi trạng thái trong mục Quản lý tin đăng; thông báo trong app có thể nhắc khi tin được duyệt hoặc sau kiểm định.",
    ],
    bulletsEn: [
      "Create or edit a listing and submit it for review — it waits for admin (e.g. Pending).",
      "After admin approves content, the listing moves to admin-approved, pending inspection (ADMIN_APPROVED): it is queued for the inspector’s rubric.",
      "When the inspector submits: on PASS, the listing usually goes Available on the marketplace with % and report data; on FAIL, it is not offered as a passing inspection — see status in Manage listings per backend rules.",
      "Track status in Manage listings; in-app notifications may fire when a listing is approved or after inspection completes.",
    ],
  }),

  whereToSee: Object.freeze({
    titleVi: "Xem % và báo cáo kiểm định ở đâu?",
    titleEn: "Where to see the % and inspection report",
    bulletsVi: [
      "Trang chi tiết sản phẩm (đường dẫn dạng /product/{id}): khi backend đã có báo cáo, cột Pro Inspection Report hiển thị PASS/FAIL, thanh % tình trạng, nhãn tổng thể (Excellent / Good / …) và bảng 6 tiêu chí (nếu API trả điểm).",
      "Cùng trang đó, trong bảng Technical specs, dòng Inspection tóm tắt ngắn (ví dụ phần trăm kèm nhãn, hoặc Failed kèm % khi có).",
      "Modal xem nhanh tin (khi mở preview bài đăng): có thể có dòng kiểm định tương tự trong bảng thông số khi report đã tồn tại.",
      "Nếu chưa có báo cáo hoặc tin chưa qua kiểm định xong, các khối trên có thể ẩn hoặc hiển thị chưa kiểm định — không có nghĩa hệ thống lỗi.",
    ],
    bulletsEn: [
      "Product detail (/product/{id}): when the backend exposes a report, the Pro Inspection Report panel shows PASS/FAIL, the condition % bar, the overall band (Excellent / Good / …), and the six criteria (if scores are returned).",
      "On the same page, under Technical specs, the Inspection row gives a short summary (e.g. % with band, or Failed with % when present).",
      "Listing preview modals may show a matching inspection line in the specs table when a report exists.",
      "If there is no report yet or inspection is not finished, those blocks may be hidden or show a not-inspected state — that is expected.",
    ],
  }),

  buyerNotes: Object.freeze({
    titleVi: "Gợi ý cho người mua",
    titleEn: "Tips for buyers",
    bulletsVi: [
      "Ưu tiên xem Pro Inspection Report và dòng Inspection trên trang xe trước khi cọc/mua; % và PASS/FAIL phản ánh rubric đã submit, không phải đánh giá chủ quan của người bán.",
      "Nếu tin chỉ mới chờ kiểm định, chưa có % công bố — đợi tin Available (hoặc có báo cáo đầy đủ) rồi quyết định.",
    ],
    bulletsEn: [
      "Prefer Pro Inspection Report and the Inspection spec row before depositing; % and PASS/FAIL reflect the submitted rubric, not the seller’s opinion.",
      "If the listing is still pending inspection, there may be no public % yet — wait until it is Available (or shows a full report) before deciding.",
    ],
  }),
});

/** Công thức & giới hạn — khớp calculateConditionPercent */
export const GUIDE_INSPECTION_FORMULA = Object.freeze({
  titleVi: "Cách tính % tình trạng",
  titleEn: "How the condition percentage is calculated",
  bulletsVi: [
    "Với mỗi tiêu chí, điểm nhập chỉ có thể là 0, 3, 7 hoặc 10 (điểm khác bị từ chối, mã lỗi 1089).",
    "Mỗi tiêu chí có một trọng số phần trăm; tổng trọng số của 6 tiêu chí = 100%.",
    "Đóng góp của một tiêu chí vào tổng % = (điểm ÷ 10) × (trọng số %).",
    "conditionPercent = tổng các đóng góp trên; nếu tổng ≥ 100% thì được giới hạn còn 99% (làm tròn một chữ số thập phân như trên FE).",
  ],
  bulletsEn: [
    "Each criterion must be scored 0, 3, 7, or 10 only (other values are rejected; error code 1089).",
    "Each criterion has a weight in percent; the six weights sum to 100%.",
    "A criterion’s contribution = (score ÷ 10) × (weight %).",
    "conditionPercent is the sum of those contributions; if the sum is ≥ 100%, it is capped at 99% (rounded to one decimal place like the UI).",
  ],
  formulaLineVi:
    "Tóm tắt: conditionPercent ≈ Σ (điểm_i / 10 × trọng_số_i%), sau đó áp rule cap 99 nếu cần.",
  formulaLineEn:
    "Summary: conditionPercent ≈ Σ (score_i / 10 × weight_i%), then apply the 99 cap when needed.",
});

/** PASS/FAIL — khớp predictInspectionResult + BE */
export const GUIDE_INSPECTION_PASS_FAIL = Object.freeze({
  titleVi: "PASS và FAIL được quyết định thế nào?",
  titleEn: "How PASS and FAIL are determined",
  bulletsVi: [
    "Nếu điểm khung (frame) = 0 hoặc điểm phanh (brake) = 0 → luôn FAIL, bất kể các tiêu chí khác (an toàn / kết cấu).",
    "Nếu conditionPercent dưới 50% → FAIL.",
    "Các trường hợp còn lại (đủ 6 điểm hợp lệ, không rơi vào hai rule trên) → PASS theo logic preview; kết quả niêm yết chính thức do backend trả về sau POST submit.",
    "Inspector không có nút “chọn PASS” riêng: chỉ gửi điểm và ghi chú; PASS/FAIL do hệ thống áp dụng rubric.",
  ],
  bulletsEn: [
    "If frame score = 0 or brake score = 0 → always FAIL, regardless of other criteria (safety / structure).",
    "If conditionPercent is below 50% → FAIL.",
    "Otherwise (all six scores valid, and neither rule above applies) → PASS in the preview logic; the authoritative listing outcome comes from the backend after the submit API.",
    "There is no separate “choose PASS” control: inspectors submit scores and notes only; PASS/FAIL follows the rubric.",
  ],
});

/** Band nhãn tổng thể — khớp overallConditionFromPercent */
export const GUIDE_INSPECTION_BANDS = Object.freeze({
  titleVi: "Nhãn tình trạng tổng thể (overall condition)",
  titleEn: "Overall condition band",
  introVi:
    "Sau khi có conditionPercent, hệ thống có thể gán nhãn dải (EXCELLENT / GOOD / FAIR / POOR) theo ngưỡng phần trăm. Đây là thông tin hiển thị kèm %, không thay thế PASS/FAIL.",
  introEn:
    "After conditionPercent is known, the system may assign a band label (EXCELLENT / GOOD / FAIR / POOR) from percentage thresholds. This is shown alongside the %; it does not replace PASS/FAIL.",
  rows: Object.freeze([
    { minPct: 90, labelVi: "Xuất sắc — gần như mới", labelEn: "Excellent — like new" },
    { minPct: 70, labelVi: "Tốt — dấu hiệu sử dụng nhẹ", labelEn: "Good — light signs of use" },
    { minPct: 50, labelVi: "Tạm ổn — mòn rõ", labelEn: "Fair — noticeable wear" },
    { minPct: 0, labelVi: "Kém — cần sửa chữa", labelEn: "Poor — needs repair" },
  ]),
});

/** Ghi chú API / lỗi thường gặp */
export const GUIDE_INSPECTION_API_NOTES = Object.freeze({
  titleVi: "Lưu ý kỹ thuật & mã lỗi",
  titleEn: "Technical notes & error codes",
  bulletsVi: [
    "1089 — điểm không thuộc tập {0, 3, 7, 10} hoặc thiếu tiêu chí khi submit.",
    "1033 — bài đăng không ở trạng thái cho phép gửi kiểm định (ví dụ chưa admin-approved hoặc đã xử lý xong).",
    "Preview trên trang inspector giúp xem trước % và PASS/FAIL; giá trị chính thức lấy từ response sau khi submit thành công.",
  ],
  bulletsEn: [
    "1089 — a score is not in {0, 3, 7, 10} or a criterion is missing on submit.",
    "1033 — the post is not in a status that allows inspection submit (e.g. not admin-approved or already processed).",
    "The inspector page preview shows estimated % and PASS/FAIL; authoritative values come from the successful submit response.",
  ],
});

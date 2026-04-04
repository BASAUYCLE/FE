/**
 * Tiêu chí góc ảnh — đồng bộ với form đăng tin & quy tắc duyệt bài trên BASAUYCLE.
 */
export const BICYCLE_PHOTO_CRITERIA = [
  {
    code: "OVERALL_DRIVE_SIDE",
    titleVi: "Toàn xe — phía đùi đạp",
    titleEn: "Overall — drive side",
    hintVi:
      "Chụp ngang hoặc chéo nhẹ, thấy rõ khung, bánh, groupset bên có đùi đạp. Đây thường là ảnh bìa (thumbnail) phù hợp nhất.",
  },
  {
    code: "OVERALL_NON_DRIVE_SIDE",
    titleVi: "Toàn xe — phía không đùi đạp",
    titleEn: "Overall — non-drive side",
    hintVi:
      "Góc tương tự drive side nhưng phía đối diện; giúp người mua và kiểm định đối chiếu tổng thể.",
  },
  {
    code: "COCKPIT_AREA",
    titleVi: "Khu vực cockpit",
    titleEn: "Cockpit area",
    hintVi:
      "Tay lái, stem, ghi đông, màn hình (nếu có), tay bấm số — thấy rõ tình trạng cầm nắm và điều khiển.",
  },
  {
    code: "DRIVETRAIN_CLOSEUP",
    titleVi: "Cận groupset / truyền động",
    titleEn: "Drivetrain close-up",
    hintVi:
      "Cận đĩa, líp, derailleur, sên; đủ sáng để thấy mòn và bẩn dầu mỡ (minh bạch tình trạng).",
  },
  {
    code: "FRONT_BRAKE",
    titleVi: "Phanh trước",
    titleEn: "Front brake",
    hintVi:
      "Caliper hoặc đĩa phanh trước, má phanh nếu rim brake — rõ model và độ mòn. Chụp rõ để thấy độ mòn lốp xe và tình trạng phanh.",
  },
  {
    code: "REAR_BRAKE",
    titleVi: "Phanh sau",
    titleEn: "Rear brake",
    hintVi: "Tương tự phanh trước; đảm bảo không chụp quá tối hoặc quá chói. Chụp rõ để thấy độ mòn lốp xe và tình trạng phanh.",
  },
  {
    code: "DEFECT_POINT",
    titleVi: "Điểm lỗi / trầy xước (tùy chọn)",
    titleEn: "Defects / scratches (optional)",
    hintVi:
      "Mỗi ảnh một vị trí cần minh bạch (trầy sơn, móp, nứt carbon…). Có thể tải nhiều ảnh cho các vết khác nhau.",
  },
];

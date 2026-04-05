import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  IconButton,
  Fade,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ZoomIn } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { BICYCLE_PHOTO_CRITERIA } from "../../constants/bicyclePhotoCriteria";
import drivesideExample from "../../assets/driveside.jpg";

export default function GuidePhotoUpload() {
  const [driveSideLightboxOpen, setDriveSideLightboxOpen] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "Hướng dẫn ảnh xe | BASAUYCLE";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 26, md: 32 },
              fontWeight: 800,
              textAlign: "center",
              mb: 1,
            }}
          >
            Hướng dẫn ảnh xe đăng trên BASAUYCLE
          </Typography>
          <Typography
            sx={{ textAlign: "center", color: "#64748b", fontSize: 15, mb: 4 }}
          >
            Giúp người mua và bộ phận kiểm duyệt nhìn rõ tình trạng xe. Vui lòng
            chuẩn bị đủ các góc ảnh theo bảng bên dưới trước khi đăng tin.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Vì sao cần đủ góc ảnh?
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            BASAUYCLE là sàn giao dịch có quy trình duyệt bài và (khi cần) kiểm
            định. Ảnh đúng chuẩn giúp <strong>minh bạch tình trạng xe</strong>,
            giảm tranh chấp sau này và rút ngắn thời gian xử lý tin đăng của
            bạn.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Ảnh tải lên cần là <strong>file hình</strong> (ví dụ JPG, PNG), rõ
            nét; mỗi ô bắt buộc trên form phải có ít nhất một ảnh. Một ảnh toàn
            cảnh bên đùi đạp thường được dùng làm ảnh đại diện hiển thị trên
            chợ.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Các góc ảnh cần có
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: 13, mb: 1.5 }}>
            Sáu góc đầu là bắt buộc; phần mô tả lỗi / trầy xước là tùy chọn
            nhưng nên có nếu xe có vết hư hỏng.
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ mb: 3, border: "1px solid #e2e8f0" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>
                    Góc ảnh
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gợi ý chụp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {BICYCLE_PHOTO_CRITERIA.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell sx={{ fontSize: 14, verticalAlign: "top" }}>
                      <strong>{row.titleVi}</strong>
                      <Box
                        component="span"
                        sx={{
                          display: "block",
                          color: "#64748b",
                          fontSize: 13,
                          mt: 0.25,
                        }}
                      >
                        {row.titleEn}
                      </Box>
                      {row.code === "OVERALL_DRIVE_SIDE" && (
                        <>
                          <Box
                            sx={{
                              position: "relative",
                              display: "block",
                              width: "100%",
                              maxWidth: 320,
                              mt: 1.5,
                              borderRadius: 4,
                              overflow: "hidden",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Box
                              component="img"
                              src={drivesideExample}
                              alt="Ví dụ ảnh toàn xe phía đùi đạp (drive side)"
                              sx={{
                                display: "block",
                                width: "100%",
                                height: "auto",
                                verticalAlign: "bottom",
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              type="button"
                              size="small"
                              aria-label="Phóng to ảnh mẫu"
                              onClick={() => setDriveSideLightboxOpen(true)}
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                bgcolor: "rgba(255,255,255,0.94)",
                                color: "#0f766e",
                                boxShadow: "0 1px 4px rgba(15,23,42,0.12)",
                                "&:hover": {
                                  bgcolor: "rgba(255,255,255,1)",
                                },
                              }}
                            >
                              <ZoomIn size={18} strokeWidth={2} aria-hidden />
                            </IconButton>
                          </Box>
                          <Dialog
                            open={driveSideLightboxOpen}
                            onClose={() => setDriveSideLightboxOpen(false)}
                            maxWidth={false}
                            TransitionComponent={Fade}
                            transitionDuration={{ enter: 320, exit: 220 }}
                            slotProps={{
                              backdrop: {
                                sx: {
                                  backgroundColor: "rgba(15, 23, 42, 0.48)",
                                  backdropFilter: "blur(12px)",
                                  WebkitBackdropFilter: "blur(12px)",
                                },
                              },
                              paper: {
                                sx: {
                                  bgcolor: "transparent",
                                  backgroundImage: "none",
                                  boxShadow: "none",
                                  overflow: "visible",
                                  maxWidth: "min(96vw, 1120px)",
                                  width: "100%",
                                  m: 2,
                                },
                              },
                            }}
                          >
                            <IconButton
                              type="button"
                              aria-label="Đóng"
                              onClick={() => setDriveSideLightboxOpen(false)}
                              sx={{
                                position: "absolute",
                                right: 12,
                                top: 12,
                                zIndex: 1,
                                color: "#f8fafc",
                                bgcolor: "rgba(15, 23, 42, 0.45)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                "&:hover": {
                                  bgcolor: "rgba(15, 23, 42, 0.62)",
                                },
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                            <DialogContent
                              sx={{
                                p: { xs: 2, sm: 3 },
                                pt: { xs: 6, sm: 7 },
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "visible",
                              }}
                            >
                              <Zoom
                                in={driveSideLightboxOpen}
                                timeout={{ enter: 520, exit: 240 }}
                                style={{
                                  transitionDelay: driveSideLightboxOpen
                                    ? "60ms"
                                    : "0ms",
                                }}
                                easing={{
                                  enter: "cubic-bezier(0.16, 1, 0.3, 1)",
                                  exit: "cubic-bezier(0.4, 0, 1, 1)",
                                }}
                              >
                                <Box
                                  component="img"
                                  src={drivesideExample}
                                  alt="Ví dụ ảnh toàn xe phía đùi đạp (drive side), xem phóng to"
                                  sx={{
                                    display: "block",
                                    maxWidth: "100%",
                                    maxHeight: "min(82dvh, 860px)",
                                    width: "auto",
                                    height: "auto",
                                    objectFit: "contain",
                                    borderRadius: 3,
                                    boxShadow:
                                      "0 4px 6px -1px rgba(0,0,0,0.08), 0 24px 48px -12px rgba(15,23,42,0.45), 0 0 0 1px rgba(255,255,255,0.06)",
                                    verticalAlign: "bottom",
                                  }}
                                />
                              </Zoom>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#4b5563",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {row.hintVi}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Chất lượng ảnh (khuyến nghị)
          </Typography>
          <Typography
            component="ul"
            sx={{ color: "#4b5563", fontSize: 14, pl: 2.5, mb: 3 }}
          >
            <li>
              Ánh sáng đều, tránh ngược sáng mạnh làm “cháy” khung hoặc tối
              groupset.
            </li>
            <li>
              Ảnh nét, không mờ; có thể chụp nhiều lần và chọn bản rõ nhất.
            </li>
            <li>Giữ nguyên tỷ lệ xe — tránh méo do filter quá mức.</li>
            <li>
              Với ảnh <strong>trầy xước / lỗi</strong>: chụp cận từng vị trí, có
              thể ghi thêm trong phần mô tả bài đăng.
            </li>
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            4. Khi đăng tin trên website
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Vào mục{" "}
            <Link to="/post" style={{ color: "#0d9488", fontWeight: 600 }}>
              Đăng bán xe
            </Link>
            , bạn sẽ thấy từng ô upload tương ứng với các góc ảnh ở bảng trên —
            chỉ cần chọn đúng ảnh cho đúng ô. Ô ảnh lỗi là tùy chọn nhưng nên
            điền nếu có hư hỏng cần công khai.
          </Typography>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Link
              to="/post"
              aria-label="Mở trang đăng tin xe"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                backgroundColor: "#0d9488",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Đến trang đăng tin
            </Link>
          </Box>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}

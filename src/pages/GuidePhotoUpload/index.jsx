import { useEffect } from "react";
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
} from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { BICYCLE_PHOTO_CRITERIA } from "../../constants/bicyclePhotoCriteria";

export default function GuidePhotoUpload() {
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
            Tiêu chí khớp hệ thống kiểm duyệt: mỗi ảnh gửi lên server phải dùng
            đúng <strong>imageType</strong> mà backend chấp nhận (xem bảng bên
            dưới).
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Cách hệ thống nhận ảnh (API)
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Sau khi tạo bài đăng, từng file được gửi lên{" "}
            <Box
              component="code"
              sx={{
                bgcolor: "#e2e8f0",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: 13,
              }}
            >
              POST /images
            </Box>{" "}
            dạng <strong>multipart/form-data</strong> với các trường:{" "}
            <code>postId</code>, <code>image</code> (file),{" "}
            <code>imageType</code> (một trong các mã trong bảng), và{" "}
            <code>isThumbnail</code> (true/false — thường chỉ một ảnh đại diện).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Backend chỉ chấp nhận đúng các giá trị <code>imageType</code> đã
            định nghĩa; giá trị khác sẽ bị từ chối. Ảnh được lưu qua dịch vụ lưu
            trữ ảnh (Cloudinary), định dạng phải là <strong>ảnh hợp lệ</strong>,
            file không được để trống.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Bảng tiêu chí góc chụp (imageType)
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ mb: 3, border: "1px solid #e2e8f0" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Mã BE</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gợi ý chụp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {BICYCLE_PHOTO_CRITERIA.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>
                      <Box
                        component="code"
                        sx={{ fontSize: 12, wordBreak: "break-all" }}
                      >
                        {row.code}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>
                      <strong>{row.titleVi}</strong>
                      <br />
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        {row.titleEn}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: "#4b5563", fontSize: 14 }}>
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
              Với <strong>DEFECT_POINT</strong>: chụp cận, có thể kèm mô tả
              trong phần mô tả bài đăng.
            </li>
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            4. Trên form đăng tin
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Trang{" "}
            <Link to="/post" style={{ color: "#0d9488", fontWeight: 600 }}>
              Post a Bike
            </Link>{" "}
            đã map sẵn 6 ô bắt buộc và ảnh lỗi tùy chọn đúng các mã trên. Bạn
            chỉ cần chọn đúng ô tương ứng với góc chụp.
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

import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

/**
 * Hướng dẫn chấm điểm / kiểm định / % tình trạng (member + inspector).
 * Bổ sung nội dung theo từng commit (rubric, luồng, hiển thị trên sản phẩm).
 */
export default function GuideInspection() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
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
              mb: 2,
            }}
          >
            Inspection & condition score
          </Typography>
          <Typography
            sx={{
              color: "#6b7280",
              fontSize: 15,
              textAlign: "center",
              mb: 4,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            Giới thiệu cách kiểm định, rubric 6 tiêu chí và cách hệ thống tính
            phần trăm tình trạng — dành cho thành viên và inspector. Nội dung
            chi tiết sẽ được mở rộng trong các bản cập nhật tiếp theo.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}

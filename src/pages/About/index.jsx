import { useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const cardSx = {
    p: { xs: 3, md: 4 },
    borderRadius: 3,
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 30, md: 40 },
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Về BASAUYCLE
            </Typography>
            <Typography
              sx={{
                mt: 2,
                color: "#6b7280",
                maxWidth: 720,
                mx: "auto",
                fontSize: { xs: 14, md: 15 },
              }}
            >
              BASAUYCLE là sàn xe đạp tại Việt Nam được xây dựng trên nền tảng
              tin cậy. Chúng tôi giúp người mua và người bán giao dịch với tin
              đăng minh bạch, kiểm định độc lập và thanh toán an toàn qua ví và
              ký quỹ.
            </Typography>
          </Box>

          {/* MUI v7: dùng `size` thay cho `item` + xs/md */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={cardSx}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#111827",
                  }}
                >
                  Sứ mệnh
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
                  Mang đến trải nghiệm sàn xe đạp minh bạch, an toàn và thuận
                  tiện cho cộng đồng đạp xe tại Việt Nam.
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
                  BASAUYCLE kết nối người mua và người bán thông qua kiểm duyệt
                  tin đăng, kiểm định, đặt cọc và quy trình thanh toán an toàn,
                  để mỗi chiếc xe đều có thể bắt đầu hành trình ý nghĩa tiếp
                  theo.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={cardSx}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#111827",
                  }}
                >
                  Giá trị cốt lõi
                </Typography>
                <Typography
                  component="ul"
                  sx={{ pl: 2.5, m: 0, color: "#4b5563", fontSize: 14 }}
                >
                  <li>Thông tin xe và lịch sử kiểm định minh bạch.</li>
                  <li>Thanh toán an toàn qua ví và cơ chế ký quỹ.</li>
                  <li>Xử lý tranh chấp rõ ràng, bảo vệ cả hai bên.</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ ...cardSx, height: "auto" }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: "#111827",
              }}
            >
              Cách thức hoạt động
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    1) Kiểm duyệt tin đăng
                  </Box>{" "}
                  — Tin mới được xem xét trước khi hiển thị cho người mua.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    2) Kiểm định độc lập
                  </Box>{" "}
                  — Kiểm định viên xác minh tình trạng xe để tăng độ tin cậy.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    3) Thanh toán an toàn
                  </Box>{" "}
                  — Đặt cọc và thanh toán được xử lý qua ví và ký quỹ.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    4) Hỗ trợ &amp; tranh chấp
                  </Box>{" "}
                  — Khi phát sinh vấn đề, nền tảng có quy trình xử lý tranh chấp
                  rõ ràng.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}

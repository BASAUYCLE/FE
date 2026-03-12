import { useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function About() {
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
              Nền tảng mua bán xe đạp đã qua sử dụng được kiểm định kỹ lưỡng,
              giúp người chơi xe yên tâm giao dịch như trên các hệ thống lớn
              như HelloBike.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  height: "100%",
                }}
              >
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
                  Mang lại trải nghiệm mua bán xe đạp minh bạch, an toàn và
                  thuận tiện cho cộng đồng đam mê xe đạp tại Việt Nam.
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
                  BASAUYCLE kết nối người bán và người mua thông qua hệ thống
                  kiểm định, đặt cọc và thanh toán an toàn, giúp mỗi chiếc xe
                  có hành trình mới xứng đáng.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  height: "100%",
                }}
              >
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
                  <li>Minh bạch thông tin xe và lịch sử kiểm định.</li>
                  <li>Thanh toán an toàn thông qua ví và hợp đồng ký quỹ.</li>
                  <li>Dịch vụ hỗ trợ tận tâm trước và sau khi mua.</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


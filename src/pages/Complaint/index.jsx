import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Complaint() {
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
              mb: 4,
            }}
          >
            Chính sách xử lý khiếu nại
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - Tiếp nhận mọi khiếu nại của khách hàng liên quan đến việc sử dụng
            dịch vụ của công ty.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - Tất cả mọi trường hợp bảo hành, quý khách có thể liên hệ với
            chúng tôi để làm thủ tục bảo hành.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - Thời gian giải quyết khiếu nại trong thời hạn tối đa là 03 (ba)
            ngày làm việc kể từ khi nhận được khiếu nại của khách hàng. Trong
            trường hợp bất khả kháng, hai bên sẽ tự thương lượng.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


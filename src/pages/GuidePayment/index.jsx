import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function GuidePayment() {
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
            Hướng dẫn thanh toán
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Thanh toán tại cửa hàng
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Khách hàng có thể thanh toán trực tiếp tại cửa hàng BASAUYCLE bằng{" "}
            <strong>tiền mặt</strong> hoặc{" "}
            <strong>chuyển khoản ngân hàng</strong>. Nhân viên sẽ xác nhận số
            tiền, in hóa đơn và hoàn tất thủ tục bàn giao xe cho bạn.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Thanh toán khi nhận xe (COD)
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Với những khu vực được hỗ trợ giao hàng, bạn có thể thanh toán{" "}
            <strong>trực tiếp cho nhân viên giao xe</strong> sau khi đã kiểm tra
            đúng xe và phụ kiện đi kèm. Hãy kiểm tra kỹ tình trạng xe trước khi
            xác nhận đã nhận hàng.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Thanh toán online an toàn
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            BASAUYCLE khuyến khích khách hàng sử dụng các hình thức thanh toán
            online qua ngân hàng hoặc cổng thanh toán điện tử để giao dịch
            nhanh chóng và an toàn hơn. Thông tin chi tiết về từng phương thức
            sẽ được hiển thị rõ ràng ở bước thanh toán trên website.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


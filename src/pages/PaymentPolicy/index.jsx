import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function PaymentPolicy() {
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
            Chính sách thanh toán
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Có 3 hình thức thanh toán, khách hàng có thể lựa chọn hình thức
            thuận tiện và phù hợp với mình nhất:
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Cách 1: Thanh toán tiền mặt trực tiếp
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Khách hàng mua hàng tại địa điểm kinh doanh của chúng tôi, tại đây
            khách hàng có thể thanh toán trực tiếp bằng tiền mặt cho nhân viên
            bán hàng.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Cách 2: Thanh toán khi nhận hàng (COD)
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Với hình thức này khách hàng xem hàng tại nhà, thanh toán tiền mặt
            cho nhân viên giao nhận hàng sau khi đã kiểm tra đúng sản phẩm và
            số lượng theo đơn hàng.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Cách 3: Chuyển khoản trước
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Quý khách chuyển khoản trước, sau đó chúng tôi tiến hành giao hàng
            theo thỏa thuận hoặc hợp đồng với Quý khách.
          </Typography>
          <Typography sx={{ color: "#111827", fontSize: 14, mt: 1 }}>
            STK: 8666226868888 – Chủ TK: Công ty BASAUYCLE
          </Typography>
          <Typography sx={{ color: "#111827", fontSize: 14, mb: 3 }}>
            Ngân hàng  – Chi nhánh
          </Typography>

          <Typography
            component="h3"
            sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}
          >
            Lưu ý
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Nội dung chuyển khoản: ghi rõ <strong>Số điện thoại</strong> hoặc{" "}
            <strong>Số đơn hàng</strong>.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Sau khi chuyển khoản, chúng tôi sẽ liên hệ xác nhận và tiến hành
            giao hàng.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Nếu sau thời gian thỏa thuận mà chúng tôi không giao hàng hoặc
            không phản hồi lại, quý khách có thể gửi khiếu nại trực tiếp về địa
            chỉ trụ sở.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mt: 1.5 }}>
            Chúng tôi cam kết kinh doanh minh bạch, hợp pháp, bán hàng chất
            lượng, có nguồn gốc rõ ràng.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


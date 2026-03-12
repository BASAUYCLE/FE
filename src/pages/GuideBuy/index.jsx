import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function GuideBuy() {
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
            Hướng dẫn mua hàng tại BASAUYCLE
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Mua trực tiếp tại cửa hàng
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            Bạn có thể đến trực tiếp các cửa hàng trong hệ thống BASAUYCLE để
            xem xe, thử xe và được tư vấn chi tiết trước khi quyết định mua.
          </Typography>

          <Typography
            component="h3"
            sx={{ fontSize: 16, fontWeight: 600, mt: 2, mb: 1 }}
          >
            Thanh toán tại cửa hàng
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Sau khi chọn được chiếc xe phù hợp, bạn có thể thanh toán bằng tiền
            mặt, chuyển khoản hoặc các phương thức thanh toán điện tử mà cửa
            hàng hỗ trợ. Nhân viên sẽ xuất hóa đơn và kích hoạt chế độ bảo hành
            tương ứng cho xe.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Mua hàng online qua website
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Bước 1: Truy cập trang chủ BASAUYCLE và vào mục Marketplace để lựa
            chọn mẫu xe bạn quan tâm.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Bước 2: Nhấn nút “Đặt mua” hoặc “Mua ngay” trên trang chi tiết xe.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Bước 3: Điền đầy đủ thông tin liên hệ và địa chỉ nhận hàng.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Bước 4: Xác nhận đơn hàng và lựa chọn hình thức thanh toán phù hợp
            (ví dụ: thanh toán online qua ví/NGÂN HÀNG hoặc thanh toán khi nhận
            xe nếu được hỗ trợ).
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Mua hàng qua kênh hỗ trợ
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Nếu bạn cần được tư vấn nhanh, hãy liên hệ hotline hoặc chat với
            đội ngũ hỗ trợ của BASAUYCLE. Họ sẽ giúp bạn chọn đúng mẫu xe theo
            nhu cầu (đi làm, đi học, tập luyện, đua, touring…) và hướng dẫn
            hoàn tất đơn hàng tương tự như trên website.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


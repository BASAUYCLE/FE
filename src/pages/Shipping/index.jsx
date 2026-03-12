import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Shipping() {
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
            Phương thức vận chuyển
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Khách hàng nội thành
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Đối với khách hàng trong khu vực nội thành (theo phạm vi BASAUYCLE
            hỗ trợ), xe sẽ được{" "}
            <strong>nhân viên cửa hàng giao trực tiếp</strong> tới địa chỉ bạn
            cung cấp. Thời gian giao hàng sẽ được hẹn trước để bạn thuận tiện
            sắp xếp.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Khách hàng ngoại thành và các tỉnh lân cận
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Với khách hàng ở ngoại thành hoặc các tỉnh khu vực lân cận, BASAUYCLE
            có thể sử dụng{" "}
            <strong>dịch vụ vận chuyển bằng xe khách hoặc đơn vị giao nhận phù hợp</strong>{" "}
            để đảm bảo xe đến tay bạn nhanh chóng và an toàn. Thông tin chuyến
            xe và thời gian nhận hàng sẽ được thông báo rõ ràng.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Khách hàng toàn quốc
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Đối với khách hàng ở xa, BASAUYCLE hợp tác với{" "}
            <strong>các đơn vị vận chuyển toàn quốc</strong> để giao xe đến tận
            nơi với chi phí hợp lý. Xe sẽ được đóng gói cẩn thận, kèm hướng dẫn
            lắp ráp cơ bản (nếu cần) để bạn có thể sử dụng ngay khi nhận hàng.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


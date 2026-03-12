import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function ReturnPolicy() {
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
            Chính sách đổi trả và hoàn tiền
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Điều kiện đổi trả
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            Quý Khách hàng cần kiểm tra tình trạng hàng hóa và có thể đổi
            hàng/trả lại hàng ngay tại thời điểm giao/nhận hàng trong những
            trường hợp sau:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Hàng không đúng chủng loại, mẫu mã trong đơn hàng đã đặt hoặc như
            trên website tại thời điểm đặt hàng.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Không đủ số lượng, không đủ bộ như trong đơn hàng.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Tình trạng bên ngoài bị ảnh hưởng như rách bao bì, bong tróc, bể
            vỡ…
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Khách hàng có trách nhiệm trình giấy tờ liên quan chứng minh sự
            thiếu sót trên để hoàn thành việc hoàn trả/đổi trả hàng hóa.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Quy định về thời gian thông báo và gửi sản phẩm đổi trả
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thời gian thông báo đổi trả: trong vòng 48h kể từ khi nhận sản
            phẩm đối với trường hợp sản phẩm thiếu phụ kiện, quà tặng hoặc bể
            vỡ.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thời gian gửi chuyển trả sản phẩm: trong vòng 14 ngày kể từ khi
            nhận sản phẩm.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Địa điểm đổi trả sản phẩm: Khách hàng có thể mang hàng trực tiếp
            đến văn phòng/cửa hàng của chúng tôi hoặc chuyển qua đường bưu
            điện.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Trong trường hợp Quý Khách hàng có ý kiến đóng góp/khiếu nại liên
            quan đến chất lượng sản phẩm, Quý Khách hàng vui lòng liên hệ đường
            dây chăm sóc khách hàng của chúng tôi.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Hình thức đổi trả
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Chúng tôi thực hiện đổi hàng hóa đúng loại sản phẩm mà khách hàng
            đặt đối với sản phẩm giao sai hàng/sai số lượng hoặc khi phát sinh
            sản phẩm không đạt cam kết.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Đổi sản phẩm khác có giá trị tương đương cho khách hàng trong
            trường hợp sản phẩm khách hàng đã đặt hết hàng nếu khách hàng đồng
            ý.
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            Trường hợp khách hàng không còn nhu cầu nữa do lỗi hàng hóa hoặc
            không đồng ý với hàng hóa được đổi lại, công ty sẽ hoàn phí cho
            khách hàng bằng hình thức chuyển khoản hoặc theo phương thức thỏa
            thuận với khách hàng trong vòng 07 ngày làm việc kể từ ngày nhận
            được yêu cầu. Phí chuyển khoản khách hàng sẽ chịu (nếu có).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Khi phát sinh chi phí vận chuyển của hàng đổi trả, khách hàng sẽ
            chịu chi phí này và thanh toán trực tiếp cho bên vận chuyển.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


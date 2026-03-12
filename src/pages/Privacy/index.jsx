import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Privacy() {
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
              fontSize: { xs: 24, md: 30 },
              fontWeight: 800,
              textAlign: "center",
              mb: 4,
            }}
          >
            CHÍNH SÁCH BẢO MẬT THÔNG TIN
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            Chào mừng Quý khách đến với Hệ thống Cửa Hàng Bán Lẻ Xe Đạp Chuyên
            Nghiệp Hàng Đầu Việt Nam – BASAUYCLE.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Bằng việc truy cập website, mua hàng hoặc sử dụng dịch vụ của
            BASAUYCLE, Quý khách đồng ý với các điều khoản được nêu trong Chính
            sách bảo mật này. Chúng tôi cam kết bảo vệ sự riêng tư và sử dụng dữ
            liệu của Quý khách một cách minh bạch, an toàn nhằm mang lại trải
            nghiệm tốt nhất. BASAUYCLE hiểu rằng Dữ liệu cá nhân là tài sản
            quan trọng của Quý khách.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            I. LOẠI DỮ LIỆU THU THẬP VÀ PHƯƠNG THỨC XỬ LÝ
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Để đảm bảo quy trình giao hàng chuyên nghiệp và chế độ bảo hành hậu
            mãi dài lâu, chúng tôi có thể thu thập các loại dữ liệu sau:
          </Typography>

          <Typography sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
            1. Các loại dữ liệu được thu thập
          </Typography>
          <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
            a. Dữ liệu cá nhân cơ bản:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thông tin định danh: Họ và tên, giới tính, ngày sinh.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thông tin liên lạc: Số điện thoại, địa chỉ email, địa chỉ
            thường trú/tạm trú (để giao hàng).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thông tin đơn hàng: Loại xe đạp, mẫu mã, màu sắc, số khung xe
            (Serial Number), phụ kiện đi kèm, ngày mua hàng, giá trị đơn hàng.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1.5 }}>
            - Thông tin tương tác: Lịch sử chat tư vấn, khiếu nại, phản hồi về
            chất lượng xe hoặc dịch vụ.
          </Typography>

          <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
            b. Dữ liệu kỹ thuật (khi truy cập Website):
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Địa chỉ IP, loại trình duyệt, thời gian truy cập.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Cookies: Chúng tôi sử dụng Cookies để ghi nhớ sở thích của Quý
            khách, giúp cá nhân hóa trải nghiệm duyệt web và đề xuất các mẫu xe
            phù hợp. Quý khách có thể tùy chỉnh tắt Cookies trên trình duyệt,
            nhưng điều này có thể ảnh hưởng đến một số tính năng của website.
          </Typography>

          <Typography sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
            2. Mục đích thu thập và xử lý dữ liệu
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            BASAUYCLE sử dụng thông tin của Quý khách cho các mục đích chính
            đáng sau:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thực hiện đơn hàng và Giao nhận: xử lý đơn đặt hàng, xác nhận
            thanh toán và tiến hành giao hàng toàn quốc, bao gồm dịch vụ giao
            nhanh nội thành.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Bảo hành và Hậu mãi: lưu trữ thông tin mua hàng để kích hoạt chế
            độ bảo hành, nhắc lịch bảo dưỡng định kỳ, hỗ trợ kỹ thuật khi cần.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Tư vấn chuyên nghiệp: tư vấn loại xe, kích thước, cấu hình phù
            hợp với nhu cầu và thể trạng của Quý khách.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Tiếp thị và Khuyến mãi (nếu được đồng ý): gửi thông tin về mẫu xe
            mới, chương trình giảm giá, quà tặng qua email hoặc tin nhắn.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Cải thiện dịch vụ: phân tích dữ liệu để nâng cao chất lượng sản
            phẩm và dịch vụ.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Tuân thủ pháp luật: cung cấp thông tin khi có yêu cầu hợp pháp từ
            cơ quan nhà nước có thẩm quyền.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            II. ĐỐI TƯỢNG ĐƯỢC TIẾP CẬN THÔNG TIN
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            Chúng tôi cam kết không bán, trao đổi thông tin cá nhân của Quý
            khách cho bên thứ ba vì mục đích thương mại. Thông tin chỉ được
            chia sẻ trong các trường hợp:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Đối tác vận chuyển, đối tác thanh toán, đối tác kỹ thuật trong
            phạm vi cần thiết để cung cấp dịch vụ.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Cơ quan pháp luật khi có yêu cầu theo quy định.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            III. LƯU TRỮ VÀ BẢO MẬT THÔNG TIN
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Thời gian lưu trữ: trong suốt quá trình sử dụng dịch vụ và thời
            gian hiệu lực bảo hành (tới 6 năm hoặc theo quy định kế toán/thuế).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - Cam kết bảo mật: sử dụng SSL, tường lửa, phân quyền truy cập và
            các biện pháp an ninh phù hợp. Quý khách cũng cần tự bảo vệ tài
            khoản của mình.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            IV. QUYỀN VÀ NGHĨA VỤ CỦA QUÝ KHÁCH
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Quyền truy cập, chỉnh sửa, yêu cầu xóa dữ liệu cá nhân (trừ phần
            phải lưu theo luật).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Quyền rút lại sự đồng ý nhận thông tin tiếp thị.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - Nghĩa vụ cung cấp thông tin chính xác, tôn trọng bản quyền nội
            dung và thông báo cho BASAUYCLE nếu phát hiện vi phạm bảo mật.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            V. BẢN QUYỀN VÀ THAY ĐỔI CHÍNH SÁCH
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Mọi nội dung trên website (logo, hình ảnh, bài viết, slogan…) đều
            thuộc sở hữu của BASAUYCLE hoặc đối tác và được bảo hộ bản quyền.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - BASAUYCLE có quyền điều chỉnh Chính sách bảo mật và sẽ cập nhật
            phiên bản mới nhất trên website.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            VI. LIÊN HỆ VỚI CHÚNG TÔI
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            Nếu Quý khách có bất kỳ thắc mắc, khiếu nại hoặc muốn thực hiện các
            quyền liên quan đến bảo mật thông tin, vui lòng liên hệ bộ phận Chăm
            sóc khách hàng của BASAUYCLE.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Hotline (24/7): 0386.868.986
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Email: @gmail.com
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Chúng tôi sẽ nỗ lực phản hồi yêu cầu của Quý khách trong thời gian
            sớm nhất (thông thường trong vòng 48 giờ làm việc).
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


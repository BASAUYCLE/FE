import { useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import Header from "../../components/header";
import Hero from "../../components/hero";
import FeaturedBikes from "../../components/featuredbikes";
import Footer from "../../components/footer";
import bicyclesWorkshopImage from "../../assets/paxvelo.webp";
import urbanCyclingImage from "../../assets/aodo1.jpg";

export default function Home() {
  const [articleExpanded, setArticleExpanded] = useState(true);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Hero />
      <FeaturedBikes />
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
          }}
        >
        <Typography sx={{ color: "#334155", lineHeight: 1.8, fontSize: { xs: 14, md: 18 } }}>
          <Box component="span" sx={{ color: "#0284c7", fontWeight: 700 }}>
            Xe đạp thể thao
          </Box>{" "}
          là một trong những phương tiện được ưa nhất hiện nay, không chỉ giúp nâng cao sức khỏe mà còn giúp cải thiện thể lực, tinh thần thoải mái và giảm thiểu tác động của ô nhiễm môi trường so với xe máy hay ô tô. Với sự đa dạng về mẫu mã, kiểu dáng và thương hiệu, xe đạp ngày càng được ưa chuộng trên thị trường, từ những chiếc xe đạp thể thao cũ cho đến các dòng cao cấp, phù hợp với mọi đối tượng sử dụng, từ trẻ em đến người lớn, nữ và nam.
        </Typography>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            component="img"
            src={bicyclesWorkshopImage}
            alt="Cycling community"
            sx={{
              width: "min(100%, 760px)",
              height: { xs: 220, md: 340 },
              objectFit: "cover",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </Box>

        {!articleExpanded && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, md: 4 }, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setArticleExpanded(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
                "&:hover": { background: "linear-gradient(135deg, #0f766e 0%, #0369a1 100%)" },
              }}
            >
              Xem thêm bài viết
            </Button>
          </Box>
        )}

        <Collapse in={articleExpanded} timeout="auto" unmountOnExit={false}>
          <Typography
            sx={{
              color: "#334155",
              lineHeight: 1.9,
              fontSize: { xs: 14, md: 17 },
              mb: 2,
              mt: { xs: 3, md: 4 },
            }}
          >
            Trong bài viết này, BASAUYCLE sẽ cùng tìm hiểu về xe đạp thể thao là gì, các loại xe đạp
            thể thao phổ biến, phân tích các thương hiệu uy tín, và cung cấp những hướng dẫn chọn mua
            phù hợp để giúp bạn có được chiếc xe tốt nhất phù hợp với nhu cầu của mình.
          </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: { xs: 18, md: 24 } }}
        >
          Xe đạp thể thao là gì?
        </Typography>

        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Xe đạp thể thao là loại phương tiện di chuyển ra đời năm 1817 của một nhà phát minh người
          Đức. Xe có thể di chuyển bằng việc đạp pedal, thiết kế đặc nhằm mục đích hỗ trợ hoạt động
          thể thao, tập luyện hoặc thể hiện phong cách sống năng động. Trong bối cảnh hiện nay, xe
          đạp thể thao góp phần giảm thiểu ô nhiễm không khí, thúc đẩy lối sống xanh, bền vững.
        </Typography>

        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 } }}>
          Năm 2025, xu hướng đạp xe tăng trưởng mạnh mẽ trên tại Việt Nam. Sự quan tâm đến sức
          khỏe, lối sống xanh và nhu cầu di chuyển gọn nhẹ khiến xe đạp trở thành lựa chọn phổ biến
          hơn bao giờ hết. Tại các đô thị lớn, nhiều người chuyển từ phương tiện cá nhân chạy xăng
          sang xe đạp truyền thống hoặc xe đạp điện nhằm giảm chi phí và hạn chế ô nhiễm.
        </Typography>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            component="img"
            src={urbanCyclingImage}
            alt="Người đạp xe trên đường phố đô thị"
            sx={{
              width: "min(100%, 760px)",
              height: { xs: 220, md: 360 },
              objectFit: "cover",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mt: 4,
            mb: 1.5,
            fontSize: { xs: 18, md: 24 },
          }}
        >
          Tại sao chúng ta nên đạp xe hàng ngày
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Chọn đạp xe hàng ngày mang lại nhiều lợi ích vượt xa mong đợi về sức khỏe lẫn tâm thần.
          Việc duy trì thói quen đạp xe giúp tăng cường sức khỏe tim mạch, giảm nguy cơ mắc các bệnh
          về tiểu đường, huyết áp cao, đồng thời cải thiện độ linh hoạt, sức bền của xương khớp. Ngoài
          ra, xe đạp thể thao còn giúp giảm thiểu ô nhiễm môi trường, tiết kiệm chi phí di chuyển và
          phù hợp với lối sống năng động, hiện đại.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Việc đạp xe đều đặn còn giúp giảm căng thẳng, cải thiện tâm trạng, có thể giúp bạn tỉnh
          táo hơn trong công việc và cuộc sống. Dù là xe đạp thể thao nữ, xe đạp thể thao cho nam hay
          xe đạp gấp gọn, đều mang lại lợi ích về sức khỏe lẫn tinh thần, góp phần giúp bạn sống tích
          cực và lành mạnh hơn mỗi ngày.
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: { xs: 18, md: 24 } }}
        >
          Hướng dẫn chọn mua xe đạp thể thao phù hợp với bạn
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Chọn đúng xe đạp thể thao phù hợp sẽ giúp bạn tận hưởng trọn vẹn đam mê đạp xe, đồng thời
          sẽ phục vụ tối đa nhu cầu của bạn. Hãy chú ý đến những yếu tố quan trọng sau để có quyết
          định đúng đắn.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Chất liệu của khung xe
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Chất liệu khung xe là yếu tố quyết định độ nhẹ, độ bền, khả năng chịu lực của xe. Thường
          gặp các loại khung xe bằng hợp kim nhôm, carbon hoặc thép. Carbon mang lại độ nhẹ tối đa,
          phù hợp cho xe đạp cao cấp và thi đấu chuyên nghiệp, trong khi nhôm là lựa chọn phổ biến,
          độ bền tốt và giá cả hợp lý. Thép phù hợp với những dòng xe đạp thể thao cũ hoặc mục đích
          sử dụng chậm, giữ được độ chắc chắn.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Kích thước xe phù hợp
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Không phải mẫu xe đạp thể thao nữ hay xe đạp thể thao cho nam nào cũng phù hợp với tất cả
          mọi người. Hiểu rõ kích thước phù hợp với chiều cao, chiều dài chân và dáng người của bạn
          là yếu tố then chốt để cảm thấy dễ chịu, thoải mái khi đạp, hạn chế các chấn thương không
          mong muốn.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Khi mua xe, bạn nên kiểm tra chiều cao yên xe, chiều cao của khung xe phù hợp với vóc dáng
          của mình. Một chiếc xe đạp thể thao phù hợp kích thước sẽ giúp bạn duy trì tư thế đúng,
          giảm mỏi mệt, nâng cao hiệu quả vận động và an toàn tối đa.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Phù hợp với đối tượng sử dụng
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Bạn cần xác định rõ mục đích sử dụng như tập luyện, đua xe, đi lại hàng ngày hay du lịch để
          chọn dòng xe đạp thể thao phù hợp. Ví dụ, xe đạp thể thao nữ, xe đạp trẻ em sẽ phù hợp với
          các độ tuổi, vóc dáng khác nhau. Đối tượng sử dụng còn ảnh hưởng đến khả năng mang theo,
          gấp gọn, trọng lượng của xe.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Ngoài ra, nếu bạn chỉ mới bắt đầu, nên chọn các mẫu xe đạp thể thao giá rẻ hoặc xe đạp thể
          thao gấp gọn để dễ thao tác và làm quen. Trong khi đó, những người đam mê thể thao hoặc
          thi đấu chuyên nghiệp sẽ ưu tiên các dòng xe đạp cao cấp từ các thương hiệu uy tín như
          Fujisan, Merida để có trải nghiệm tối ưu nhất.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Bộ truyền động tốt
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Hệ thống truyền động gồm các đĩa xích, bộ chuyển tốc, bánh đà đóng vai trò trung tâm trong
          quá trình vận hành của xe đạp thể thao. Một bộ truyền động tốt đảm bảo việc chuyển đổi các
          tốc độ mượt mà, giúp người lái kiểm soát xe tốt hơn, phù hợp với các địa hình khác nhau.
          Điều này đặc biệt quan trọng đối với xe đạp địa hình, xe đạp đua hoặc các dòng xe đạp thể
          thao cao cấp.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Bạn nên xem xét các hệ thống truyền động của các thương hiệu uy tín như Fujisan, Modeltime
          hay Merida để chắc chắn sự ổn định, bền bỉ và dễ sửa chữa. Ngoài ra, việc bảo dưỡng bộ
          truyền động định kỳ cũng giúp xe vận hành trơn tru, kéo dài tuổi thọ sử dụng.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Phanh xe phù hợp
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Phanh là bộ phận an toàn quan trọng nhất của bất kỳ xe đạp thể thao nào. Hiện nay, các loại
          phanh chủ yếu gồm phanh cơ, phanh đĩa và phanh trống. Phanh đĩa thường được ưa chuộng cho
          xe đạp địa hình hoặc xe đua vì khả năng phanh hiệu quả, không bị ảnh hưởng bởi điều kiện
          thời tiết, nhất là khi trời mưa hoặc trơn trượt.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Chọn phanh xe phù hợp giúp bạn kiểm soát tốc độ tốt nhất, đảm bảo an toàn trong mọi tình
          huống. Các thương hiệu lớn như Fujisan, Merida đều trang bị hệ thống phanh chất lượng, hạn
          chế tối đa rủi ro trong quá trình vận hành.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Thương hiệu uy tín
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Chọn mua xe đạp thể thao của các thương hiệu uy tín như Fujisan, Merida, Galaxy, Asama,
          hoặc các thương hiệu Nhật, châu Âu giúp bạn yên tâm về chất lượng, dịch vụ hậu mãi và linh
          kiện thay thế trong quá trình sử dụng. Những thương hiệu này đều có sản phẩm phù hợp từ xe
          đạp thể thao trong nhà, xe đạp trẻ em, đến các dòng xe đạp cao cấp, xe đạp gấp gọn.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Bạn có thể dễ dàng tìm thấy các dòng xe đạp thể thao tại các showroom, cửa hàng phân phối
          chính hãng hoặc các website uy tín để mua đúng hàng chính hãng, tránh hàng giả, hàng nhái
          gây ảnh hưởng tới trải nghiệm sử dụng.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Giá thành phù hợp
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Ngân sách là yếu tố quyết định lớn tới việc chọn mua xe đạp thể thao phù hợp. Hiện nay, có
          xe đạp thể thao giá rẻ chỉ từ vài triệu đồng, phù hợp cho người mới bắt đầu hoặc đạp để tập
          thể dục, trong khi các dòng xe đạp cao cấp có thể lên tới hàng chục, thậm chí trăm triệu
          đồng.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Bạn cần cân nhắc rõ nhu cầu sử dụng, tần suất và khả năng tài chính để chọn mua mẫu xe đạp
          thể thao phù hợp, vừa có thể duy trì lâu dài, vừa đảm bảo hiệu quả sử dụng tối ưu nhất. Các
          thương hiệu uy tín luôn cung cấp đa dạng các dòng xe phù hợp với mọi ngân sách, giúp bạn dễ
          dàng lựa chọn hơn.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mt: 4,
            mb: 1.5,
            fontSize: { xs: 18, md: 24 },
          }}
        >
          Cửa hàng xe đạp uy tín
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Muốn sở hữu xe đạp chất lượng, uy tín bạn nên tìm đến các cửa hàng, trung tâm phân phối uy
          tín, có thương hiệu rõ ràng.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 } }}>
          BASAUYCLE chúng tôi tự tin là đơn vị cung cấp xe đạp thể thao uy tín toàn quốc.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setArticleExpanded(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              borderColor: "#0d9488",
              color: "#0d9488",
              "&:hover": { borderColor: "#0f766e", backgroundColor: "rgba(13, 148, 136, 0.06)" },
            }}
          >
            Thu gọn
          </Button>
        </Box>
        </Collapse>
        </Box>
      </Box>
      <Footer
        showSubscribe={false}
        companyLinks={[
          { label: "About Us", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
        ]}
      />
    </Box>
  );
}

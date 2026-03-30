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
            Return and Refund Policy
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Return conditions
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            Customers should inspect product condition and may request exchange
            or return at delivery/receipt time in the following cases:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Product type/model does not match the order or website listing at
            the time of purchase.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Insufficient quantity or incomplete set compared to the order.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Visible external damage such as torn packaging, peeling, cracks,
            or breakage.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Customers are responsible for providing relevant documents/evidence
            to complete the return/exchange process.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Time limits for return notification and shipment
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Return notification period: within the specified timeframe
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Product return shipment time: within the specified timeframe
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>

          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Return/exchange methods
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - We exchange products with the correct ordered item in cases of
            wrong item/quantity delivery or products not meeting commitments.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - We can exchange to another product of equivalent value if the
            originally ordered product is out of stock and the customer agrees.
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
          If the customer no longer needs the product due to a product defect or does not accept the replacement product, we will issue a refund via VN Pay bank transfer.
          </Typography>

        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


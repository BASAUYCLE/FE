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
            Payment Guide
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. In-store payment
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Customers can pay directly at BASAUYCLE stores by{" "}
            <strong>cash</strong> or <strong>bank transfer</strong>. Our staff
            will confirm the amount, issue the invoice, and complete handover.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Cash on Delivery (COD)
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            In supported delivery areas, you can pay{" "}
            <strong>directly to the delivery staff</strong> after verifying the
            bike and included accessories. Please inspect the bike condition
            carefully before confirming receipt.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Secure online payment
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            BASAUYCLE encourages customers to use online payment methods via
            bank transfer or electronic gateways for faster and safer
            transactions. Detailed instructions for each method are displayed
            clearly at checkout.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


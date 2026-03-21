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
            Payment Policy
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            We offer three payment methods. Customers may choose whichever is
            most convenient:
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Method 1: Direct cash payment
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            If you purchase at our store, you can pay directly in cash to our
            sales staff.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Method 2: Cash on Delivery (COD)
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            With this method, customers check the item upon delivery and then
            pay in cash after confirming the correct product and quantity.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}
          >
            Method 3: Advance bank transfer
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            Customers transfer payment in advance, then we arrange delivery
            according to the agreed schedule or contract terms.
          </Typography>
          <Typography sx={{ color: "#111827", fontSize: 14, mt: 1 }}>
            Account No.: 8666226868888 – Account Holder: BASAUYCLE Company
          </Typography>
          <Typography sx={{ color: "#111827", fontSize: 14, mb: 3 }}>
            Bank – Branch
          </Typography>

          <Typography
            component="h3"
            sx={{ fontSize: 16, fontWeight: 700, mb: 1 }}
          >
            Notes
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Transfer note must include your <strong>phone number</strong> or{" "}
            <strong>order number</strong>.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - After transfer, we will contact you for confirmation and proceed
            with delivery.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - If we fail to deliver or respond within the agreed timeline,
            customers may submit a complaint directly to our headquarters.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mt: 1.5 }}>
            We are committed to transparent and lawful business operations, and
            to providing quality products with clear origin.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


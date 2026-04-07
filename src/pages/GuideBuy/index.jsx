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
            Buying Guide at BASAUYCLE
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            This page combines shopping instructions, shipping methods, payment
            guide, and payment policy in one place.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Buy online via website
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Step 1: Visit BASAUYCLE homepage and go to Marketplace to select the
            bike model you are interested in.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Step 2: Click "Place Order" or "Buy Now" on the bike detail page.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            Step 3: Fill in your contact details and delivery address.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            Step 4: Confirm the order and choose a suitable payment method
            (for example: online wallet/bank payment, or cash on delivery if
            available).
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Shipping methods
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1.25 }}>
            <strong>Inner-city customers:</strong> Bikes are delivered directly
            by store staff to your provided address. Delivery time is arranged
            in advance.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1.25 }}>
            <strong>Suburban and nearby provinces:</strong> BASAUYCLE may use
            bus cargo or suitable logistics partners for safe and timely
            shipping.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            <strong>Nationwide customers:</strong> We cooperate with nationwide
            shipping providers. Bikes are carefully packed and can include basic
            assembly guidance if needed.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Payment guide
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1.25 }}>
            <strong>Cash on Delivery (COD):</strong> In supported delivery
            areas, you can pay after checking the bike and included accessories.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            <strong>Secure online payment:</strong> BASAUYCLE supports VNPay for
            account top-up and online payment flows. Follow the instructions on
            the checkout/payment page.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            4. Payment policy
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            You can choose between COD and VNPay depending on the order type
            and supported delivery/payment conditions.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Transfer note should include your <strong>phone number</strong> or{" "}
            <strong>order number</strong>.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - After transfer, our team will verify and continue order handling.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - If delivery/support is delayed beyond the agreed timeline, you may
            submit a complaint via BASAUYCLE support channels.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mt: 1.5 }}>
            BASAUYCLE is committed to transparent, lawful operations and clear
            communication throughout the transaction process.
          </Typography>

        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


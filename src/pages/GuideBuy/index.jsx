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

        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


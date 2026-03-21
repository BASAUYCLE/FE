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
            Shipping Methods
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            1. Inner-city customers
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            For customers in supported inner-city areas, bikes are delivered{" "}
            <strong>directly by store staff</strong> to your provided address.
            Delivery time will be scheduled in advance for your convenience.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            2. Suburban and nearby provinces
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            For suburban customers and nearby provinces, BASAUYCLE may use{" "}
            <strong>bus cargo or suitable logistics partners</strong> to ensure
            fast and safe delivery. Shipment details and delivery schedule will
            be clearly communicated.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 20, fontWeight: 700, mb: 1.5 }}
          >
            3. Nationwide customers
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            For long-distance customers, BASAUYCLE partners with{" "}
            <strong>nationwide shipping providers</strong> to deliver bikes at
            reasonable cost. Bikes are carefully packaged and include basic
            assembly instructions (if needed) for immediate use after delivery.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Complaint() {
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
            Complaint Handling Policy
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - We accept all customer complaints related to the use of our
            services.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - For all warranty-related cases, customers can contact us to
            complete warranty procedures.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            - Complaint resolution time is up to 03 (three) working days from
            the time we receive the complaint. In force majeure cases, both
            parties will negotiate a suitable solution.
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


import { useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function About() {
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
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 30, md: 40 },
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              About BASAUYCLE
            </Typography>
            <Typography
              sx={{
                mt: 2,
                color: "#6b7280",
                maxWidth: 720,
                mx: "auto",
                fontSize: { xs: 14, md: 15 },
              }}
            >
              BASAUYCLE is a platform specializing in providing and distributing high-quality bicycles, delivering a modern, convenient, and reliable shopping experience for users.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#111827",
                  }}
                >
                  Our Mission
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
                  Deliver a transparent, secure, and convenient bicycle
                  marketplace experience for cycling enthusiasts in Vietnam.
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
                  BASAUYCLE connects buyers and sellers through inspection,
                  deposit, and secure payment workflows, so every bike can
                  begin its next meaningful journey.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  backgroundColor: "#ffffff",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#111827",
                  }}
                >
                  Core Values
                </Typography>
                <Typography
                  component="ul"
                  sx={{ pl: 2.5, m: 0, color: "#4b5563", fontSize: 14 }}
                >
                  <li>Transparent bike information and inspection history.</li>
                  <li>Secure payment via wallet and escrow agreement.</li>
                  <li>Dedicated support before and after purchase.</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


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
              BASAUYCLE is a bicycle marketplace in Vietnam built for trust. We
              help buyers and sellers trade with transparent listings,
              independent inspection, and secure payments via wallet and escrow.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 4 }}>
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
                  marketplace experience for cyclists in Vietnam.
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
                  BASAUYCLE connects buyers and sellers through listing
                  moderation, inspection, deposit, and secure payment workflows,
                  so every bike can begin its next meaningful journey.
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
                  <li>Clear dispute handling to protect both sides.</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
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
              How it works
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    1) Listing review
                  </Box>{" "}
                  - New posts go through a review process before appearing to
                  buyers.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    2) Independent inspection
                  </Box>{" "}
                  - Inspectors verify the bike’s condition to increase
                  confidence.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    3) Secure payment
                  </Box>{" "}
                  - Deposits and payments are handled via wallet and escrow.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    4) Support & disputes
                  </Box>{" "}
                  - If issues arise, the platform provides a structured dispute
                  process.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}

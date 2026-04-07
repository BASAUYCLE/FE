import { useEffect } from "react";
import { Box, Container, Typography, Grid } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const cardSx = {
    p: { xs: 3, md: 4 },
    borderRadius: 3,
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
  };

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
              BASAUYCLE is a bicycle marketplace in Vietnam built on trust. We
              help buyers and sellers trade with transparent listings,
              independent inspections, and secure payments through wallet and
              escrow services.
            </Typography>
          </Box>

          {/* MUI v7: use `size` instead of `item` + xs/md */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={cardSx}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    mb: 1.5,
                    color: "#111827",
                  }}
                >
                  Mission
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
                  Deliver a transparent, safe, and convenient bicycle
                  marketplace experience for the cycling community in Vietnam.
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
                  BASAUYCLE connects buyers and sellers through listing review,
                  inspection, deposits, and secure payment workflows, so every
                  bike can begin its next meaningful journey.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={cardSx}>
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
                  <li>Secure payments via wallet and escrow mechanisms.</li>
                  <li>Clear dispute resolution that protects both parties.</li>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ ...cardSx, height: "auto" }}>
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                mb: 1.5,
                color: "#111827",
              }}
            >
              How It Works
            </Typography>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    1) Listing moderation
                  </Box>{" "}
                  — New listings are reviewed before being shown to buyers.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    2) Independent inspection
                  </Box>{" "}
                  — Inspectors verify the bike condition to increase trust.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography sx={{ color: "#111827", fontSize: 14, mb: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    3) Secure payment
                  </Box>{" "}
                  — Deposits and payments are handled through wallet and escrow.
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14 }}>
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    4) Support &amp; disputes
                  </Box>{" "}
                  — When issues arise, the platform provides a clear dispute
                  resolution process.
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

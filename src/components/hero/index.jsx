import { Box, Container, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import heroVideo from "../../assets/bikehero.mp4";

const HeroOuter = styled(Box)(({ theme }) => ({
  /* Full-bleed banner giống meridavietnam.com */
  width: "100%",
  padding: 0,

  [theme.breakpoints.up("lg")]: {
    padding: 0,
  },

  [theme.breakpoints.down("sm")]: {
    padding: 0,
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: "relative",
  minHeight: 620,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  overflow: "hidden",
  borderRadius: 0,
  backgroundColor: "#0f172a",

  [theme.breakpoints.down("md")]: {
    minHeight: 560
  },

  [theme.breakpoints.down("sm")]: {
    minHeight: 520
  }
}));

/* VIDEO BACKGROUND */
const HeroVideo = styled("video")({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 0,
  filter: "brightness(0.88)"
});

/* DARK OVERLAY */
const HeroOverlay = styled(Box)({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  background:
    "linear-gradient(to right, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.28) 45%, rgba(15,23,42,0.12) 75%, transparent 100%)"
});

const HeroContent = styled(Container)(({ theme }) => ({
  position: "relative",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: theme.spacing(10, 3, 6),
  maxWidth: 1320,

  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(7, 3, 5)
  },

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(5, 2, 4)
  }
}));

export default function Hero() {
  return (
    <HeroOuter component="section">
      <HeroSection>

        <HeroVideo autoPlay muted loop playsInline>
          <source src={heroVideo} type="video/mp4" />
        </HeroVideo>

        <HeroOverlay />
        <HeroContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 3, md: 5 }
            }}
          >
            <Box
              sx={{
                width: 2,
                height: { xs: 80, sm: 110, md: 140 },
                bgcolor: "rgba(255,255,255,0.9)"
              }}
            />
            <Box>
              <Typography
                component="h1"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontSize: { xs: 32, sm: 40, md: 54, lg: 60 },
                  lineHeight: 1.1,
                  textShadow: "0 6px 16px rgba(0,0,0,0.45)"
                }}
              >
                BASAUYCLE
              </Typography>
              <Typography
                component="p"
                sx={{
                  mt: { xs: 1, sm: 1.5 },
                  color: "rgba(255,255,255,0.92)",
                  fontSize: { xs: 13, sm: 14, md: 16, lg: 18 },
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  textShadow: "0 4px 10px rgba(0,0,0,0.45)"
                }}
              >
                CÙNG BẠN LÊN ĐƯỜNG – KHÁM PHÁ HÀNH TRÌNH &amp; TỐC ĐỘ
              </Typography>
            </Box>
          </Box>
        </HeroContent>

      </HeroSection>
    </HeroOuter>
  );
}
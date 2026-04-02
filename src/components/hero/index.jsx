import { Box, Container, Typography } from "@mui/material";
import heroVideo from "../../assets/bikehero.mp4";
import "./index.css";

export default function Hero() {
  return (
    <Box component="section" className="hero-outer">
      <Box className="hero-section">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src={heroVideo} type="video/mp4" />
        </video>

        <Box className="hero-overlay" />
        <Container className="hero-content">
          <Box className="hero-title-row">
            <Box className="hero-title-line" />
            <Box>
              <Typography component="h1" className="hero-heading">
                BASAUYCLE
              </Typography>
              <Typography component="p" className="hero-subheading">
                RIDE WITH YOU - EXPLORE THE JOURNEY &amp; SPEED
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
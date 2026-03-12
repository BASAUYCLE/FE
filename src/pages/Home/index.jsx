import { Box } from "@mui/material";
import Header from "../../components/header";
import Hero from "../../components/hero";
import FeaturedBikes from "../../components/featuredbikes";
import Footer from "../../components/footer";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Hero />
      <FeaturedBikes />
      <Footer
        showSubscribe={false}
        companyLinks={[
          { label: "About Us", href: "#" },
          { label: "Careers", href: "#" },
          { label: "Help Center", href: "#" },
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
        ]}
      />
    </Box>
  );
}

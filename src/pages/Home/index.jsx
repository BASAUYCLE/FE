import { Box } from "@mui/material";
import Header from "../../components/header";
import Hero from "../../components/hero";
import CategoryFilter from "../../components/admin/category";
import FeaturedBikes from "../../components/featuredbikes";
import Features from "../../components/features";
import CTA from "../../components/CTA";
import Footer from "../../components/footer";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header showSearch={false} />
      <Hero />
      <CategoryFilter />
      <FeaturedBikes />
      <Features />
      <CTA />
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

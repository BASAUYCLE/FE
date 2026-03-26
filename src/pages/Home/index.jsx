import { useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import Header from "../../components/header";
import Hero from "../../components/hero";
import FeaturedBikes from "../../components/featuredbikes";
import Footer from "../../components/footer";
import bicyclesWorkshopImage from "../../assets/paxvelo.webp";
import urbanCyclingImage from "../../assets/aodo1.jpg";

export default function Home() {
  const [articleExpanded, setArticleExpanded] = useState(true);

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />
      <Hero />
      <FeaturedBikes />
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
          }}
        >
        <Typography sx={{ color: "#334155", lineHeight: 1.8, fontSize: { xs: 14, md: 18 } }}>
          <Box component="span" sx={{ color: "#0284c7", fontWeight: 700 }}>
            Sports bikes
          </Box>{" "}
          are one of the most popular transportation choices today. They improve
          health, increase physical fitness, support mental well-being, and
          reduce environmental impact compared with motorcycles or cars. With a
          wide variety of designs, styles, and brands, bikes now fit every
          rider segment, from children to adults.
        </Typography>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            component="img"
            src={bicyclesWorkshopImage}
            alt="Cycling community"
            sx={{
              width: "min(100%, 760px)",
              height: { xs: 220, md: 340 },
              objectFit: "cover",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </Box>

        {!articleExpanded && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: { xs: 3, md: 4 }, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setArticleExpanded(true)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
                "&:hover": { background: "linear-gradient(135deg, #0f766e 0%, #0369a1 100%)" },
              }}
            >
              View more article
            </Button>
          </Box>
        )}

        <Collapse in={articleExpanded} timeout="auto" unmountOnExit={false}>
          <Typography
            sx={{
              color: "#334155",
              lineHeight: 1.9,
              fontSize: { xs: 14, md: 17 },
              mb: 2,
              mt: { xs: 3, md: 4 },
            }}
          >
            In this article, BASAUYCLE explains what sports bikes are, introduces
            popular bike categories, highlights trusted brands, and shares
            practical buying tips to help you choose the right bike for your
            needs.
          </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: { xs: 18, md: 24 } }}
        >
          What is a sports bike?
        </Typography>

        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          The modern bicycle concept dates back to 1817. Sports bikes are
          pedal-powered vehicles designed for training, commuting, and active
          lifestyles. Today, they also help reduce air pollution and support a
          greener, more sustainable way of living.
        </Typography>

        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 } }}>
          In 2025, cycling continues to grow strongly in Vietnam. Rising interest in
          health, sustainable living, and lightweight commuting has made bicycles
          more popular than ever. In major cities, many people are switching from
          gasoline-powered personal vehicles to traditional bikes or e-bikes to
          reduce costs and lower pollution.
        </Typography>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Box
            component="img"
            src={urbanCyclingImage}
            alt="Cyclist riding on an urban street"
            sx={{
              width: "min(100%, 760px)",
              height: { xs: 220, md: 360 },
              objectFit: "cover",
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mt: 4,
            mb: 1.5,
            fontSize: { xs: 18, md: 24 },
          }}
        >
          Why cycle every day?
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Daily cycling offers both physical and mental benefits. It supports
          cardiovascular health, helps reduce the risk of diabetes and high
          blood pressure, and improves flexibility and endurance. It is also a
          cost-effective and eco-friendly mobility choice for modern living.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Riding regularly can reduce stress, improve mood, and keep you more
          focused throughout the day. Whether you ride a road bike, mountain
          bike, or folding bike, cycling helps you build a healthier and more
          positive lifestyle.
        </Typography>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5, fontSize: { xs: 18, md: 24 } }}
        >
          How to choose the right sports bike
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Choosing the right bike lets you enjoy riding fully while matching
          your real-world needs. Consider the key factors below before making a
          decision.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Frame material
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Frame material determines weight, durability, and ride feel. Common
          options include aluminum, carbon, and steel. Carbon is light and ideal
          for premium or performance bikes. Aluminum is durable and affordable.
          Steel is sturdy and often preferred for comfort and long-term use.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Bike size and fit
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          No single bike size fits everyone. Choosing a frame size that matches
          your height, leg length, and body proportions is essential for comfort
          and injury prevention.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Check saddle height and frame geometry before buying. A properly fitted
          bike helps maintain correct posture, reduces fatigue, improves
          performance, and increases safety.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Rider profile and purpose
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Define your main use case: training, racing, daily commuting, or
          touring. Rider profile also affects ideal weight, portability, and
          whether features like folding capability are important.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Beginners can start with budget-friendly or easy-to-handle models.
          Enthusiasts and competitive riders may prefer higher-end bikes from
          trusted brands for the best overall experience.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Drivetrain quality
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          The drivetrain includes chainrings, cassette, and derailleurs. A good
          drivetrain enables smoother shifting, better control, and improved
          riding efficiency across different terrains.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Look for reliable drivetrain components that are durable and easy to
          maintain. Regular cleaning and maintenance also extend component life
          and keep your bike running smoothly.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Brake system
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Brakes are one of the most important safety components. Common options
          include rim brakes and disc brakes (mechanical or hydraulic). Disc
          brakes are often preferred for stronger, more consistent stopping
          power, especially in wet conditions.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Selecting the right brake type helps you control speed more confidently
          and ride safer in different scenarios.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Trusted brands
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Buying from trusted brands gives you better quality assurance,
          after-sales support, and easier access to replacement parts. Well-known
          brands usually offer options for all budgets and riding needs.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Purchase from official stores, authorized dealers, or reputable online
          shops to avoid counterfeit products and protect your ownership
          experience.
        </Typography>

        <Typography
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: { xs: 16, md: 18 },
            mb: 1,
          }}
        >
          Budget and value
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          Budget is a major factor when choosing a bike. Entry-level options are
          great for beginners and fitness riding, while premium models target
          advanced riders with higher performance expectations.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 3 }}>
          Balance your usage frequency, expected features, and spending plan.
          A good bike should stay comfortable and reliable for long-term use
          while still fitting your budget.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0f172a",
            mt: 4,
            mb: 1.5,
            fontSize: { xs: 18, md: 24 },
          }}
        >
          Choose a reliable bike store
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 }, mb: 2 }}>
          To own a quality bike, buy from stores or distributors with a clear
          reputation and strong service policies.
        </Typography>
        <Typography sx={{ color: "#334155", lineHeight: 1.9, fontSize: { xs: 14, md: 17 } }}>
          BASAUYCLE is committed to being a trusted sports bike provider
          nationwide.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setArticleExpanded(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              borderColor: "#0d9488",
              color: "#0d9488",
              "&:hover": { borderColor: "#0f766e", backgroundColor: "rgba(13, 148, 136, 0.06)" },
            }}
          >
            Collapse
          </Button>
        </Box>
        </Collapse>
        </Box>
      </Box>
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

import { useState } from "react";
import { Box, Button, Collapse, Typography } from "@mui/material";
import Header from "../../components/header";
import Hero from "../../components/hero";
import FeaturedBikes from "../../components/featuredbikes";
import Footer from "../../components/footer";
import bicyclesWorkshopImage from "../../assets/paxvelo.webp";
import urbanCyclingImage from "../../assets/aodo1.jpg";
import "./index.css";

export default function Home() {
  /** false = chỉ đoạn mở đầu + ảnh + nút View more (như ảnh tham khảo) */
  const [articleExpanded, setArticleExpanded] = useState(false);

  return (
    <Box component="main" className="home-page">
      <Header />
      <Hero />
      <FeaturedBikes />
      <Box className="home-article-shell">
        <Box className="home-article-card">
          {/* Luôn hiển thị: đoạn đầu + ảnh */}
          <Typography className="home-intro-text">
            <Box component="span" className="home-accent-text">
              Sports bikes
            </Box>{" "}
            are one of the most popular transportation choices today. They
            improve health, increase physical fitness, support mental well-being,
            and reduce environmental impact compared with motorcycles or cars.
            With a wide variety of designs, styles, and brands, bikes now fit
            every rider segment, from children to adults.
          </Typography>

          <Box className="home-image-wrap">
            <Box
              component="img"
              src={bicyclesWorkshopImage}
              alt="Cycling community"
              className="home-image home-image-top"
            />
          </Box>

          {!articleExpanded && (
            <Box className="home-btn-center home-btn-center-top">
              <Button
                variant="contained"
                onClick={() => setArticleExpanded(true)}
                className="home-view-more-btn"
              >
                View more article
              </Button>
            </Box>
          )}

          <Collapse in={articleExpanded} timeout="auto" unmountOnExit>
            <Box className="home-collapse-content">
              {/* Thu gọn ngay đầu phần mở — không cần kéo xuống cuối */}
              <Box className="home-btn-center home-btn-center-collapse-top">
                <Button
                  variant="outlined"
                  onClick={() => setArticleExpanded(false)}
                  className="home-show-less-btn"
                >
                  Show less
                </Button>
              </Box>

              <Typography className="home-body-text home-mb-16">
                In this article, BASAUYCLE explains what sports bikes are,
                introduces popular bike categories, highlights trusted brands,
                and shares practical buying tips to help you choose the right
                bike for your needs.
              </Typography>

              <Typography variant="h6" className="home-section-title">
                What is a sports bike?
              </Typography>

              <Typography className="home-body-text home-mb-16">
                The modern bicycle concept dates back to 1817. Sports bikes are
                pedal-powered vehicles designed for training, commuting, and
                active lifestyles. Today, they also help reduce air pollution
                and support a greener, more sustainable way of living.
              </Typography>

              <Typography className="home-body-text">
                In 2025, cycling continues to grow strongly in Vietnam. Rising
                interest in health, sustainable living, and lightweight
                commuting has made bicycles more popular than ever. In major
                cities, many people are switching from gasoline-powered personal
                vehicles to traditional bikes or e-bikes to reduce costs and
                lower pollution.
              </Typography>

              <Box className="home-image-wrap">
                <Box
                  component="img"
                  src={urbanCyclingImage}
                  alt="Cyclist riding on an urban street"
                  className="home-image home-image-mid"
                />
              </Box>

              <Typography variant="h6" className="home-section-title home-mt-32">
                Why cycle every day?
              </Typography>
              <Typography className="home-body-text home-mb-16">
                Daily cycling offers both physical and mental benefits. It
                supports cardiovascular health, helps reduce the risk of
                diabetes and high blood pressure, and improves flexibility and
                endurance. It is also a cost-effective and eco-friendly mobility
                choice for modern living.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Riding regularly can reduce stress, improve mood, and keep you
                more focused throughout the day. Whether you ride a road bike,
                mountain bike, or folding bike, cycling helps you build a
                healthier and more positive lifestyle.
              </Typography>

              <Typography variant="h6" className="home-section-title">
                How to choose the right sports bike
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Choosing the right bike lets you enjoy riding fully while
                matching your real-world needs. Consider the key factors below
                before making a decision.
              </Typography>

              <Typography className="home-subsection-title">
                Frame material
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Frame material determines weight, durability, and ride feel.
                Common options include aluminum, carbon, and steel. Carbon is
                light and ideal for premium or performance bikes. Aluminum is
                durable and affordable. Steel is sturdy and often preferred for
                comfort and long-term use.
              </Typography>

              <Typography className="home-subsection-title">
                Bike size and fit
              </Typography>
              <Typography className="home-body-text home-mb-16">
                No single bike size fits everyone. Choosing a frame size that
                matches your height, leg length, and body proportions is
                essential for comfort and injury prevention.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Check saddle height and frame geometry before buying. A properly
                fitted bike helps maintain correct posture, reduces fatigue,
                improves performance, and increases safety.
              </Typography>

              <Typography className="home-subsection-title">
                Rider profile and purpose
              </Typography>
              <Typography className="home-body-text home-mb-16">
                Define your main use case: training, racing, daily commuting, or
                touring. Rider profile also affects ideal weight, portability,
                and whether features like folding capability are important.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Beginners can start with budget-friendly or easy-to-handle
                models. Enthusiasts and competitive riders may prefer
                higher-end bikes from trusted brands for the best overall
                experience.
              </Typography>

              <Typography className="home-subsection-title">
                Drivetrain quality
              </Typography>
              <Typography className="home-body-text home-mb-16">
                The drivetrain includes chainrings, cassette, and derailleurs. A
                good drivetrain enables smoother shifting, better control, and
                improved riding efficiency across different terrains.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Look for reliable drivetrain components that are durable and
                easy to maintain. Regular cleaning and maintenance also extend
                component life and keep your bike running smoothly.
              </Typography>

              <Typography className="home-subsection-title">
                Brake system
              </Typography>
              <Typography className="home-body-text home-mb-16">
                Brakes are one of the most important safety components. Common
                options include rim brakes and disc brakes (mechanical or
                hydraulic). Disc brakes are often preferred for stronger, more
                consistent stopping power, especially in wet conditions.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Selecting the right brake type helps you control speed more
                confidently and ride safer in different scenarios.
              </Typography>

              <Typography className="home-subsection-title">
                Trusted brands
              </Typography>
              <Typography className="home-body-text home-mb-16">
                Buying from trusted brands gives you better quality assurance,
                after-sales support, and easier access to replacement parts.
                Well-known brands usually offer options for all budgets and
                riding needs.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Purchase from official stores, authorized dealers, or reputable
                online shops to avoid counterfeit products and protect your
                ownership experience.
              </Typography>

              <Typography className="home-subsection-title">
                Budget and value
              </Typography>
              <Typography className="home-body-text home-mb-16">
                Budget is a major factor when choosing a bike. Entry-level
                options are great for beginners and fitness riding, while
                premium models target advanced riders with higher performance
                expectations.
              </Typography>
              <Typography className="home-body-text home-mb-24">
                Balance your usage frequency, expected features, and spending
                plan. A good bike should stay comfortable and reliable for
                long-term use while still fitting your budget.
              </Typography>

              <Typography
                variant="h6"
                className="home-section-title home-mt-32"
              >
                Choose a reliable bike store
              </Typography>
              <Typography className="home-body-text home-mb-16">
                To own a quality bike, buy from stores or distributors with a
                clear reputation and strong service policies.
              </Typography>
              <Typography className="home-body-text home-mb-16">
                BASAUYCLE is committed to being a trusted sports bike provider
                nationwide.
              </Typography>

              <Box className="home-btn-center home-btn-center-collapse-bottom">
                <Button
                  variant="outlined"
                  onClick={() => setArticleExpanded(false)}
                  className="home-show-less-btn"
                >
                  Show less
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

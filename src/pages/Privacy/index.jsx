import { useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "../../components/header";
import Footer from "../../components/footer";

export default function Privacy() {
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
              fontSize: { xs: 24, md: 30 },
              fontWeight: 800,
              textAlign: "center",
              mb: 4,
            }}
          >
            PRIVACY POLICY
          </Typography>

          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 2 }}>
            Welcome to BASAUYCLE, one of Vietnam's leading professional bicycle
            retail systems.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            By accessing our website, making purchases, or using BASAUYCLE
            services, you agree to the terms in this Privacy Policy. We are
            committed to protecting your privacy and using your data
            transparently and securely to provide the best experience.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            I. DATA TYPES COLLECTED AND PROCESSING METHODS
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            To ensure professional delivery and long-term warranty/after-sales
            services, we may collect the following data:
          </Typography>

          <Typography sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
            1. Collected data categories
          </Typography>
          <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
            a. Basic personal data:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Identity information: full name, gender, date of birth.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Contact information: phone number, email address, and delivery
            address.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Order information: bicycle type, model, color, frame serial
            number, accessories, purchase date, and order value.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1.5 }}>
            - Interaction information: consultation chat history, complaints,
            and feedback about product/service quality.
          </Typography>

          <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
            b. Technical data (when visiting the website):
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - IP address, browser type, and access time.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Cookies: we use cookies to remember preferences, personalize your
            browsing experience, and recommend relevant bike models. You may
            disable cookies in your browser, but some website features may be
            affected.
          </Typography>

          <Typography sx={{ fontWeight: 600, mt: 1, mb: 0.5 }}>
            2. Purpose of data collection and processing
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            BASAUYCLE uses your information for the following legitimate
            purposes:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Order fulfillment and delivery: process orders, confirm payment,
            and deliver nationwide, including inner-city express delivery.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Warranty and after-sales: store purchase data to activate
            warranty, remind periodic maintenance, and provide technical support.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Professional consultation: recommend bike type, size, and setup
            suitable for your needs and body profile.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Marketing and promotions (with consent): send information about
            new models, discounts, and gifts via email/SMS.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Service improvement: analyze data to improve product and service
            quality.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Legal compliance: provide information when lawfully required by
            competent authorities.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            II. PARTIES THAT MAY ACCESS INFORMATION
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            We do not sell or trade your personal information to third parties
            for commercial purposes. Information is only shared in cases such as:
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Shipping, payment, and technical partners, only within necessary
            scope for service delivery.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 3 }}>
            - Legal authorities when requested under applicable law.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            III. DATA STORAGE AND SECURITY
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Retention period: throughout service usage and warranty validity
            (up to 6 years or as required by accounting/tax regulations).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - Security commitment: use SSL, firewalls, access controls, and
            appropriate safeguards. Customers should also protect their account.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            IV. YOUR RIGHTS AND OBLIGATIONS
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Right to access, edit, and request deletion of personal data
            (except data required by law to be retained).
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Right to withdraw consent for marketing communications.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - Obligation to provide accurate information, respect content
            copyright, and notify BASAUYCLE of any security violation.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            V. COPYRIGHT AND POLICY UPDATES
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - All website content (logos, images, articles, slogans, etc.) is
            owned by BASAUYCLE or its partners and protected by copyright.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 1 }}>
            - BASAUYCLE may update this Privacy Policy and publish the latest
            version on the website.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: 18, fontWeight: 700, mb: 1.5 }}
          >
            VI. CONTACT US
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            If you have any questions, complaints, or requests related to data
            privacy rights, please contact BASAUYCLE Customer Support.
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Hotline (24/7): 0386.868.986
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14, mb: 0.5 }}>
            - Email: @gmail.com
          </Typography>
          <Typography sx={{ color: "#4b5563", fontSize: 14 }}>
            We will do our best to respond as soon as possible (typically
            within 48 working hours).
          </Typography>
        </Container>
      </Box>
      <Footer showSubscribe={false} />
    </Box>
  );
}


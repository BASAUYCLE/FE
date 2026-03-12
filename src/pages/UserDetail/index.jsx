import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import {
  EditOutlined,
  CheckCircleOutlined,
  StarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "./index.css";

const userInfo = {
  email: "alex.thompson@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Cycling Way, Portland, OR 97201",
  bio: "Avid cyclist and vintage bike enthusiast. Currently collecting mountain bikes from the early 90s. Always happy to chat about frame geometry!",
};

export default function UserDetail() {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Profile Card */}
        <Card className="user-detail-profile-card">
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    width: 88,
                    height: 88,
                    bgcolor: "#00ccad",
                    fontSize: 32,
                    fontWeight: 600,
                  }}
                >
                  AT
                </Avatar>
                <Box className="user-detail-avatar-edit">
                  <EditOutlined style={{ fontSize: 14, color: "#fff" }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant="h5" fontWeight={700} color="#1a1a1a">
                    Alex Thompson
                  </Typography>
                  <CheckCircleOutlined
                    style={{ color: "#22c55e", fontSize: 20 }}
                  />
                </Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 1.5 }}>
                  Member since Oct 2023
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <span className="user-detail-badge user-detail-badge-teal">
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    Trusted Seller
                  </span>
                  <span className="user-detail-badge user-detail-badge-orange">
                    <StarOutlined style={{ marginRight: 4 }} />
                    4.9 Stars
                  </span>
                </Box>
              </Box>
              <Button
                component={Link}
                to="/set-profile"
                variant="contained"
                className="user-detail-edit-btn"
              >
                Edit Profile
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="user-detail-section-card" sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1a1a1a"
              gutterBottom
            >
              Personal Information
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                mt: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Email Address
                </Typography>
                <Typography variant="body1" color="#1a1a1a">
                  {userInfo.email}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Phone Number
                </Typography>
                <Typography variant="body1" color="#1a1a1a">
                  {userInfo.phone}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Physical Address
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <EnvironmentOutlined
                    style={{ color: "#9ca3af", fontSize: 16, marginTop: 2 }}
                  />
                  <Typography variant="body1" color="#1a1a1a">
                    {userInfo.address}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Bio
                </Typography>
                <Typography
                  variant="body1"
                  color="#1a1a1a"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {userInfo.bio}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Footer
        marketplaceLinks={[
          { label: "All Bikes", href: "#" },
          { label: "Mountain Bikes", href: "#" },
          { label: "Road Bikes", href: "#" },
          { label: "Accessories", href: "#" },
        ]}
        servicesLinks={[
          { label: "Help Center", href: "#" },
          { label: "Safety Tips", href: "#" },
          { label: "Shipping Info", href: "#" },
          { label: "Trust & Safety", href: "#" },
        ]}
        companyLinks={[
          { label: "Terms of Service", href: "#" },
          { label: "Privacy Policy", href: "#" },
          { label: "Cookie Settings", href: "#" },
        ]}
        bottomLinks={[
          { label: "Privacy Policy", href: "#" },
          { label: "Terms of Service", href: "#" },
          { label: "Cookie Settings", href: "#" },
        ]}
      />
    </Box>
  );
}

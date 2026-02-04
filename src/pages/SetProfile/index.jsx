import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Card,
  CardContent,
  InputAdornment,
} from "@mui/material";
import { EditOutlined, EnvironmentOutlined } from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "./index.css";

const initialUserData = {
  fullName: "Alex Thompson",
  email: "alex.thompson@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Cycling Way, Portland, OR 97201",
  bio: "Avid cyclist and vintage bike enthusiast. Currently collecting mountain bikes from the early 90s. Always happy to chat about frame geometry!",
};

export default function SetProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialUserData);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: Call API to save profile
    navigate("/user-detail");
  };

  const handleCancel = () => {
    navigate("/user-detail");
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        <Typography variant="h5" fontWeight={700} color="#1a1a1a" gutterBottom>
          Edit Profile
        </Typography>
        <Typography color="#6b7280" sx={{ mb: 3 }}>
          Update your account information below.
        </Typography>

        {/* Profile Avatar */}
        <Card className="set-profile-card" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1a1a1a"
              gutterBottom
            >
              Profile Photo
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
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
                  {formData.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </Avatar>
                <Box className="set-profile-avatar-edit">
                  <EditOutlined style={{ fontSize: 14, color: "#fff" }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280">
                  Click the icon to upload a new photo
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information Form */}
        <Card className="set-profile-card">
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
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Physical Address
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter your address"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EnvironmentOutlined
                          style={{ color: "#9ca3af", fontSize: 16 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Bio
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  size="small"
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                sx={{ textTransform: "none" }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className="set-profile-save-btn"
                sx={{ textTransform: "none" }}
                onClick={handleSave}
              >
                Save Changes
              </Button>
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

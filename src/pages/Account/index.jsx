import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import {
  EditOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/useNotifications";
import "./index.css";

const EMPTY_PROFILE = { fullName: "", email: "", phone: "", bio: "" };

/** Chỉ lấy dữ liệu từ user đã lưu (đăng ký/cập nhật), không điền mặc định. */
function getInitialFormData(user) {
  if (!user) return { ...EMPTY_PROFILE };
  return {
    fullName: user.fullName ?? user.name ?? user.username ?? "",
    email: user.email ?? "",
    phone: user.phone ?? user.phoneNumber ?? "",
    bio: user.bio ?? "",
  };
}

/** Hiển thị giá trị hoặc "Chưa cập nhật" khi trống (chỉ fill khi user đã cập nhật). */
function displayValue(value, placeholder = "Chưa cập nhật") {
  const v = value?.trim?.() ?? value;
  const isEmpty = v === "" || v == null;
  return { text: isEmpty ? placeholder : v, isEmpty };
}

export default function Account() {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) setFormData(getInitialFormData(user));
  }, [user?.id, user?.email]);

  const displayData = useMemo(
    () => (isEditing ? formData : getInitialFormData(user || formData)),
    [isEditing, formData, user],
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(getInitialFormData(user || formData));
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({
        fullName: formData.fullName,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        phoneNumber: formData.phone,
        bio: formData.bio,
      });
      if (result?.success !== false) {
        message.success("Đã cập nhật thông tin tài khoản.");
        addNotification({
          title: "Đã cập nhật tài khoản",
          message: "Thông tin cá nhân của bạn đã được lưu.",
          type: "success",
          status: "Cập nhật tài khoản",
        });
        setIsEditing(false);
      } else {
        message.error(result?.message || "Cập nhật thất bại.");
      }
    } catch (err) {
      message.error(err?.message || "Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (displayData.fullName?.trim() || "U")
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Profile Card */}
        <Card className="account-profile-card">
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
                  src={user?.avatar ?? user?.imageUrl ?? user?.profileImage}
                  sx={{
                    width: 88,
                    height: 88,
                    bgcolor: "#00ccad",
                    fontSize: 32,
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </Avatar>
                <Box className="account-avatar-edit" title="Đổi ảnh đại diện">
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
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={displayData.fullName?.trim() ? "#1a1a1a" : "#9ca3af"}
                  >
                    {displayData.fullName?.trim() || "Chưa cập nhật tên"}
                  </Typography>
                  <CheckCircleOutlined
                    style={{ color: "#22c55e", fontSize: 20 }}
                  />
                </Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 1.5 }}>
                  Thành viên từ Oct 2023
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <span className="account-badge account-badge-teal">
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    Người bán uy tín
                  </span>
                  <span className="account-badge account-badge-orange">
                    <StarOutlined style={{ marginRight: 4 }} />
                    4.9 sao
                  </span>
                </Box>
              </Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  className="account-edit-btn"
                  startIcon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ textTransform: "none" }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    className="account-save-btn"
                    sx={{ textTransform: "none" }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="account-section-card" sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1a1a1a"
              gutterBottom
            >
              Thông tin cá nhân
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}
            >
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Họ và tên
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Nhập họ tên"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color={
                      displayValue(displayData.fullName).isEmpty
                        ? "#9ca3af"
                        : "#1a1a1a"
                    }
                  >
                    {displayValue(displayData.fullName).text}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Nhập email"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color={
                      displayValue(displayData.email).isEmpty
                        ? "#9ca3af"
                        : "#1a1a1a"
                    }
                  >
                    {displayValue(displayData.email).text}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Số điện thoại
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Nhập số điện thoại"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color={
                      displayValue(displayData.phone).isEmpty
                        ? "#9ca3af"
                        : "#1a1a1a"
                    }
                  >
                    {displayValue(displayData.phone).text}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Giới thiệu
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Giới thiệu ngắn về bạn (tùy chọn)..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color={
                      displayValue(displayData.bio, "Chưa có giới thiệu")
                        .isEmpty
                        ? "#9ca3af"
                        : "#1a1a1a"
                    }
                    sx={{ whiteSpace: "pre-wrap" }}
                  >
                    {displayValue(displayData.bio, "Chưa có giới thiệu").text}
                  </Typography>
                )}
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

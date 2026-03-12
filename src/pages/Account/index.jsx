import { useState, useMemo, useEffect, useCallback } from "react";
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
  PlusOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  message,
  Modal,
  Form,
  Select,
  Input,
  Checkbox,
  Popconfirm,
  Tag,
  Spin,
} from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/useNotifications";
import addressService from "../../services/addressService";
import "./index.css";

const EMPTY_PROFILE = { fullName: "", email: "", phone: "" };

function getInitialFormData(user) {
  if (!user) return { ...EMPTY_PROFILE };
  return {
    fullName: user.fullName ?? user.name ?? user.username ?? "",
    email: user.email ?? "",
    // BE trả về phoneNumber, FE dùng field "phone" để hiển thị
    phone: user.phoneNumber ?? user.phone ?? "",
  };
}

function displayValue(value, placeholder = "Not set") {
  const v = value?.trim?.() ?? value;
  const isEmpty = v === "" || v == null;
  return { text: isEmpty ? placeholder : v, isEmpty };
}

// ─── Address Modal ───────────────────────────────────────────────────────────
function AddressModal({ open, onClose, onSaved, userId, editingAddress }) {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotifications();

  // Load provinces on open
  useEffect(() => {
    if (!open) return;
    setLoadingProvinces(true);
    addressService
      .getProvinces()
      .then((res) => {
        const data = res?.result ?? res?.data ?? res ?? [];
        setProvinces(Array.isArray(data) ? data : []);
      })
      .catch(() => message.error("Failed to load provinces"))
      .finally(() => setLoadingProvinces(false));
  }, [open]);

  // When editing, prefill form and load communes for selected province
  useEffect(() => {
    if (!open) return;
    if (editingAddress) {
      form.setFieldsValue({
        provinceCode: editingAddress.provinceCode,
        communeCode: editingAddress.communeCode,
        streetAddress: editingAddress.streetAddress,
        isDefault: editingAddress.isDefault,
      });
      if (editingAddress.provinceCode) {
        loadCommunes(editingAddress.provinceCode);
      }
    } else {
      form.resetFields();
      setCommunes([]);
    }
  }, [open, editingAddress]);

  const loadCommunes = (provinceCode) => {
    if (!provinceCode) { setCommunes([]); return; }
    setLoadingCommunes(true);
    addressService
      .getCommunes(provinceCode)
      .then((res) => {
        const data = res?.result ?? res?.data ?? res ?? [];
        setCommunes(Array.isArray(data) ? data : []);
      })
      .catch(() => message.error("Failed to load communes"))
      .finally(() => setLoadingCommunes(false));
  };

  const handleProvinceChange = (value) => {
    form.setFieldValue("communeCode", undefined);
    loadCommunes(value);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        communeCode: values.communeCode,
        streetAddress: values.streetAddress,
        isDefault: values.isDefault ?? false,
      };
      if (editingAddress) {
        await addressService.updateAddress(userId, editingAddress.addressId, payload);
        message.success("Address updated successfully!");
        addNotification?.({
          title: "Address updated",
          message: "Your shipping address has been saved.",
          type: "success",
        });
      } else {
        await addressService.createAddress(userId, payload);
        message.success("Address added successfully!");
        addNotification?.({
          title: "Address added",
          message: "A new shipping address has been added to your account.",
          type: "success",
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      const msg =
        err?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Operation failed.";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={editingAddress ? "Save changes" : "Add address"}
      cancelText="Cancel"
      confirmLoading={saving}
      title={editingAddress ? "Edit address" : "Add new address"}
      width={500}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Province */}
        <Form.Item
          name="provinceCode"
          label="Province / City"
          rules={[{ required: true, message: "Please select province/city" }]}
        >
          <Select
            showSearch
            placeholder="Select province/city"
            loading={loadingProvinces}
            onChange={handleProvinceChange}
            optionFilterProp="label"
            options={provinces.map((p) => ({
              label: p.name ?? p.provinceName,
              value: p.code ?? p.provinceCode,
            }))}
          />
        </Form.Item>

        {/* Commune */}
        <Form.Item
          name="communeCode"
          label="Xã / Phường / Thị trấn"
          rules={[{ required: true, message: "Vui lòng chọn xã/phường" }]}
        >
          <Select
            showSearch
            placeholder="Chọn xã/phường"
            loading={loadingCommunes}
            disabled={communes.length === 0}
            optionFilterProp="label"
            options={communes.map((c) => ({
              label: c.name ?? c.communeName,
              value: c.code ?? c.communeCode,
            }))}
          />
        </Form.Item>

        {/* Street address */}
        <Form.Item
          name="streetAddress"
          label="Street address"
          rules={[{ required: true, message: "Please enter street address" }]}
        >
          <Input placeholder="e.g. 123 Main Street" />
        </Form.Item>

        {/* Is default */}
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Address Section ─────────────────────────────────────────────────────────
function AddressSection({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const { addNotification } = useNotifications();

  const fetchAddresses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await addressService.getAddresses(userId);
      const data = res?.result ?? res?.data ?? res ?? [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const openAdd = () => { setEditingAddress(null); setModalOpen(true); };
  const openEdit = (addr) => { setEditingAddress(addr); setModalOpen(true); };

  const handleDelete = async (addressId) => {
    try {
      await addressService.deleteAddress(userId, addressId);
      message.success("Address deleted");
       addNotification?.({
         title: "Address deleted",
         message: "A shipping address has been removed from your account.",
         type: "info",
       });
      fetchAddresses();
    } catch (err) {
      message.error(err?.message ?? err?.data?.message ?? "Delete failed");
    }
  };

  return (
    <Card className="account-section-card" sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#1a1a1a">
            My addresses
          </Typography>
          <Button
            variant="contained"
            className="account-edit-btn"
            startIcon={<PlusOutlined />}
            size="small"
            onClick={openAdd}
            sx={{ textTransform: "none", fontSize: 13 }}
          >
            Add address
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Spin />
          </Box>
        ) : addresses.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "#9ca3af",
              border: "1.5px dashed #e5e7eb",
              borderRadius: 2,
            }}
          >
            <EnvironmentOutlined style={{ fontSize: 32, marginBottom: 8 }} />
            <Typography variant="body2">Chưa có địa chỉ. Hãy thêm địa chỉ đầu tiên!</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {addresses.map((addr) => (
              <Box
                key={addr.addressId}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  p: 2,
                  border: addr.isDefault ? "1.5px solid #00ccad" : "1.5px solid #e5e7eb",
                  borderRadius: 2,
                  backgroundColor: addr.isDefault ? "#f0fdf9" : "#fff",
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <EnvironmentOutlined style={{ color: "#00ccad" }} />
                    <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                      {addr.fullAddress ?? `${addr.streetAddress}, ${addr.communeName}, ${addr.provinceName}`}
                    </Typography>
                    {addr.isDefault && (
                      <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>Default</Tag>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={() => openEdit(addr)}
                    sx={{ textTransform: "none", fontSize: 12, minWidth: 0, px: 1.5 }}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Delete this address?"
                    onConfirm={() => handleDelete(addr.addressId)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlined />}
                      sx={{ textTransform: "none", fontSize: 12, minWidth: 0, px: 1.5 }}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>

      <AddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchAddresses}
        userId={userId}
        editingAddress={editingAddress}
      />
    </Card>
  );
}

// ─── Main Account Page ────────────────────────────────────────────────────────
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
        phoneNumber: formData.phone,
        email: formData.email,
      });
      if (result?.success !== false) {
        message.success("Profile updated successfully.");
        addNotification({
          title: "Profile updated",
          message: "Your information has been saved.",
          type: "success",
          status: "Profile updated",
        });
        setIsEditing(false);
      } else {
        message.error(result?.message || "Update failed.");
      }
    } catch (err) {
      message.error(err?.message || "Update failed. Please try again.");
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

  const userId = user?.id ?? user?.userId;

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fff" },
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}>
      <Header />

      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── Profile Card ── */}
        <Card className="account-profile-card">
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={user?.avatar ?? user?.imageUrl ?? user?.profileImage}
                  sx={{ width: 88, height: 88, bgcolor: "#00ccad", fontSize: 32, fontWeight: 600 }}
                >
                  {initials}
                </Avatar>
                <Box className="account-avatar-edit" title="Change photo">
                  <EditOutlined style={{ fontSize: 14, color: "#fff" }} />
                </Box>
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={displayData.fullName?.trim() ? "#1a1a1a" : "#9ca3af"}
                  >
                    {displayData.fullName?.trim() || "No name set"}
                  </Typography>
                  <CheckCircleOutlined style={{ color: "#22c55e", fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 1.5 }}>
                  Member since Oct 2023
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <span className="account-badge account-badge-teal">
                    <CheckCircleOutlined style={{ marginRight: 4 }} />
                    Verified seller
                  </span>
                  <span className="account-badge account-badge-orange">
                    <StarOutlined style={{ marginRight: 4 }} />
                    4.9 rating
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
                  Edit profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" onClick={handleCancel} sx={{ textTransform: "none" }}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    className="account-save-btn"
                    sx={{ textTransform: "none" }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* ── Personal Information ── */}
        <Card className="account-section-card" sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} color="#1a1a1a" gutterBottom>
              Personal information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
              {/* Full name */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Full name
                </Typography>
                {isEditing ? (
                  <TextField fullWidth size="small" value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter full name" sx={inputSx} />
                ) : (
                  <Typography variant="body1"
                    color={displayValue(displayData.fullName).isEmpty ? "#9ca3af" : "#1a1a1a"}>
                    {displayValue(displayData.fullName).text}
                  </Typography>
                )}
              </Box>

              {/* Email */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                {isEditing ? (
                  <TextField fullWidth size="small" type="email" value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email" sx={inputSx} />
                ) : (
                  <Typography variant="body1"
                    color={displayValue(displayData.email).isEmpty ? "#9ca3af" : "#1a1a1a"}>
                    {displayValue(displayData.email).text}
                  </Typography>
                )}
              </Box>

              {/* Phone */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Số điện thoại
                </Typography>
                {isEditing ? (
                  <TextField fullWidth size="small" value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number" sx={inputSx} />
                ) : (
                  <Typography variant="body1"
                    color={displayValue(displayData.phone).isEmpty ? "#9ca3af" : "#1a1a1a"}>
                    {displayValue(displayData.phone).text}
                  </Typography>
                )}
              </Box>


            </Box>
          </CardContent>
        </Card>

        {/* ── Address Section ── */}
        {userId && <AddressSection userId={userId} />}
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

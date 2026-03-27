import { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  PlusOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  UserPen,
  MapPinPlus,
  Pencil,
  Trash2,
  CircleCheckBig,
} from "lucide-react";
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
import { userService } from "../../services";
import { confirmCrud } from "../../utils/confirmCrud";
import { getAvatarSrc } from "../../utils/avatar";
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

function pickAvatarUrl(user) {
  if (!user || typeof user !== "object") return "";
  return getAvatarSrc(user);
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
    if (!provinceCode) {
      setCommunes([]);
      return;
    }
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
    const ok = await confirmCrud({
      title: editingAddress
        ? "Save shipping address?"
        : "Add shipping address?",
      content: editingAddress
        ? "Updating this address may affect orders that use your saved address."
        : "This address can be selected during checkout.",
      okText: editingAddress ? "Save" : "Add",
    });
    if (!ok) return;
    setSaving(true);
    try {
      const payload = {
        communeCode: values.communeCode,
        streetAddress: values.streetAddress,
        isDefault: values.isDefault ?? false,
      };
      if (editingAddress) {
        await addressService.updateAddress(
          userId,
          editingAddress.addressId,
          payload,
        );
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
      centered
      width="min(640px, calc(100vw - 32px))"
      styles={{
        body: {
          maxHeight: "calc(100vh - 240px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: 6,
        },
      }}
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
          label="Ward / Commune / Town"
          rules={[{ required: true, message: "Please select ward/commune" }]}
        >
          <Select
            showSearch
            placeholder="Select ward/commune"
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
          <Checkbox>Set as default address</Checkbox>
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

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };
  const openEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#1a1a1a">
            My addresses
          </Typography>
          <Button
            variant="contained"
            className="account-edit-btn"
            startIcon={<MapPinPlus size={16} />}
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
            <Typography variant="body2">
              No address yet. Add your first shipping address!
            </Typography>
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
                  border: addr.isDefault
                    ? "1.5px solid #00ccad"
                    : "1.5px solid #e5e7eb",
                  borderRadius: 2,
                  backgroundColor: addr.isDefault ? "#f0fdf9" : "#fff",
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <EnvironmentOutlined style={{ color: "#00ccad" }} />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#1a1a1a"
                    >
                      {addr.fullAddress ??
                        `${addr.streetAddress}, ${addr.communeName}, ${addr.provinceName}`}
                    </Typography>
                    {addr.isDefault && (
                      <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>
                        Default
                      </Tag>
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Pencil size={14} />}
                    onClick={() => openEdit(addr)}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      minWidth: 0,
                      px: 1.5,
                    }}
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
                      startIcon={<Trash2 size={14} />}
                      sx={{
                        textTransform: "none",
                        fontSize: 12,
                        minWidth: 0,
                        px: 1.5,
                      }}
                    >
                      Delete
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
  const { user, updateProfile, refreshProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(() => pickAvatarUrl(user));
  const [avatarLightboxOpen, setAvatarLightboxOpen] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) setFormData(getInitialFormData(user));
  }, [user?.id, user?.email]);

  useEffect(() => {
    const nextAvatar = pickAvatarUrl(user);
    setAvatarPreview(nextAvatar || "");
  }, [user]);

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
    const ok = await confirmCrud({
      title: "Save account information?",
      content: "Update your phone number on your profile.",
      okText: "Save",
    });
    if (!ok) return;
    setSaving(true);
    try {
      const result = await updateProfile({
        phoneNumber: formData.phone,
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
  const avatarSrc = avatarPreview || pickAvatarUrl(user);

  const inputSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fff" },
  };

  const handleAvatarEditClick = () => {
    if (avatarUploading) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event) => {
    const file = event.target?.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error("Image is too large. Maximum size is 5MB.");
      return;
    }

    const ok = await confirmCrud({
      title: "Change profile photo?",
      content:
        "Your new photo will be updated on your account and displayed across the platform.",
      okText: "Upload",
    });
    if (!ok) return;

    setAvatarUploading(true);
    try {
      const res = await userService.uploadMyAvatar(file);
      const payload = res?.result ?? res?.data ?? res;
      const uploadedUrl =
        payload?.avatar ??
        payload?.avatarUrl ??
        payload?.avatar_url ??
        payload?.imageUrl ??
        payload?.url ??
        "";

      // Nếu BE chưa trả URL ngay, dùng local preview để phản hồi tức thời.
      setAvatarPreview(uploadedUrl || URL.createObjectURL(file));
      await refreshProfile?.();
      message.success("Avatar updated successfully.");
      addNotification?.({
        title: "Avatar updated",
        message: "Your profile photo has been changed.",
        type: "success",
      });
    } catch (err) {
      const msg =
        err?.message ?? err?.data?.message ?? "Upload avatar failed. Please try again.";
      message.error(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <Box
      component="main"
      className="account-page"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box className="account-content">
        {/* ── Profile Card ── */}
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
                <Box
                  component="button"
                  type="button"
                  onClick={() => setAvatarLightboxOpen(true)}
                  sx={{
                    border: "none",
                    padding: 0,
                    margin: 0,
                    background: "none",
                    cursor: "zoom-in",
                    borderRadius: "50%",
                    lineHeight: 0,
                    display: "inline-flex",
                    verticalAlign: "middle",
                  }}
                  aria-label="View profile photo larger"
                >
                  <Avatar
                    src={avatarSrc || undefined}
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
                </Box>
                <Box
                  className={`account-avatar-edit ${avatarUploading ? "account-avatar-edit--disabled" : ""}`}
                  title={avatarUploading ? "Uploading..." : "Change photo"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAvatarEditClick();
                  }}
                  role="button"
                  aria-label="Change photo"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleAvatarEditClick();
                    }
                  }}
                >
                  <Pencil size={14} color="#fff" />
                </Box>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarFileChange}
                />
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
                    {displayData.fullName?.trim() || "No name set"}
                  </Typography>
                  <CircleCheckBig size={20} color="#22c55e" />
                </Box>
              </Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  className="account-edit-btn"
                  startIcon={<UserPen size={16} />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit profile
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ textTransform: "none" }}
                  >
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
            <Typography
              variant="h6"
              fontWeight={700}
              color="#1a1a1a"
              gutterBottom
            >
              Personal information
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}
            >
              {/* Full name */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Full name
                </Typography>
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
              </Box>

              {/* Email */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
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
              </Box>

              {/* Phone */}
              <Box>
                <Typography variant="body2" color="#6b7280" sx={{ mb: 0.5 }}>
                  Phone Number
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    sx={inputSx}
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
            </Box>
          </CardContent>
        </Card>

        {/* ── Address Section ── */}
        {userId && <AddressSection userId={userId} />}
      </Box>

      <Modal
        open={avatarLightboxOpen}
        footer={null}
        onCancel={() => setAvatarLightboxOpen(false)}
        centered
        width="auto"
        title="Profile photo"
        destroyOnClose
        styles={{
          body: {
            padding: "16px 8px 24px",
            textAlign: "center",
          },
        }}
      >
        {avatarSrc ? (
          <Box
            component="img"
            src={avatarSrc}
            alt="Profile"
            sx={{
              maxWidth: "min(90vw, 420px)",
              maxHeight: "min(70vh, 420px)",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: 2,
              display: "block",
              mx: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 200,
              height: 200,
              fontSize: 72,
              fontWeight: 600,
              bgcolor: "#00ccad",
              mx: "auto",
            }}
          >
            {initials}
          </Avatar>
        )}
      </Modal>

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

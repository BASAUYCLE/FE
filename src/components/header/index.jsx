import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Avatar,
  IconButton,
  InputBase,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { SearchOutlined } from "@ant-design/icons";
import {
  HeartOutlined,
  BellOutlined,
  WalletOutlined,
  UserOutlined,
  CloseOutlined,
  LogoutOutlined,
  DashboardOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { Receipt, FileText } from "lucide-react";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useNotifications } from "../../contexts/useNotifications";
import { getNavLinksForRole, getActiveLink } from "../../config/headerConfig";
import "./index.css";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.94),
  backdropFilter: "blur(16px)",
  borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
  boxShadow: "none",
  color: theme.palette.text.primary,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  maxWidth: 1160,
  width: "100%",
  margin: "0 auto",
  padding: "14px 24px",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(3),
}));

const LogoLink = styled(Link)({
  display: "flex",
  alignItems: "center",
  gap: 8,
  textDecoration: "none",
  color: "inherit",
});

const NavLinks = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2.25),
  marginLeft: theme.spacing(3),
  fontSize: 14,
}));

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "variant",
})(({ active, variant }) => ({
  color: active ? "#020617" : "#4b5563",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 14,
  transition: "color 0.2s, background 0.2s, box-shadow 0.2s",
  ...(variant === "pill" && {
    padding: "8px 14px",
    borderRadius: 10,
    color: active ? "#00b894" : "#64748b",
    fontWeight: 600,
  }),
  ...(variant === "pill" &&
    active && {
      background: "#e7fbf4",
      boxShadow: "0 6px 14px rgba(0, 184, 148, 0.2)",
    }),
  "&:hover": {
    color: variant === "pill" ? "#00b894" : "#020617",
    ...(variant === "pill" ? { background: "#f1f5f9" } : {}),
  },
}));

const SearchWrapper = styled(Box)(() => ({
  flex: 1,
  display: "flex",
  justifyContent: "center",
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  backgroundColor: "#f3f4f6",
  padding: "8px 14px",
  height: 40,
  maxWidth: 360,
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
}));

const SearchIcon = styled(SearchOutlined)({
  fontSize: 18,
  color: "#9ca3af",
});

const StyledInputBase = styled(InputBase)({
  flex: 1,
  fontSize: 14,
  color: "#6b7280",
  "& input": {
    padding: 0,
    "&::placeholder": {
      color: "#9ca3af",
      opacity: 1,
    },
  },
});

const RightSection = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

const SellButton = styled(Button)({
  backgroundColor: "#00ccad",
  color: "#0f172a",
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#00b89a",
  },
});

const LoginButton = styled(Button)({
  backgroundColor: "#f1f5f9",
  color: "#0f172a",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#e2e8f0",
  },
});

const UserMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    minWidth: 200,
    marginTop: theme.spacing(1.5),
  },
  "& .MuiMenuItem-root": {
    fontSize: 14,
    padding: "10px 16px",
    gap: 12,
  },
  "& .MuiListItemIcon-root": {
    minWidth: 0,
    color: "#6b7280",
  },
}));

const WishlistMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    minWidth: 360,
    maxWidth: 400,
    maxHeight: 420,
    marginTop: theme.spacing(1.5),
  },
}));

const NotificationsMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    minWidth: 360,
    maxWidth: 400,
    maxHeight: 420,
    marginTop: theme.spacing(1.5),
  },
}));

/** Menu dropdown by role: MEMBER (Wishlist, Wallet, Orders, Manage Listings, Account); ADMIN (Admin Dashboard, Account); INSPECTOR (Inspection, Account) */
function getMenuItemsForRole(role) {
  const r = (role ?? "MEMBER").toUpperCase();
  if (r === "ADMIN") {
    return [
      { label: "Admin Dashboard", path: "/admin-dashboard", icon: <DashboardOutlined style={{ fontSize: 18 }} /> },
      { label: "Account", path: "/account", icon: <UserOutlined style={{ fontSize: 18 }} /> },
    ];
  }
  if (r === "INSPECTOR") {
    return [
      { label: "Inspection", path: "/inspector", icon: <AuditOutlined style={{ fontSize: 18 }} /> },
      { label: "Account", path: "/account", icon: <UserOutlined style={{ fontSize: 18 }} /> },
    ];
  }
  return [
    { label: "Wishlist", path: "/wishlist", icon: <HeartOutlined style={{ fontSize: 18 }} /> },
    { label: "Wallet", path: "/wallet", icon: <WalletOutlined style={{ fontSize: 18 }} /> },
    { label: "Pending Payments", path: "/orders", icon: <Receipt size={18} /> },
    { label: "Manage Listings", path: "/manage-listings", icon: <FileText size={18} /> },
    { label: "Account", path: "/account", icon: <UserOutlined style={{ fontSize: 18 }} /> },
  ];
}

/** Lấy role từ user (backend có thể trả user_role hoặc userRole) */
function getUserRole(user) {
  if (!user) return "MEMBER";
  const r = user.role ?? user.userRole ?? user.user_role ?? "MEMBER";
  return String(r).toUpperCase();
}

export default function Header({
  navLinks: navLinksProp,
  activeLink: activeLinkProp,
  navVariant = "default",
  showSearch = true,
  showSellButton,
  showLogin: showLoginProp,
  showAvatar: showAvatarProp,
  showWishlistIcon = true,
  showNotificationIcon = true,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated?.() ?? !!user;
  const role = getUserRole(user);

  const activeLink = activeLinkProp ?? getActiveLink(pathname);
  const showAvatar = showAvatarProp ?? isLoggedIn;
  const showLogin = showLoginProp ?? !isLoggedIn;
  const navLinks = navLinksProp ?? getNavLinksForRole(role);
  const userMenuItems = getMenuItemsForRole(role);
  const showSellButtonResolved =
    (showSellButton ?? pathname !== "/post") &&
    role !== "ADMIN" &&
    role !== "INSPECTOR";

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [wishlistAnchor, setWishlistAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const { wishlist, removeFromWishlist } = useWishlist();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const openUserMenu = Boolean(userMenuAnchor);
  const openWishlist = Boolean(wishlistAnchor);
  const openNotif = Boolean(notifAnchor);

  const handleUserMenuOpen = (e) => {
    e.preventDefault();
    setUserMenuAnchor(e.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleWishlistOpen = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      message.info("Please sign in to use wishlist");
      navigate("/login");
      return;
    }
    setWishlistAnchor(e.currentTarget);
  };
  const handleWishlistClose = () => setWishlistAnchor(null);

  const handleNotifOpen = (e) => {
    e.stopPropagation();
    setNotifAnchor(e.currentTarget);
  };
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <StyledAppBar position="sticky">
      <StyledToolbar>
        <LogoLink to="/" aria-label="Home">
          <img
            src={bikeLogo}
            alt=""
            style={{ width: 40, height: 40, objectFit: "contain" }}
          />
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.02em",
              color: "#000",
              textTransform: "uppercase",
            }}
          >
            BASAUYCLE
          </Box>
        </LogoLink>

        {navLinks.length > 0 && (
          <NavLinks component="nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.href || "#"}
                active={activeLink === link.label}
                variant={navVariant}
              >
                {link.label}
              </NavLink>
            ))}
          </NavLinks>
        )}

        {showSearch && (
          <SearchWrapper>
            <Search>
              <SearchIcon />
              <StyledInputBase
                placeholder="Search bikes..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const q = e.target?.value?.trim?.();
                    navigate(
                      q
                        ? `/marketplace?q=${encodeURIComponent(q)}`
                        : "/marketplace",
                    );
                  }
                }}
              />
            </Search>
          </SearchWrapper>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <RightSection>
          {showWishlistIcon && (
            <IconButton
              onClick={handleWishlistOpen}
              aria-label="Wishlist"
              aria-controls={openWishlist ? "wishlist-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openWishlist ? "true" : undefined}
              sx={{
                color: "#6b7280",
                "&:hover": {
                  color: "#00ccad",
                  backgroundColor: "rgba(0,204,173,0.08)",
                },
              }}
            >
              <Badge
                badgeContent={isLoggedIn ? wishlist.length : 0}
                showZero={false}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#00ccad",
                    color: "#0f172a",
                    fontWeight: 700,
                  },
                }}
              >
                <HeartOutlined style={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          )}
          {showNotificationIcon && role === "MEMBER" && (
            <IconButton
              onClick={handleNotifOpen}
              aria-label="Notifications"
              aria-controls={openNotif ? "notif-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openNotif ? "true" : undefined}
              sx={{
                color: "#6b7280",
                "&:hover": {
                  color: "#00ccad",
                  backgroundColor: "rgba(0,204,173,0.08)",
                },
              }}
            >
              <Badge
                badgeContent={isLoggedIn ? unreadCount : 0}
                color="error"
                showZero={false}
              >
                <BellOutlined style={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          )}
          {showSellButtonResolved && (
            <SellButton component={Link} to="/post">
              Sell Your Bike
            </SellButton>
          )}
          {showLogin && (
            <LoginButton component={Link} to="/login">
              Sign In
            </LoginButton>
          )}
          {showAvatar && (
            <>
              <Avatar
                src={user?.avatar ?? user?.imageUrl ?? user?.profileImage}
                onClick={handleUserMenuOpen}
                aria-controls={openUserMenu ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openUserMenu ? "true" : undefined}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#00ccad",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 16,
                  "&:hover": { bgcolor: "#00b89a" },
                }}
              >
                {(user?.name || user?.fullName || "U").trim()[0].toUpperCase()}
              </Avatar>
              <UserMenu
                id="user-menu"
                anchorEl={userMenuAnchor}
                open={openUserMenu}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      handleUserMenuClose();
                      navigate(item.path);
                    }}
                    sx={{ textDecoration: "none", color: "inherit" }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => {
                    handleUserMenuClose();
                    logout();
                    navigate("/");
                  }}
                  sx={{ borderTop: "1px solid #f3f4f6" }}
                >
                  <ListItemIcon>
                    <LogoutOutlined style={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </MenuItem>
              </UserMenu>
            </>
          )}
        </RightSection>
      </StyledToolbar>

      {/* Wishlist Dropdown */}
      <WishlistMenu
        id="wishlist-menu"
        anchorEl={wishlistAnchor}
        open={openWishlist}
        onClose={handleWishlistClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
          <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
            Wishlist ({wishlist.length})
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 280, overflowY: "auto" }}>
          {wishlist.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center", px: 2 }}>
              <HeartOutlined
                style={{ fontSize: 40, color: "#e5e7eb", marginBottom: 12 }}
              />
              <Typography color="#6b7280" variant="body2">
                Wishlist is empty
              </Typography>
              <Button
                component={Link}
                to="/wishlist"
                variant="contained"
                size="small"
                sx={{
                  mt: 2,
                  bgcolor: "#00ccad",
                  color: "#0f172a",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#00b89a" },
                }}
                onClick={handleWishlistClose}
              >
                View Wishlist
              </Button>
            </Box>
          ) : (
            <>
              {wishlist.slice(0, 5).map((bike) => (
                <MenuItem
                  key={bike.id}
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    borderBottom: "1px solid #f9fafb",
                  }}
                  disableRipple
                >
                  <Box
                    component="img"
                    src={bike.image}
                    alt={bike.name}
                    sx={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#1a1a1a"
                      noWrap
                    >
                      {bike.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="#00ccad"
                      fontWeight={700}
                    >
                      {bike.price}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(bike.id);
                    }}
                  >
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </IconButton>
                </MenuItem>
              ))}
              {wishlist.length > 5 && (
                <Typography
                  variant="body2"
                  color="#6b7280"
                  sx={{ textAlign: "center", py: 1 }}
                >
                  and {wishlist.length - 5} more items
                </Typography>
              )}
            </>
          )}
        </Box>
        {wishlist.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
            <Button
              component={Link}
              to="/wishlist"
              fullWidth
              variant="contained"
              size="small"
              sx={{
                bgcolor: "#00ccad",
                color: "#0f172a",
                fontWeight: 700,
                py: 1,
                "&:hover": { bgcolor: "#00b89a" },
              }}
              onClick={handleWishlistClose}
            >
              View all Wishlist
            </Button>
          </Box>
        )}
      </WishlistMenu>

      {/* Notifications Menu */}
      <NotificationsMenu
        id="notif-menu"
        anchorEl={notifAnchor}
        open={openNotif}
        onClose={handleNotifClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} color="#1a1a1a">
              Thông báo
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ color: "#00ccad", fontSize: 12, textTransform: "none" }}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{ maxHeight: 320, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <BellOutlined
                style={{ fontSize: 40, color: "#e5e7eb", marginBottom: 12 }}
              />
              <Typography color="#6b7280" variant="body2">
                Chưa có thông báo
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => markAsRead(n.id)}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  py: 2,
                  bgcolor: n.read ? "transparent" : "rgba(0,204,173,0.06)",
                  borderBottom: "1px solid #f9fafb",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        bgcolor:
                          n.type === "success"
                            ? "#22c55e"
                            : n.type === "error"
                              ? "#ef4444"
                              : "#0ea5e9",
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={n.read ? 400 : 600}
                      color="#1a1a1a"
                      noWrap
                    >
                      {n.title}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(n.id);
                    }}
                    sx={{ ml: 0.5 }}
                  >
                    <CloseOutlined style={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
                {n.status && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: "inline-block",
                      color: "#00ccad",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                  >
                    {n.status}
                  </Typography>
                )}
                {n.message && (
                  <Typography
                    variant="caption"
                    color="#6b7280"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {n.message}
                  </Typography>
                )}
                <Typography variant="caption" color="#9ca3af" sx={{ mt: 0.5 }}>
                  {new Date(n.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </MenuItem>
            ))
          )}
        </Box>
      </NotificationsMenu>
    </StyledAppBar>
  );
}

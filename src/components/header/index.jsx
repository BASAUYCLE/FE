import { useState, useEffect } from "react";
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
  CloseOutlined,
} from "@ant-design/icons";
import {
  Receipt,
  FileText,
  Heart,
  UserRound,
  LayoutDashboard,
  ClipboardCheck,
  MessageCircle,
  LogOut,
  CreditCard,
  ShoppingCart,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useNotifications } from "../../contexts/useNotifications";
import { confirmCrud } from "../../utils/confirmCrud";
import { getNavLinksForRole, getActiveLink } from "../../config/headerConfig";
import { formatDateTime } from "../../utils/date";
import "./index.css";

const StyledAppBar = styled(AppBar)(() => ({
  background: "linear-gradient(90deg, #00c9b7 0%, #00e6c3 45%, #00b894 100%)",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
  color: "#ffffff",
  borderBottom: "none",
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  maxWidth: 1320,
  width: "100%",
  margin: "0 auto",
  padding: "16px 24px 16px",
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
  justifyContent: "center",
  gap: theme.spacing(2.25),
  fontSize: 14,
}));

const NavBarRow = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: "#ffffff",
  borderTop: "1px solid rgba(15,23,42,0.06)",
  boxShadow: "0 2px 4px rgba(15,23,42,0.06)",
}));

const NavLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "variant",
})(({ active, variant }) => ({
  // Mặc định: dùng cho thanh menu nền trắng (hàng dưới)
  color: active ? "#0f766e" : "#111827",
  textDecoration: "none",
  fontWeight: 500,
  fontSize: 14,
  transition: "color 0.2s, background 0.2s, box-shadow 0.2s",
  paddingBottom: 4,
  borderBottom: active ? "2px solid #0f766e" : "2px solid transparent",
  "&:hover": {
    color: "#0f766e",
  },
  // Biến thể pill: dùng cho chỗ khác (nếu có) trên nền màu
  ...(variant === "pill" && {
    padding: "8px 14px",
    borderRadius: 10,
    color: active ? "#ffffff" : "rgba(255,255,255,0.86)",
    fontWeight: 600,
    borderBottom: "none",
  }),
  ...(variant === "pill" &&
    active && {
      background: "rgba(0,0,0,0.16)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
    }),
  ...(variant === "pill" && {
    "&:hover": {
      color: "#ffffff",
      background: "rgba(0,0,0,0.22)",
    },
  }),
}));

const SearchWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 2),
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 999,
  backgroundColor: "#ffffff",
  padding: "8px 16px",
  height: 42,
  maxWidth: 520,
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  boxShadow: "0 0 0 1px rgba(15,23,42,0.06)",
}));

const SearchIcon = styled(SearchOutlined)({
  fontSize: 18,
  color: "#9ca3af",
});

const StyledInputBase = styled(InputBase)({
  flex: 1,
  fontSize: 14,
  color: "#111827",
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
  backgroundColor: "rgba(0,0,0,0.28)",
  color: "#ffffff",
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.38)",
  },
});

const LoginButton = styled(Button)({
  backgroundColor: "transparent",
  color: "#ffffff",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.16)",
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

const SuggestionsRow = styled(Box)(({ theme }) => ({
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1.25),
  width: "100%",
  maxWidth: 520,
}));

const SuggestionLabel = styled(Typography)({
  fontSize: 12,
  color: "#ffffff",
  whiteSpace: "nowrap",
  fontWeight: 400,
});

const SuggestionTag = styled("button")(({ theme }) => ({
  border: "none",
  outline: "none",
  cursor: "pointer",
  padding: "4px 11px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  backgroundColor: "rgba(45,212,191,0.9)", // teal-300 nhạt
  color: "#ffffff",
  whiteSpace: "nowrap",
  transition: "background-color 0.2s, transform 0.1s",
  "&:hover": {
    backgroundColor: "rgba(20,184,166,1)", // teal-400 đậm hơn khi hover
    transform: "translateY(-1px)",
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

/** Menu dropdown theo role: MEMBER (Wishlist, Wallet, Orders, Quản lý tin, Account); ADMIN (Admin Dashboard, Account); INSPECTOR (Inspection, Account) */
function getMenuItemsForRole(role, user) {
  const roleUpper = (role ?? "MEMBER").toUpperCase();
  if (roleUpper === "ADMIN") {
    return [
      {
        label: "Admin Dashboard",
        path: "/admin-dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Account",
        path: "/account",
        icon: <UserRound size={18} />,
      },
    ];
  }
  if (roleUpper === "INSPECTOR") {
    return [
      {
        label: "Inspection",
        path: "/inspector",
        icon: <ClipboardCheck size={18} />,
      },
      {
        label: "Account",
        path: "/account",
        icon: <UserRound size={18} />,
      },
    ];
  }
  return [
    {
      label: "Wishlist",
      path: "/wishlist",
      icon: <Heart size={18} />,
    },
    {
      label: "Wallet",
      path: "/wallet",
      icon: <CreditCard size={18} />,
    },
    { label: "My Orders", path: "/orders", icon: <ShoppingCart size={18} /> },
    { label: "My Sales", path: "/my-sales", icon: <DollarSign size={18} /> },
    {
      label: "Manage Listings",
      path: "/manage-listings",
      icon: <ClipboardList size={18} />,
    },
    {
      label: "Account",
      path: "/account",
      icon: <UserRound size={18} />,
    },
    ...(user && (user.id || user.userId || user.user_id)
      ? [
          {
            label: "My Feedback",
            path: `/user/${user.id ?? user.userId ?? user.user_id}/feedback`,
            icon: <MessageCircle size={18} />,
          },
        ]
      : []),
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
  homeLink = "/",
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
  const userMenuItems = getMenuItemsForRole(role, user);
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

  // Typewriter effect for search placeholder
  const TYPING_TEXT = "Search by car name or brand...";
  const [placeholderText, setPlaceholderText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const baseDelay = 100; // ms per character

    const timer = setTimeout(() => {
      // Khi gõ xong toàn bộ câu, reset để gõ lại từ đầu
      const nextIndex = typingIndex >= TYPING_TEXT.length ? 0 : typingIndex + 1;
      setTypingIndex(nextIndex);
      setPlaceholderText(TYPING_TEXT.slice(0, nextIndex));
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [typingIndex]);

  const handleSearchSubmit = (raw) => {
    const query = raw?.trim?.() ?? "";
    navigate(
      query ? `/marketplace?q=${encodeURIComponent(query)}` : "/marketplace",
    );
  };

  const handleQuickCategoryClick = (category) => {
    const value = category?.trim?.() ?? "";
    if (!value) {
      navigate("/marketplace");
      return;
    }
    setSearchValue(value);
    navigate(`/marketplace?category=${encodeURIComponent(value)}`);
  };

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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <LogoLink to={homeLink} aria-label="Home">
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
                color: "#ffffff",
                textTransform: "uppercase",
              }}
            >
              BASAUYCLE
            </Box>
          </LogoLink>

          {showSearch && (
            <SearchWrapper>
              <Search>
                <SearchIcon />
                <StyledInputBase
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={placeholderText}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit(e.target.value);
                    }
                  }}
                />
              </Search>
              <SuggestionsRow>
                <SuggestionLabel>Trending Searches:</SuggestionLabel>
                {["Road Bike", "Mountain Bike", "Gravel Bike"].map((text) => (
                  <SuggestionTag
                    key={text}
                    type="button"
                    onClick={() => handleQuickCategoryClick(text)}
                  >
                    {text}
                  </SuggestionTag>
                ))}
              </SuggestionsRow>
            </SearchWrapper>
          )}

          <RightSection>
            {showWishlistIcon && (
              <IconButton
                onClick={handleWishlistOpen}
                aria-label="Wishlist"
                aria-controls={openWishlist ? "wishlist-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openWishlist ? "true" : undefined}
                sx={{
                  color: "#e5e7eb",
                  "&:hover": {
                    color: "#ffffff",
                    backgroundColor: "rgba(255,255,255,0.14)",
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
                  color: "#e5e7eb",
                  "&:hover": {
                    color: "#ffffff",
                    backgroundColor: "rgba(255,255,255,0.14)",
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
                  {(user?.name || user?.fullName || "U")
                    .trim()[0]
                    .toUpperCase()}
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
                    onClick={async () => {
                      handleUserMenuClose();
                      await logout();
                      navigate("/");
                    }}
                    sx={{ borderTop: "1px solid #f3f4f6" }}
                  >
                    <ListItemIcon>
                      <LogOut size={18} />
                    </ListItemIcon>
                    <ListItemText primary="Sign Out" />
                  </MenuItem>
                </UserMenu>
              </>
            )}
          </RightSection>
        </Box>
      </StyledToolbar>

      {navLinks.length > 0 && (
        <NavBarRow>
          <Box
            sx={{
              maxWidth: 1320,
              width: "100%",
              margin: "0 auto",
              px: 3,
              py: 1.75,
            }}
          >
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
              <NavLink
                to="/about"
                active={pathname === "/about"}
                variant={navVariant}
              >
                About
              </NavLink>
              <NavLink
                to="/post"
                active={pathname === "/post"}
                variant={navVariant}
              >
                Post
              </NavLink>
            </NavLinks>
          </Box>
        </NavBarRow>
      )}

      {/* Dropdown Wishlist */}
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
              {wishlist.slice(0, 5).map((bike, idx) => (
                <MenuItem
                  key={bike?.id ?? bike?.postId ?? `wishlist-${idx}`}
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
                    onClick={async (e) => {
                      e.stopPropagation();
                      const ok = await confirmCrud({
                        title: "Xóa khỏi Wishlist?",
                        content: `Gỡ "${bike.name ?? "mục này"}" khỏi danh sách yêu thích?`,
                        okText: "Xóa",
                        danger: true,
                      });
                      if (!ok) return;
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
              Notifications
            </Typography>
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ color: "#00ccad", fontSize: 12, textTransform: "none" }}
              >
                Mark all as read
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
            notifications.map((n, idx) => (
              <MenuItem
                key={n?.id ?? `notif-${idx}`}
                onClick={() => n?.id != null && markAsRead(n.id)}
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
                      if (n?.id != null) removeNotification(n.id);
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
                  {formatDateTime(n.createdAt)}
                </Typography>
              </MenuItem>
            ))
          )}
        </Box>
      </NotificationsMenu>
    </StyledAppBar>
  );
}

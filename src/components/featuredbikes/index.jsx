import { useRef, useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Link as MUILink,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import postService from "../../services/postService";
import { formatCurrency } from "../../utils/formatCurrency";
import { confirmCrud } from "../../utils/confirmCrud";
import { isProductBlockedForWishlist } from "../../utils/postAvailability";
import {
  verificationScorePctFromPostPayload,
  formatInspectionScorePercent,
} from "../../utils/inspectionReportNormalize";
import { fetchPublicInspectionScoresByPostId } from "../../utils/inspectionReportFetch";
import { message } from "antd";
import demoBike from "../../assets/bike-logo.png";
import roadBikeImage from "../../assets/RoadBike.png";
import mountainBikeImage from "../../assets/MountainBike.png";
import gravelBikeImage from "../../assets/GravelBike.webp";
import cityBikeImage from "../../assets/CityBike.jpg";
import eBikeImage from "../../assets/E-bike.webp";
import othersImage from "../../assets/others.jpg";

/** Chuyển posting sang shape bike cho BikeCard */
function postingToBike(p) {
  const priceNum = p.price ?? p.askingPrice ?? 0;
  const priceDisplay =
    p.priceDisplay ??
    (typeof priceNum === "number"
      ? formatCurrency(priceNum)
      : String(priceNum ?? "$0"));
  const images = p.images ?? [];
  const thumb =
    images.find((i) => i?.isThumbnail)?.imageUrl ?? images[0]?.imageUrl;
  const imageUrl = p.imageUrl ?? p.thumbnailUrl ?? thumb ?? null;
  const rawName = p.bikeName ?? p.title ?? p.bicycleName ?? "";
  let brand =
    p.brand ??
    p.brandName ??
    p.brand_name ??
    p.manufacturer ??
    p.manufacturerName ??
    p.make ??
    null;

  if (!brand && typeof rawName === "string" && rawName.trim()) {
    brand = rawName.trim().split(" ")[0];
  }

  const status = p.status ?? p.postStatus;

  return {
    id: p.id,
    name: rawName || "Untitled",
    price: priceDisplay,
    rawPrice: typeof priceNum === "number" ? priceNum : 0,
    category: p.category ?? p.categoryName ?? p.bicycleType ?? "BIKE",
    image: imageUrl,
    brand: brand,
    badge:
      p.status === POSTING_STATUS.AVAILABLE ||
      p.postStatus === "AVAILABLE" ||
      p.status === POSTING_STATUS.VERIFIED ||
      p.postStatus === "VERIFIED"
        ? "INSPECTED"
        : p.status === POSTING_STATUS.PENDING_REVIEW ||
            p.postStatus === "PENDING_REVIEW"
          ? "PENDING"
          : "NEW ARRIVAL",
    specs: {},
    sellerId: p.sellerId ?? p.seller_id ?? null,
    status,
    postStatus: status,
    verificationScorePct: verificationScorePctFromPostPayload(p),
  };
}

const FeaturedBikesSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  backgroundColor: "#f9fafa",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(7.5, 0),
  },
}));

const FeaturedBikesContainer = styled(Container)(({ theme }) => ({
  maxWidth: 1320,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: theme.spacing(5),
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
  },
}));

const SectionTitle = styled(Typography)({
  fontSize: 40,
  fontWeight: 700,
  color: "#1a1a1a",
  marginBottom: 8,
});

const SectionDescription = styled(Typography)({
  fontSize: 16,
  color: "#6b7280",
});

const ViewGalleryLink = styled(MUILink)({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#00ccad",
  fontWeight: 700,
  fontSize: 16,
  textDecoration: "none",
  "&:hover": {
    color: "#00b89a",
  },
});

const CARD_WIDTH = 280;
const CARD_GAP = 24;
const SCROLL_AMOUNT = CARD_WIDTH + CARD_GAP;

const CarouselWrapper = styled(Box)(({ theme }) => ({
  position: "relative",
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(-1),
}));

const CarouselScroll = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: CARD_GAP,
  overflowX: "auto",
  overflowY: "visible",
  scrollSnapType: "x mandatory",
  scrollBehavior: "smooth",
  padding: theme.spacing(1),
  paddingLeft: 56,
  paddingRight: 56,
  marginBottom: theme.spacing(1),
  alignItems: "flex-start",
  [theme.breakpoints.down("sm")]: {
    paddingLeft: 48,
    paddingRight: 48,
  },
  "&::-webkit-scrollbar": { height: 8 },
  "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: 4 },
  "&::-webkit-scrollbar-thumb": { background: "#c1c1c1", borderRadius: 4 },
}));

const CarouselCardSlot = styled(Box)({
  flexShrink: 0,
  width: CARD_WIDTH,
  minHeight: 420,
  scrollSnapAlign: "start",
  "& .ant-card": {
    height: "100%",
    minHeight: 420,
    display: "flex",
    flexDirection: "column",
  },
  "& .ant-card-body": {
    overflow: "visible",
  },
  "& .bike-card-actions": {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
});

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  width: 48,
  height: 48,
  backgroundColor: "#fff",
  boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
  "&:hover": {
    backgroundColor: "#f9fafa",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
  "&.MuiIconButton-root": {
    color: "#1a1a1a",
  },
  [theme.breakpoints.down("sm")]: {
    width: 40,
    height: 40,
  },
}));

const CategoryGrid = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "nowrap",
  gap: theme.spacing(2.5),
  justifyContent: "center",
  overflowX: "auto",
  paddingBottom: theme.spacing(1),
}));

const CategoryCard = styled(Box)(({ theme }) => ({
  width: 180,
  padding: theme.spacing(2),
  borderRadius: 20,
  backgroundColor: "#ffffff",
  /* Không dùng box-shadow lớn — bóng lan ngang chồng giữa các ô tạo vệt xám */
  border: "1px solid #e8ecf0",
  boxShadow: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1.5),
  transition: "border-color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    borderColor: "#d1d5db",
    transform: "translateY(-2px)",
  },
}));

const CategoryImage = styled("div")(() => ({
  width: 140,
  height: 100,
  borderRadius: 16,
  overflow: "hidden",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const CategoryLabel = styled(Typography)({
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
});

const CategorySection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(6),
  padding: theme.spacing(3, 0, 1),
  borderTop: "1px solid #e5e7eb",
  /* Header sticky — chừa khoảng để tiêu đề Road Bike / Mountain Bike… còn nguyên trong viewport */
  scrollMarginTop: "124px",
  [theme.breakpoints.down("sm")]: {
    scrollMarginTop: "96px",
  },
}));

const CategorySectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2.5),
  gap: theme.spacing(2),
  /* Fallback nếu trình duyệt mở #home-category-* trực tiếp */
  scrollMarginTop: "calc(168px + 16px)",
  [theme.breakpoints.down("sm")]: {
    scrollMarginTop: "calc(120px + 12px)",
  },
}));

const CategorySectionTitle = styled(Typography)({
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#b91c1c",
});

const CategorySectionViewAll = styled(MUILink)({
  fontSize: 14,
  fontWeight: 600,
  color: "#dc2626",
  textDecoration: "none",
  whiteSpace: "nowrap",
  "&:hover": {
    textDecoration: "underline",
  },
});

const CategoryRowWrapper = styled(Box)(() => ({
  position: "relative",
}));

const CategoryRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "nowrap",
  gap: theme.spacing(2.5),
  overflowX: "auto",
  paddingBottom: theme.spacing(1),
  scrollBehavior: "smooth",
  WebkitOverflowScrolling: "touch",
  cursor: "grab",
  "&:active": {
    cursor: "grabbing",
  },
  "&::-webkit-scrollbar": {
    height: 0,
  },
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "transparent",
  },
}));

// Card layout giống "XE ĐẠP DÀNH CHO NỮ"
const SimpleProductCardRoot = styled(Box)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 26px rgba(15,23,42,0.07)",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  textDecoration: "none",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: "0 16px 44px rgba(15,23,42,0.16)",
    transform: "translateY(-4px)",
  },
}));

const SimpleProductImageWrapper = styled("div")(() => ({
  width: "100%",
  aspectRatio: "4 / 3",
  backgroundColor: "#f3f4f6",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
}));

/** Cùng phong cách pill “verified” như trang chi tiết — đặt trên ảnh card */
const VerifiedListingPhotoBadge = styled(Box)(() => ({
  position: "absolute",
  top: 8,
  left: 8,
  zIndex: 1,
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 11px",
  borderRadius: 999,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  lineHeight: 1.25,
  color: "#fff",
  background: "linear-gradient(135deg, #00ccad 0%, #0d9488 100%)",
  boxShadow: "0 4px 14px rgba(0, 204, 173, 0.35)",
  maxWidth: "calc(100% - 52px)",
  flexWrap: "wrap",
  pointerEvents: "none",
  "&::before": {
    content: '""',
    display: "inline-block",
    width: 5,
    height: 8,
    marginBottom: 1,
    border: "solid #fff",
    borderWidth: "0 2px 2px 0",
    transform: "rotate(45deg)",
    flexShrink: 0,
    opacity: 0.95,
  },
}));

const SimpleProductTitle = styled(Typography)({
  fontSize: 14,
  fontWeight: 500,
  color: "#111827",
  lineHeight: 1.4,
  minHeight: 40,
});

const SimpleProductPrice = styled(Typography)({
  fontSize: 15,
  fontWeight: 700,
  color: "#dc2626",
  marginTop: 4,
});

const SimpleProductMetaRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: 6,
  fontSize: 12,
}));

const SimpleProductMetaText = styled("span")({
  fontSize: 12,
  color: "#6b7280",
});

const CATEGORY_KEYS = ["road", "mountain", "gravel", "city", "ebike", "others"];

const CATEGORY_SECTION_TITLES = {
  road: "Road Bike",
  mountain: "Mountain Bike",
  gravel: "Gravel Bike",
  city: "City Bike",
  ebike: "E-Bike",
  others: "Others",
};

/** 6 ô PRODUCT CATEGORIES — trùng key với section bên dưới để cuộn đúng chỗ */
const HOME_PRODUCT_CATEGORY_CARDS = CATEGORY_KEYS.map((key) => ({
  key,
  label: CATEGORY_SECTION_TITLES[key],
}));

const CATEGORY_CARD_IMAGE_BY_KEY = {
  road: roadBikeImage,
  mountain: mountainBikeImage,
  gravel: gravelBikeImage,
  city: cityBikeImage,
  ebike: eBikeImage,
  others: othersImage,
};

/** Vị trí cuộn dọc — một số trình duyệt chỉ có documentElement.scrollTop, window.scrollY = 0 → tránh top âm → nhảy về đầu trang */
function getWindowScrollTop() {
  if (typeof window === "undefined") return 0;
  return (
    window.pageYOffset ??
    window.scrollY ??
    document.documentElement?.scrollTop ??
    document.body?.scrollTop ??
    0
  );
}

/** Cuộn tới hàng tiêu đề danh mục — offset theo chiều cao AppBar sticky để chữ không bị che */
function scrollToHomeCategorySection(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const run = () => {
    const appBar =
      document.querySelector("header.MuiAppBar-root") ??
      document.querySelector(".MuiAppBar-root");
    const gapPx = 16;
    const offset = (appBar?.offsetHeight ?? 168) + gapPx;
    const scrollTop = getWindowScrollTop();
    const rect = el.getBoundingClientRect();
    const targetY = rect.top + scrollTop - offset;
    window.scrollTo({
      top: Math.max(0, targetY),
      left: 0,
      behavior: "smooth",
    });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}

function resolveCategoryKeyFromText(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("road")) return "road";
  if (t.includes("mountain") || t.includes("mtb") || t.includes("địa hình"))
    return "mountain";
  if (t.includes("gravel")) return "gravel";
  if (t.includes("city") || t.includes("phố")) return "city";
  if (t.includes("e-bike") || t.includes("ebike") || t.includes("điện"))
    return "ebike";
  return "others";
}

function isVerifiedListingCardBadge(bike) {
  const b = String(bike?.badge ?? "").toUpperCase();
  return b.includes("VERIFIED") || b === "INSPECTED";
}

function SimpleProductCard({ bike, variant = "grid" }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const soldRaw =
    bike.sold ??
    bike.salesCount ??
    bike.specs?.sold ??
    bike.specs?.soldCount ??
    0;
  const sold = Number.isFinite(Number(soldRaw)) ? Number(soldRaw) : 0;

  const isList = variant === "list";

  const isLoggedIn = isAuthenticated?.() ?? !!user;
  const inWishlist = isInWishlist(bike.id);
  const wishlistAddBlocked = isProductBlockedForWishlist(bike);
  const isOwnListing =
    bike.sellerId != null &&
    user &&
    (bike.sellerId == user.id ||
      bike.sellerId == user.userId ||
      bike.sellerId == user.user_id ||
      bike.sellerId === user.email);

  const verificationScorePct =
    typeof bike.verificationScorePct === "number" &&
    Number.isFinite(bike.verificationScorePct)
      ? bike.verificationScorePct
      : null;
  const showVerifiedPhotoBadge = isVerifiedListingCardBadge(bike);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnListing) return;
    if (!isLoggedIn) {
      message.info("Please sign in to use Wishlist.");
      navigate("/login");
      return;
    }
    if (inWishlist) {
      const ok = await confirmCrud({
        title: "Remove from wishlist?",
        content: `Remove "${bike.name ?? "this item"}" from your wishlist?`,
        okText: "Remove",
        danger: true,
      });
      if (!ok) return;
      removeFromWishlist(bike.id);
    } else {
      addToWishlist(bike);
    }
  };

  return (
    <SimpleProductCardRoot
      component={Link}
      to={`/product/${bike.id}`}
      sx={
        isList
          ? {
              flexDirection: "row",
              alignItems: "center",
              padding: 1.25,
              columnGap: 2,
              rowGap: 1,
              maxHeight: 150,
            }
          : { minHeight: 330 }
      }
    >
      <SimpleProductImageWrapper
        style={
          isList
            ? {
                width: 170,
                height: 110,
                aspectRatio: "auto",
                borderRadius: 8,
                flexShrink: 0,
              }
            : {}
        }
      >
        <img
          src={bike.image || demoBike}
          alt={bike.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
        {showVerifiedPhotoBadge ? (
          <VerifiedListingPhotoBadge
            component="span"
            aria-label={
              verificationScorePct != null
                ? `Verified, inspection score ${verificationScorePct}%`
                : "Verified"
            }
            sx={
              isList
                ? {
                    top: 6,
                    left: 6,
                    padding: "4px 8px",
                    fontSize: 7.5,
                    maxWidth: "calc(100% - 44px)",
                    gap: "4px",
                    "&::before": {
                      width: 4,
                      height: 6,
                      borderWidth: "0 1.5px 1.5px 0",
                    },
                  }
                : undefined
            }
          >
            {verificationScorePct != null
              ? `VERIFIED: ${formatInspectionScorePercent(verificationScorePct)}%`
              : "VERIFIED"}
          </VerifiedListingPhotoBadge>
        ) : null}
        {!isOwnListing && (
          <IconButton
            onClick={handleFavoriteClick}
            disabled={wishlistAddBlocked && !inWishlist}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "50%",
              boxShadow: "0 1px 4px rgba(15,23,42,0.15)",
              "&:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {inWishlist ? (
              <HeartFilled style={{ color: "#ef4444", fontSize: 16 }} />
            ) : (
              <HeartOutlined style={{ color: "#6b7280", fontSize: 16 }} />
            )}
          </IconButton>
        )}
      </SimpleProductImageWrapper>
      <Box
        sx={
          isList
            ? {
                px: 1.75,
                py: 1,
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }
            : { px: 1.5, pt: 1.25, pb: 1.5 }
        }
      >
        <SimpleProductTitle>{bike.name}</SimpleProductTitle>
        <SimpleProductPrice>{bike.price}</SimpleProductPrice>
        <SimpleProductMetaRow>
          {sold > 0 && (
            <SimpleProductMetaText>Sold {sold}</SimpleProductMetaText>
          )}
          <SimpleProductMetaText style={{ color: "#16a34a", fontWeight: 500 }}>
            In stock
          </SimpleProductMetaText>
        </SimpleProductMetaRow>
      </Box>
    </SimpleProductCardRoot>
  );
}

export { SimpleProductCard };

export default function FeaturedBikes() {
  const scrollRef = useRef(null);
  const categoryRowRefs = useRef({});
  const dragStateRef = useRef({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { postings, publicPostings, loadPublicPostings, loadPostingsBySeller } =
    usePostings();
  const [apiPostings, setApiPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicInspectionScores, setPublicInspectionScores] = useState({});

  useEffect(() => {
    let cancelled = false;
    fetchPublicInspectionScoresByPostId().then((scores) => {
      if (!cancelled) setPublicInspectionScores(scores);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadPublicPostings();
  }, [loadPublicPostings]);

  useEffect(() => {
    const sellerId = user?.id ?? user?.userId ?? user?.user_id;
    if (sellerId) loadPostingsBySeller(sellerId);
  }, [user?.id, user?.userId, user?.user_id, loadPostingsBySeller]);

  // Load bài đăng từ API (posts list hoặc featured) để hiển thị, không dùng mã giả
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    postService
      .getPosts({ limit: 12 })
      .then((res) => {
        if (cancelled) return;
        const raw = res?.data ?? res?.result ?? res?.content ?? res;
        const list = Array.isArray(raw)
          ? raw
          : (raw?.content ?? raw?.posts ?? []);
        setApiPostings(list);
      })
      .catch(() => {
        if (!cancelled) setApiPostings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Chỉ hiển thị bài đã duyệt (ADMIN_APPROVED) hoặc đang hiển thị (AVAILABLE); ưu tiên API, gộp với publicPostings/postings, bỏ trùng theo id
  const allFeaturedBikes = useMemo(() => {
    const allowed = (p) =>
      p.status === POSTING_STATUS.AVAILABLE ||
      p.status === POSTING_STATUS.ADMIN_APPROVED ||
      p.postStatus === "AVAILABLE" ||
      p.postStatus === "ADMIN_APPROVED";
    const byId = new Map();
    [...apiPostings, ...publicPostings, ...postings]
      .filter((p) => {
        if (!p?.id) return false;
        const status = p.status ?? p.postStatus;
        return (
          status === POSTING_STATUS.AVAILABLE ||
          status === POSTING_STATUS.ADMIN_APPROVED ||
          status === "AVAILABLE" ||
          status === "ADMIN_APPROVED"
        );
      })
      .forEach((p) => {
        byId.set(p.id, p);
      });
    return [...byId.values()].map((p) => {
      const bike = postingToBike(p);
      if (bike.verificationScorePct != null) return bike;
      const id = String(bike.id ?? bike.postId ?? "");
      const s = id ? publicInspectionScores[id] : undefined;
      if (typeof s === "number" && Number.isFinite(s)) {
        return { ...bike, verificationScorePct: s };
      }
      return bike;
    });
  }, [apiPostings, postings, publicPostings, publicInspectionScores]);

  const categorizedBikes = useMemo(() => {
    const buckets = {
      road: [],
      mountain: [],
      gravel: [],
      city: [],
      ebike: [],
      others: [],
    };
    allFeaturedBikes.forEach((b) => {
      const combinedText = `${b.category ?? ""} ${b.name ?? ""}`;
      const key = resolveCategoryKeyFromText(combinedText);
      if (buckets[key]) {
        buckets[key].push(b);
      } else {
        buckets.others.push(b);
      }
    });
    return buckets;
  }, [allFeaturedBikes]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const step = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
  };

  const scrollCategoryRow = (key, direction) => {
    const row = categoryRowRefs.current[key];
    if (!row) return;
    const step = direction === "left" ? -260 : 260;
    row.scrollBy({ left: step, behavior: "smooth" });
  };

  const handleRowMouseDown = (key, e) => {
    const row = categoryRowRefs.current[key];
    if (!row) return;
    const dragState = dragStateRef.current[key] || {};
    dragState.isDown = true;
    dragState.startX = e.pageX - row.offsetLeft;
    dragState.scrollLeft = row.scrollLeft;
    dragStateRef.current[key] = dragState;
  };

  const handleRowMouseLeaveOrUp = (key) => {
    const dragState = dragStateRef.current[key];
    if (!dragState) return;
    dragState.isDown = false;
  };

  const handleRowMouseMove = (key, e) => {
    const row = categoryRowRefs.current[key];
    const dragState = dragStateRef.current[key];
    if (!row || !dragState?.isDown) return;
    e.preventDefault();
    const x = e.pageX - row.offsetLeft;
    const walk = (x - dragState.startX) * 1.2;
    row.scrollLeft = dragState.scrollLeft - walk;
  };

  return (
    <FeaturedBikesSection component="section">
      <FeaturedBikesContainer>
        <SectionHeader
          sx={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <SectionTitle variant="h2">PRODUCT CATEGORIES</SectionTitle>
        </SectionHeader>

        <CategoryGrid>
          {HOME_PRODUCT_CATEGORY_CARDS.map((cat) => {
            const sectionId = `home-category-${cat.key}`;
            const imgSrc = CATEGORY_CARD_IMAGE_BY_KEY[cat.key] ?? demoBike;
            return (
              <CategoryCard
                key={cat.key}
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  scrollToHomeCategorySection(sectionId);
                }}
                sx={{
                  cursor: "pointer",
                  border: "none",
                  font: "inherit",
                  textAlign: "center",
                }}
              >
                <CategoryImage>
                  <img
                    src={imgSrc}
                    alt={cat.label}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      display: "block",
                    }}
                  />
                </CategoryImage>
                <CategoryLabel>{cat.label}</CategoryLabel>
              </CategoryCard>
            );
          })}
        </CategoryGrid>

        {CATEGORY_KEYS.map((key) => {
          const bikes = categorizedBikes[key] ?? [];
          const title = CATEGORY_SECTION_TITLES[key] ?? key;
          return (
            <CategorySection key={key}>
              <CategorySectionHeader id={`home-category-${key}`}>
                <CategorySectionTitle component="h3">
                  {title}
                </CategorySectionTitle>
                <CategorySectionViewAll
                  component={Link}
                  to={`/marketplace?category=${encodeURIComponent(title)}`}
                >
                  View all »
                </CategorySectionViewAll>
              </CategorySectionHeader>
              <CategoryRowWrapper
                sx={{
                  "&:hover .category-row-arrow": {
                    opacity: 1,
                    pointerEvents: "auto",
                  },
                }}
              >
                <ArrowButton
                  className="category-row-arrow"
                  onClick={() => scrollCategoryRow(key, "left")}
                  sx={{
                    left: -6,
                    opacity: 0,
                    pointerEvents: "none",
                    width: 40,
                    height: 40,
                  }}
                >
                  <ArrowLeftOutlined />
                </ArrowButton>
                <CategoryRow
                  ref={(el) => {
                    if (el) categoryRowRefs.current[key] = el;
                  }}
                  onMouseDown={(e) => handleRowMouseDown(key, e)}
                  onMouseLeave={() => handleRowMouseLeaveOrUp(key)}
                  onMouseUp={() => handleRowMouseLeaveOrUp(key)}
                  onMouseMove={(e) => handleRowMouseMove(key, e)}
                >
                  {bikes.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        fontSize: 13,
                        fontStyle: "italic",
                        px: 1,
                      }}
                    >
                      No bikes in this category yet.
                    </Typography>
                  ) : (
                    bikes.slice(0, 5).map((bike) => (
                      <Box
                        key={`home-cat-${key}-${bike.id}`}
                        sx={{ minWidth: 230, maxWidth: 250, flexShrink: 0 }}
                      >
                        <SimpleProductCard bike={bike} />
                      </Box>
                    ))
                  )}
                </CategoryRow>
                <ArrowButton
                  className="category-row-arrow"
                  onClick={() => scrollCategoryRow(key, "right")}
                  sx={{
                    right: -6,
                    opacity: 0,
                    pointerEvents: "none",
                    width: 40,
                    height: 40,
                  }}
                >
                  <ArrowRightOutlined />
                </ArrowButton>
              </CategoryRowWrapper>
            </CategorySection>
          );
        })}
      </FeaturedBikesContainer>
    </FeaturedBikesSection>
  );
}

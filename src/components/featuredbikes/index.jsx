import { useRef, useMemo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Container, Typography, IconButton, Link as MUILink } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowRightOutlined, ArrowLeftOutlined, StarFilled, HeartOutlined, HeartFilled } from "@ant-design/icons";
import BikeCard from "../card";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import postService from "../../services/postService";
import { formatCurrency } from "../../utils/formatCurrency";
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

  return {
    id: p.id,
    name: rawName || "Untitled",
    price: priceDisplay,
    rawPrice: typeof priceNum === "number" ? priceNum : 0,
    category: p.category ?? p.categoryName ?? p.bicycleType ?? "BIKE",
    image: imageUrl,
    brand: brand,
    badge:
      p.status === POSTING_STATUS.AVAILABLE || p.postStatus === "AVAILABLE"
        ? "INSPECTED"
        : p.status === POSTING_STATUS.PENDING_REVIEW ||
            p.postStatus === "PENDING_REVIEW"
          ? "PENDING"
          : "NEW ARRIVAL",
    specs: {},
    sellerId: p.sellerId ?? p.seller_id ?? null,
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
  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

const CategoryImage = styled("div")(() => ({
  width: 140,
  height: 100,
  borderRadius: 16,
  overflow: "hidden",
  background: "#f9fafb",
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
}));

const CategorySectionHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2.5),
  gap: theme.spacing(2),
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
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  overflow: "hidden",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  textDecoration: "none",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  "&:hover": {
    boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
    transform: "translateY(-3px)",
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

const STATIC_FALLBACK_CATEGORIES = [
  { key: "female", label: "Xe Đạp Nữ" },
  { key: "mtb", label: "Xe Đạp Địa Hình" },
  { key: "road", label: "Xe Đạp Đua" },
  { key: "city", label: "Xe Đạp Phố" },
  { key: "fixed", label: "Fixed Gear" },
  { key: "student", label: "Xe Đạp Học Sinh" },
  { key: "folding", label: "Xe Đạp Gấp" },
  { key: "ebike", label: "Trợ Lực Điện" },
];

const CATEGORY_KEYS = ["road", "mountain", "gravel", "city", "ebike", "others"];

const CATEGORY_SECTION_TITLES = {
  road: "Road Bike",
  mountain: "Mountain Bike",
  gravel: "Gravel Bike",
  city: "City Bike",
  ebike: "E-Bike",
  others: "Others",
};

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

function SimpleProductCard({ bike, variant = "grid" }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const rating =
    typeof bike.rating === "number"
      ? bike.rating.toFixed(1)
      : bike.rating ?? "5.0";
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
  const isOwnListing =
    bike.sellerId != null &&
    user &&
    (bike.sellerId == user.id ||
      bike.sellerId == user.userId ||
      bike.sellerId == user.user_id ||
      bike.sellerId === user.email);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOwnListing) return;
    if (!isLoggedIn) {
      message.info("Vui lòng đăng nhập để dùng Wishlist");
      navigate("/login");
      return;
    }
    if (inWishlist) {
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
          : {}
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
        {!isOwnListing && (
          <IconButton
            onClick={handleFavoriteClick}
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
            aria-label={
              inWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <StarFilled style={{ color: "#f59e0b", fontSize: 14 }} />
            <SimpleProductMetaText>{rating}</SimpleProductMetaText>
          </Box>
          {sold > 0 && (
            <SimpleProductMetaText>
              Đã bán {sold}
            </SimpleProductMetaText>
          )}
          <SimpleProductMetaText style={{ color: "#16a34a", fontWeight: 500 }}>
            Còn hàng
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
  const [categoryCards, setCategoryCards] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

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
    return [...byId.values()].map(postingToBike);
  }, [apiPostings, postings, publicPostings]);

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

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        setCategoryLoading(true);
        const res = await postService.getCategories();
        if (cancelled) return;
        const raw = res?.data ?? res?.result ?? res;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.result)
            ? raw.result
            : [];
        const mapped = list.map((c, idx) => ({
          key: String(c.categoryId ?? c.id ?? idx),
          label: c.categoryName ?? c.name ?? `Category ${idx + 1}`,
        }));
        if (mapped.length > 0) {
          const others = [];
          const rest = [];
          mapped.forEach((item) => {
            const text = item.label?.toString().toLowerCase() ?? "";
            if (text === "others" || text === "other" || text === "khác") {
              others.push(item);
            } else {
              rest.push(item);
            }
          });
          setCategoryCards([...rest, ...others].slice(0, 8));
        } else {
          setCategoryCards(STATIC_FALLBACK_CATEGORIES);
        }
      } catch {
        if (!cancelled) {
          setCategoryCards(STATIC_FALLBACK_CATEGORIES);
        }
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

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
          <SectionTitle variant="h2">DANH MỤC SẢN PHẨM</SectionTitle>
        </SectionHeader>

        <CategoryGrid>
          {(categoryLoading ? STATIC_FALLBACK_CATEGORIES : categoryCards).map(
            (cat) => {
              const key = resolveCategoryKeyFromText(cat.label);
              const sectionId = `home-category-${key}`;
              return (
                <CategoryCard
                  key={cat.key}
                  onClick={() => {
                    const el = document.getElementById(sectionId);
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const offset = 100; // chừa khoảng cho header
                      const targetY = rect.top + window.scrollY - offset;
                      window.scrollTo({
                        top: targetY,
                        behavior: "smooth",
                      });
                    }
                  }}
                  sx={{ cursor: "pointer" }}
                >
                  <CategoryImage>
                    <img
                      src={
                        cat.label === "Road Bike"
                          ? roadBikeImage
                          : cat.label === "Mountain Bike"
                            ? mountainBikeImage
                            : cat.label === "Gravel Bike"
                              ? gravelBikeImage
                              : cat.label === "City Bike"
                                ? cityBikeImage
                                : cat.label === "E-Bike"
                                  ? eBikeImage
                                  : cat.label === "Others"
                                    ? othersImage
                                    : demoBike
                      }
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
            },
          )}
        </CategoryGrid>

        {CATEGORY_KEYS.map((key) => {
          const bikes = categorizedBikes[key] ?? [];
          const title = CATEGORY_SECTION_TITLES[key] ?? key;
          return (
            <CategorySection id={`home-category-${key}`} key={key}>
              <CategorySectionHeader>
                <CategorySectionTitle component="h3">
                  {title}
                </CategorySectionTitle>
                <CategorySectionViewAll
                  component={Link}
                  to={`/marketplace?category=${encodeURIComponent(title)}`}
                >
                  Xem tất cả »
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
                    Hiện chưa có xe trong danh mục này.
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

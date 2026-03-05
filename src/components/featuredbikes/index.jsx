import { useRef, useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Link as MUILink,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import BikeCard from "../card";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import postService from "../../services/postService";
import { formatCurrency } from "../../utils/formatCurrency";

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
  return {
    id: p.id,
    name: p.bikeName ?? p.title ?? p.bicycleName ?? "Untitled",
    price: priceDisplay,
    rawPrice: typeof priceNum === "number" ? priceNum : 0,
    category: p.category ?? p.categoryName ?? p.bicycleType ?? "BIKE",
    image: imageUrl,
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
  maxWidth: 1200,
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

export default function FeaturedBikes() {
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const { postings, publicPostings, loadPublicPostings, loadPostingsBySeller } =
    usePostings();
  const [apiPostings, setApiPostings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const step = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
  };

  return (
    <FeaturedBikesSection component="section">
      <FeaturedBikesContainer>
        <SectionHeader>
          <Box>
            <SectionTitle variant="h2">Featured Bikes</SectionTitle>
            <SectionDescription>
              The best deals curated by our experts this week.
            </SectionDescription>
          </Box>
          <ViewGalleryLink component={Link} to="/marketplace">
            View Gallery
            <ArrowRightOutlined />
          </ViewGalleryLink>
        </SectionHeader>

        <CarouselWrapper>
          <ArrowButton
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            sx={{ left: { xs: 4, sm: 8 } }}
          >
            <ArrowLeftOutlined style={{ fontSize: 18 }} />
          </ArrowButton>
          <ArrowButton
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            sx={{ right: { xs: 4, sm: 8 } }}
          >
            <ArrowRightOutlined style={{ fontSize: 18 }} />
          </ArrowButton>

          <CarouselScroll ref={scrollRef}>
            {loading ? (
              <CarouselCardSlot
                className="bike-card-wrapper"
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <Typography color="text.secondary">Loading...</Typography>
              </CarouselCardSlot>
            ) : allFeaturedBikes.length === 0 ? (
              <CarouselCardSlot
                className="bike-card-wrapper"
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <Typography color="text.secondary">
                  No featured bikes at the moment. Check back later or browse
                  the marketplace.
                </Typography>
              </CarouselCardSlot>
            ) : (
              allFeaturedBikes.map((bike) => (
                <CarouselCardSlot
                  key={`post-${bike.id}`}
                  className="bike-card-wrapper"
                >
                  <BikeCard bike={bike} />
                </CarouselCardSlot>
              ))
            )}
          </CarouselScroll>
        </CarouselWrapper>
      </FeaturedBikesContainer>
    </FeaturedBikesSection>
  );
}

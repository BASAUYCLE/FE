import { useRef, useMemo } from "react";
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
import bikeTarmac from "../../assets/bike-tarmac-sl7.png";
import santaCruzNomadCC from "../../assets/SantaCruzNomaCC.png";
import canyonGrizlCFSL from "../../assets/CanyonGrizlCFSL.jpg";
import specializedTurboLevo from "../../assets/SpecializedTurboLevo.png";
import { usePostings } from "../../contexts/PostingContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
// Add image to src/assets/bike-tarmac-sl7-new.png then enable the 2 lines below and set image to bikeTarmacSL7New
// import bikeTarmacSL7New from "../../assets/bike-tarmac-sl7-new.png";

/** Convert a posting to bike shape for BikeCard */
function postingToBike(p) {
  return {
    id: p.id,
    name: p.bikeName || "Untitled",
    price: p.priceDisplay || (p.price ? `$${p.price}` : "$0"),
    category: p.category || "BIKE",
    image: p.imageUrl || bikeTarmac,
    badge: p.status === POSTING_STATUS.ACTIVE ? "VERIFIED" : "PENDING",
    specs: {},
    sellerId: p.sellerId ?? null,
  };
}

const featuredBikes = [
  {
    id: 1,
    name: "Specialized Tarmac SL7",
    price: "$4,250",
    category: "ROAD / CARBON",
    image: bikeTarmac,
    badge: "NEW ARRIVAL",
    specs: {
      weight: "7.2kg",
      groupset: "SRAM Force",
    },
  },
  {
    id: 2,
    name: "Santa Cruz Nomad CC",
    price: "$5,800",
    category: "MTB / FULL SUSPENSION",
    image: santaCruzNomadCC,
    badge: "INSPECTED",
    specs: {
      weight: "13.5kg",
      groupset: "FOX Factory",
    },
  },
  {
    id: 3,
    name: "Canyon Grizl CF SL",
    price: "$2,900",
    category: "GRAVEL / ADVENTURE",
    image: canyonGrizlCFSL,
    specs: {
      weight: "9.8kg",
      groupset: "Shimano GRX",
    },
  },
  {
    id: 4,
    name: "Specialized Turbo Levo",
    price: "$8,100",
    category: "E-MTB / ELECTRIC",
    image: specializedTurboLevo,
    badge: "TOP RATED",
    specs: {
      weight: "22.5kg",
      groupset: "Brose 2.2",
      motorPower: "700Wh",
    },
  },
];

const FeaturedBikesSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  backgroundColor: "#f9fafa",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(7.5, 0),
  },
}));

const FeaturedBikesContainer = styled(Container)(({ theme }) => ({
  maxWidth: 1160,
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
  minHeight: 560,
  scrollSnapAlign: "start",
  "& .ant-card": {
    height: "100%",
    minHeight: 560,
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
  const { postings } = usePostings();

  const allFeaturedBikes = useMemo(() => {
    const fromPostings = postings
      .filter(
        (p) =>
          p.status === POSTING_STATUS.ACTIVE ||
          p.status === POSTING_STATUS.PENDING_REVIEW,
      )
      .map(postingToBike);
    return [...fromPostings, ...featuredBikes];
  }, [postings]);

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
            {allFeaturedBikes.map((bike) => (
              <CarouselCardSlot key={bike.id} className="bike-card-wrapper">
                <BikeCard bike={bike} />
              </CarouselCardSlot>
            ))}
          </CarouselScroll>
        </CarouselWrapper>
      </FeaturedBikesContainer>
    </FeaturedBikesSection>
  );
}

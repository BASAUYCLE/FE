import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, Slider } from "@mui/material";
import { Select } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Bike, DollarSign } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import BikeCard from "../../components/card";
import {
  marketplaceBikes,
  TOTAL_MARKETPLACE_COUNT,
} from "../../data/marketplaceBikes";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import defaultBikeImage from "../../assets/bike-tarmac-sl7.png";
import "./index.css";

import { BIKE_TYPE_OPTIONS } from "../../constants/bikeTypes";

const BIKE_TYPE_SELECT_OPTIONS = [
  { value: "all", label: "All Bikes" },
  ...BIKE_TYPE_OPTIONS,
];

/** Convert a posting (from Post form) to bike shape for BikeCard */
function postingToBike(p) {
  return {
    id: p.id,
    name: p.bikeName || "Untitled",
    price: p.priceDisplay || (p.price ? `$${p.price}` : "$0"),
    category: p.category || "BIKE",
    biketype: p.biketype ?? null,
    image: p.imageUrl || defaultBikeImage,
    badge: p.status === POSTING_STATUS.AVAILABLE ? "VERIFIED" : "PENDING",
    specs: {},
    sellerId: p.sellerId ?? null,
  };
}

const VALID_BIKE_TYPE_VALUES = new Set([
  "all",
  ...BIKE_TYPE_OPTIONS.map((o) => o.value),
]);

const PRICE_MIN = 100;
const PRICE_MAX = 10000;
const PRICE_RANGE_DEFAULT = [PRICE_MIN, PRICE_MAX];

export default function Marketplace() {
  const { user } = useAuth();
  const { postings, publicPostings, loadPublicPostings, loadPostingsBySeller } = usePostings();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadPublicPostings();
  }, [loadPublicPostings]);

  useEffect(() => {
    const sellerId = user?.id ?? user?.userId ?? user?.user_id;
    if (sellerId) loadPostingsBySeller(sellerId);
  }, [user?.id, user?.userId, user?.user_id, loadPostingsBySeller]);
  const typeFromUrl = searchParams.get("type");
  const [bikeType, setBikeType] = useState("all");
  const [priceRange, setPriceRange] = useState(PRICE_RANGE_DEFAULT);
  const [minPriceStr, setMinPriceStr] = useState("");
  const [maxPriceStr, setMaxPriceStr] = useState("");
  const [minPriceFocused, setMinPriceFocused] = useState(false);
  const [maxPriceFocused, setMaxPriceFocused] = useState(false);

  useEffect(() => {
    if (typeFromUrl && VALID_BIKE_TYPE_VALUES.has(typeFromUrl)) {
      setBikeType(typeFromUrl);
    }
  }, [typeFromUrl]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  // Luồng nghiệp vụ: chỉ hiển thị bài đã duyệt (ADMIN_APPROVED) hoặc đang hiển thị (AVAILABLE). Gộp publicPostings (API) + postings (tin của seller) rồi bỏ trùng theo id.
  const allBikes = useMemo(() => {
    const allowed = (p) =>
      p.status === POSTING_STATUS.AVAILABLE ||
      p.status === POSTING_STATUS.ADMIN_APPROVED;
    const byId = new Map();
    [...publicPostings, ...postings].filter(allowed).forEach((p) => {
      if (p?.id != null) byId.set(p.id, p);
    });
    const fromPostings = [...byId.values()].map(postingToBike);
    return [...fromPostings, ...marketplaceBikes];
  }, [postings, publicPostings]);

  const displayedBikes =
    bikeType === "all"
      ? allBikes
      : allBikes.filter((b) => b.biketype === bikeType);

  const displayedCount = displayedBikes.length;

  const clearFilters = () => {
    setBikeType("all");
    setPriceRange(PRICE_RANGE_DEFAULT);
    setMinPriceStr("");
    setMaxPriceStr("");
    setMinPriceFocused(false);
    setMaxPriceFocused(false);
  };

  const handleMinPriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMinPriceStr(raw);
    if (raw === "") {
      setPriceRange((prev) => [PRICE_MIN, prev[1]]);
      return;
    }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num)) {
      setPriceRange((prev) => [Math.min(num, prev[1]), prev[1]]);
    }
  };

  const handleMaxPriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setMaxPriceStr(raw);
    if (raw === "") {
      setPriceRange((prev) => [prev[0], PRICE_MAX]);
      return;
    }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num)) {
      setPriceRange((prev) => [prev[0], Math.max(num, prev[0])]);
    }
  };

  const onMinFocus = () => {
    setMinPriceFocused(true);
    setMinPriceStr(String(priceRange[0]));
  };

  const onMaxFocus = () => {
    setMaxPriceFocused(true);
    setMaxPriceStr(String(priceRange[1]));
  };

  const commitMinPrice = () => {
    setMinPriceFocused(false);
    const num = minPriceStr === "" ? PRICE_MIN : parseInt(minPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? PRICE_MIN
      : Math.max(PRICE_MIN, Math.min(num, PRICE_MAX, priceRange[1]));
    setPriceRange((prev) => [clamped, prev[1]]);
    setMinPriceStr("");
  };

  const commitMaxPrice = () => {
    setMaxPriceFocused(false);
    const num = maxPriceStr === "" ? PRICE_MAX : parseInt(maxPriceStr, 10);
    const clamped = Number.isNaN(num)
      ? PRICE_MAX
      : Math.min(PRICE_MAX, Math.max(num, PRICE_MIN, priceRange[0]));
    setPriceRange((prev) => [prev[0], clamped]);
    setMaxPriceStr("");
  };

  return (
    <Box className="marketplace-page">
      <Header />
      <Box className="marketplace-layout">
        {/* Sidebar Filters */}
        <aside className="marketplace-sidebar">
          <Box className="marketplace-filters-header">
            <Typography className="marketplace-filters-title">
              Filters
            </Typography>
            <Button
              variant="text"
              className="marketplace-clear-btn"
              onClick={clearFilters}
              sx={{
                color: "#00ccad",
                "&:hover": { color: "#00ccad", backgroundColor: "rgba(0, 204, 173, 0.08)" },
              }}
            >
              Clear All
            </Button>
          </Box>

          <Box className="marketplace-filter-section">
            <Typography className="marketplace-filter-label">
              <Bike size={14} className="marketplace-filter-label-icon" />
              Bike Type
            </Typography>
            <Select
              placeholder="Select Bike Type"
              size="large"
              className="marketplace-bike-type-select"
              value={bikeType}
              onChange={setBikeType}
              options={BIKE_TYPE_SELECT_OPTIONS}
              allowClear={false}
            />
          </Box>

          <Box className="marketplace-filter-section">
            <Typography className="marketplace-filter-label">
              <DollarSign size={14} className="marketplace-filter-label-icon" />
              Price Range
            </Typography>
            <Box className="marketplace-price-inputs">
              <Box className="marketplace-price-input-wrap">
                <span className="marketplace-price-prefix" aria-hidden="true">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minPriceFocused ? minPriceStr : String(priceRange[0])}
                  onChange={handleMinPriceChange}
                  onFocus={onMinFocus}
                  onBlur={commitMinPrice}
                  placeholder={String(PRICE_MIN)}
                  className="marketplace-price-input marketplace-price-input-min"
                />
              </Box>
              <Box className="marketplace-price-input-wrap">
                <span className="marketplace-price-prefix" aria-hidden="true">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceFocused ? maxPriceStr : String(priceRange[1])}
                  onChange={handleMaxPriceChange}
                  onFocus={onMaxFocus}
                  onBlur={commitMaxPrice}
                  placeholder={String(PRICE_MAX)}
                  className="marketplace-price-input marketplace-price-input-max"
                />
              </Box>
            </Box>
            <Slider
              value={priceRange}
              onChange={(_, v) => setPriceRange(v)}
              valueLabelDisplay="auto"
              min={PRICE_MIN}
              max={PRICE_MAX}
              sx={{ color: "#00ccad", mt: 1 }}
            />
          </Box>
        </aside>

        {/* Main Content */}
        <main className="marketplace-main">
          <Box className="marketplace-results-header">
            <Typography className="marketplace-results-title">
              Search Results ({displayedCount} bikes)
            </Typography>
            <Box className="marketplace-results-actions">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="marketplace-sort-select"
              >
                <option value="newest">Newest Listings</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <Box className="marketplace-view-toggle">
                <button
                  type="button"
                  className={`marketplace-view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <AppstoreOutlined style={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className={`marketplace-view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <UnorderedListOutlined style={{ fontSize: 18 }} />
                </button>
              </Box>
            </Box>
          </Box>

          <Box
            className={`marketplace-grid ${viewMode === "list" ? "list" : ""}`}
          >
            {displayedBikes.map((bike) => (
              <BikeCard key={bike.id} bike={bike} />
            ))}
          </Box>

          <Box className="marketplace-load-more">
            <Button
              component={Link}
              to="/marketplace"
              className="marketplace-show-more-btn"
              sx={{
                backgroundColor: "#00ccad",
                color: "#0f172a",
                fontWeight: 700,
                padding: "14px 48px",
                borderRadius: 12,
                "&:hover": { backgroundColor: "#00b89a" },
              }}
            >
              SHOW MORE RESULTS
            </Button>
            <Typography className="marketplace-result-count">
              Showing {displayedCount} bikes
            </Typography>
          </Box>
        </main>
      </Box>

      <Footer
        marketplaceLinks={[
          { label: "Browse All Bikes", href: "/marketplace" },
          { label: "Road Bikes", href: "/marketplace?type=Road+Bike" },
          { label: "Mountain Bikes", href: "/marketplace?type=Mountain+Bike" },
          { label: "E-Bikes", href: "/marketplace?type=E-Bike" },
          { label: "Gravel Bikes", href: "/marketplace?type=Gravel+Bike" },
        ]}
        servicesLinks={[
          { label: "How it Works", href: "#" },
          { label: "Verification Process", href: "#" },
          { label: "Safety Center", href: "#" },
          { label: "Success Stories", href: "#" },
          { label: "Contact Support", href: "#" },
        ]}
      />
    </Box>
  );
}

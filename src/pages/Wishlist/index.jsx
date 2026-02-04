import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Slider,
  InputBase,
  IconButton,
} from "@mui/material";
import {
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import WishlistCard from "../../components/wishlist";
import { useWishlist } from "../../contexts/WishlistContext";
import "./index.css";

const CATEGORIES = [
  { id: "road", label: "Road Bikes", count: 8 },
  { id: "mtb", label: "MTB / Trail", count: 3 },
  { id: "gravel", label: "Gravel", count: 1 },
  { id: "electric", label: "Electric", count: 0 },
];

function valuetext(value) {
  return `$${value}`;
}

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [condition, setCondition] = useState("used");
  const [priceRange, setPriceRange] = useState([2400, 10500]);
  const [viewMode, setViewMode] = useState("grid");

  const displayItems = useMemo(() => {
    let items = [...wishlist];
    if (selectedCategory) {
      items = items.filter((b) => b.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.brand?.toLowerCase().includes(q),
      );
    }
    return items;
  }, [wishlist, selectedCategory, search]);

  const handleResetFilters = () => {
    setSelectedCategory(null);
    setCondition("used");
    setPriceRange([500, 15000]);
    setSearch("");
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box className="wishlist-page">
        {/* Search bar - custom for wishlist */}
        <Box className="wishlist-search-bar">
          <Box className="wishlist-search-input">
            <SearchOutlined style={{ fontSize: 18, color: "#9ca3af" }} />
            <InputBase
              placeholder="Search wishlist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: 14, ml: 1 }}
            />
          </Box>
        </Box>

        <Box className="wishlist-layout">
          {/* Sidebar */}
          <aside className="wishlist-sidebar">
            <Typography className="wishlist-sidebar-title">
              CATEGORIES
            </Typography>
            <Box className="wishlist-sidebar-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`wishlist-sidebar-item ${
                    selectedCategory === cat.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id,
                    )
                  }
                >
                  <span>{cat.label}</span>
                  <span className="wishlist-sidebar-count">{cat.count}</span>
                </button>
              ))}
            </Box>

            <Typography className="wishlist-sidebar-title" sx={{ mt: 3 }}>
              PRICE BUDGET
            </Typography>
            <Box sx={{ px: 1, mt: 1 }}>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v)}
                valueLabelDisplay="auto"
                valueLabelFormat={valuetext}
                min={500}
                max={15000}
                step={100}
                sx={{
                  color: "#00ccad",
                  "& .MuiSlider-valueLabel": {
                    backgroundColor: "#00ccad",
                  },
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#6b7280",
                  mt: 0.5,
                }}
              >
                <span>${priceRange[0].toLocaleString()}</span>
                <span>${priceRange[1].toLocaleString()}</span>
              </Box>
              <Typography variant="caption" color="#9ca3af" sx={{ mt: 0.5 }}>
                $500 – $15,000+
              </Typography>
            </Box>

            <Typography className="wishlist-sidebar-title" sx={{ mt: 3 }}>
              CONDITION
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 1, flexWrap: "wrap" }}>
              {["new", "used", "certified"].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`wishlist-condition-btn ${
                    condition === c ? "active" : ""
                  }`}
                  onClick={() => setCondition(c)}
                >
                  {c === "certified"
                    ? "Certified Pre-owned"
                    : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </Box>

            <Button
              variant="outlined"
              className="wishlist-reset-btn"
              onClick={handleResetFilters}
            >
              Reset All Filters
            </Button>
          </aside>

          {/* Main content */}
          <Box className="wishlist-main">
            <Box className="wishlist-header">
              <Box>
                <Typography className="wishlist-title">
                  YOUR WISHLIST
                </Typography>
                <Typography className="wishlist-subtitle">
                  {displayItems.length} high-performance machines saved for your
                  next ride.
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setViewMode("grid")}
                  sx={{ color: viewMode === "grid" ? "#00ccad" : "#9ca3af" }}
                >
                  <AppstoreOutlined />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setViewMode("list")}
                  sx={{ color: viewMode === "list" ? "#00ccad" : "#9ca3af" }}
                >
                  <UnorderedListOutlined />
                </IconButton>
              </Box>
            </Box>

            <Box
              className={`wishlist-grid ${viewMode === "list" ? "list-view" : ""}`}
            >
              {displayItems.map((bike) => (
                <WishlistCard
                  key={bike.id}
                  bike={bike}
                  onRemove={handleRemove}
                />
              ))}
              {/* Add more card */}
              <Link to="/marketplace" className="wishlist-add-card">
                <PlusOutlined style={{ fontSize: 40, color: "#9ca3af" }} />
                <Typography className="wishlist-add-title">
                  SAVE MORE GEAR
                </Typography>
                <Typography className="wishlist-add-subtitle">
                  Keep track of your dream builds
                </Typography>
                <Button variant="outlined" className="wishlist-explore-btn">
                  EXPLORE MARKETPLACE
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
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

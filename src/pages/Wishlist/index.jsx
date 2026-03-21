import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { SimpleProductCard } from "../../components/featuredbikes";
import MarketplaceFilterBar from "../../components/filters/MarketplaceFilterBar";
import { useWishlist } from "../../contexts/WishlistContext";
import postService from "../../services/postService";
import "./index.css";

// Fallback danh sách size khung – giống trang Post
const DEFAULT_SIZE_OPTIONS = [
  "XS (42 - 47) / 147 - 155 cm",
  "S (48 - 52) / 155 - 165 cm",
  "M (53 - 55) / 165 - 175 cm",
  "L (56 - 58) / 175 - 183 cm",
  "XL (59 - 60) / 183 - 191 cm",
  "XXL (61 - 63) / 191 - 198 cm",
];

// Fallback danh sách năm sản xuất – 15 năm gần nhất giống trang Post
const DEFAULT_MODEL_YEARS = Array.from({ length: 15 }, (_, i) =>
  String(2025 - i),
);

const PRICE_MIN = 0;
const PRICE_MAX = 50000000;

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const [searchName, setSearchName] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frameSizeFilter, setFrameSizeFilter] = useState("all");
  const [modelYearFilter, setModelYearFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [brandOptions, setBrandOptions] = useState([
    { value: "all", label: "All Brands" },
  ]);
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "all", label: "All Categories" },
  ]);
  const [frameSizeOptions, setFrameSizeOptions] = useState([
    { value: "all", label: "All Sizes" },
    ...DEFAULT_SIZE_OPTIONS.map((s) => ({ value: s, label: s })),
  ]);
  const [modelYearOptions, setModelYearOptions] = useState([
    { value: "all", label: "All Years" },
    ...DEFAULT_MODEL_YEARS.map((y) => ({ value: y, label: y })),
  ]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  // Load đầy đủ Brand/Category/FrameSize/ModelYear giống Marketplace/Post
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [brandsRes, categoriesRes, metaRes] = await Promise.all([
          postService.getBrands(),
          postService.getCategories(),
          postService.getPostFormMetadata().catch((err) => {
            if (err?.status !== 404) throw err;
            return null;
          }),
        ]);
        if (cancelled) return;

        const brandsRaw = brandsRes?.data ?? brandsRes?.result ?? brandsRes;
        const categoriesRaw =
          categoriesRes?.data ?? categoriesRes?.result ?? categoriesRes;

        const brandList = Array.isArray(brandsRaw)
          ? brandsRaw
          : Array.isArray(brandsRaw?.result)
            ? brandsRaw.result
            : [];
        const categoryList = Array.isArray(categoriesRaw)
          ? categoriesRaw
          : Array.isArray(categoriesRaw?.result)
            ? categoriesRaw.result
            : [];
        const meta = metaRes?.data ?? metaRes?.result ?? metaRes;

        setBrandOptions([
          { value: "all", label: "All Brands" },
          ...brandList.map((b) => {
            const label = b.brandName ?? b.name ?? "";
            return { value: label, label };
          }),
        ]);
        setCategoryOptions([
          { value: "all", label: "All Categories" },
          ...categoryList.map((c) => {
            const label = c.categoryName ?? c.name ?? "";
            return { value: label, label };
          }),
        ]);

        if (meta && typeof meta === "object") {
          if (Array.isArray(meta.frameSizes) && meta.frameSizes.length > 0) {
            const sizeOpts = [
              { value: "all", label: "All Sizes" },
              ...meta.frameSizes.map((s) => {
                if (typeof s === "string") return { value: s, label: s };
                const label = s.label ?? s.name ?? s.value ?? "";
                const value = s.value ?? label;
                return { value: String(value), label: String(label) };
              }),
            ];
            setFrameSizeOptions(sizeOpts);
          }
          if (Array.isArray(meta.modelYears) && meta.modelYears.length > 0) {
            const yearOpts = [
              { value: "all", label: "All Years" },
              ...meta.modelYears.map((y) => {
                const v =
                  typeof y === "object" ? (y.value ?? y.year ?? y.label) : y;
                const str = String(v);
                return { value: str, label: str };
              }),
            ];
            setModelYearOptions(yearOpts);
          }
        }
      } catch (err) {
        console.warn("Wishlist: failed to load filter metadata", err?.message);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getRawPrice = (bike) => {
    if (typeof bike.rawPrice === "number") return bike.rawPrice;
    if (typeof bike.price === "number") return bike.price;
    const str = String(bike.price ?? "").replace(/[^\d]/g, "");
    return Number(str) || 0;
  };

  const displayItems = useMemo(() => {
    const filtered = wishlist.filter((b) => {
      // Search by name
      if (searchName.trim()) {
        const q = searchName.trim().toLowerCase();
        const name = (b.name ?? "").toString().toLowerCase();
        if (!name.includes(q)) return false;
      }

      // Price range (VND)
      const price = getRawPrice(b);
      if (!Number.isNaN(price)) {
        if (price < priceRange[0] || price > priceRange[1]) return false;
      }

      const brandText = (b.brand ?? b.specs?.brand ?? b.category ?? "")
        .toString()
        .toLowerCase();
      const categoryText = (b.category ?? "").toString().toLowerCase();
      const sizeText = (
        b.frameSize ??
        b.specs?.frameSize ??
        b.specs?.size ??
        ""
      )
        .toString()
        .toLowerCase();
      const yearText = (b.modelYear ?? b.year ?? b.specs?.modelYear ?? "")
        .toString()
        .trim();

      if (
        brandFilter !== "all" &&
        brandText !== String(brandFilter).toLowerCase()
      )
        return false;
      if (
        categoryFilter !== "all" &&
        categoryText !== String(categoryFilter).toLowerCase()
      )
        return false;
      if (
        frameSizeFilter !== "all" &&
        sizeText !== String(frameSizeFilter).toLowerCase()
      )
        return false;
      if (modelYearFilter !== "all" && yearText !== String(modelYearFilter))
        return false;

      return true;
    });

    const sorted = [...filtered];
    if (sortBy === "price-low") {
      sorted.sort((a, b) => getRawPrice(a) - getRawPrice(b));
    } else if (sortBy === "price-high") {
      sorted.sort((a, b) => getRawPrice(b) - getRawPrice(a));
    }
    return sorted;
  }, [
    wishlist,
    searchName,
    priceRange,
    brandFilter,
    categoryFilter,
    frameSizeFilter,
    modelYearFilter,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchName("");
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setBrandFilter("all");
    setCategoryFilter("all");
    setFrameSizeFilter("all");
    setModelYearFilter("all");
  };

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box className="wishlist-page">
        <Box className="wishlist-layout">
          <Box className="wishlist-main">
            <MarketplaceFilterBar
              searchName={searchName}
              onSearchNameChange={setSearchName}
              brandFilter={brandFilter}
              onBrandFilterChange={setBrandFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              frameSizeFilter={frameSizeFilter}
              onFrameSizeFilterChange={setFrameSizeFilter}
              modelYearFilter={modelYearFilter}
              onModelYearFilterChange={setModelYearFilter}
              priceRange={priceRange}
              onPriceRangeChange={(updater) =>
                setPriceRange((prev) =>
                  typeof updater === "function" ? updater(prev) : updater,
                )
              }
              brandOptions={brandOptions}
              categoryOptions={categoryOptions}
              frameSizeOptions={frameSizeOptions}
              modelYearOptions={modelYearOptions}
              onClearFilters={handleResetFilters}
              priceMin={PRICE_MIN}
              priceMax={PRICE_MAX}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

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
            </Box>

            <Box
              className={`wishlist-grid ${viewMode === "list" ? "list" : ""} ${
                displayItems.length === 0 ? "wishlist-grid-empty" : ""
              }`}
            >
              {displayItems.map((bike, idx) => (
                <SimpleProductCard
                  key={bike?.id ?? bike?.postId ?? `wishlist-item-${idx}`}
                  bike={{ ...bike, id: bike?.id ?? bike?.postId }}
                  variant={viewMode === "list" ? "list" : "grid"}
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

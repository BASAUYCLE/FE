import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { Select } from "antd";
import { AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import BikeCard from "../../components/card";
import BikeFilterSidebar from "../../components/filters/BikeFilterSidebar";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import postService from "../../services/postService";
import { formatCurrency } from "../../utils/formatCurrency";
import defaultBikeImage from "../../assets/bike-tarmac-sl7.png";
import "./index.css";

// Bỏ filter theo loại xe (Bike Type) – chỉ giữ filter theo Brand/Category/Frame/Year/Price

/** Convert a posting (from API or Post form) to bike shape for BikeCard */
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
  const status = p.status ?? p.postStatus;
  const badge =
    status === POSTING_STATUS.AVAILABLE || status === "AVAILABLE"
      ? "VERIFIED"
      : status === "CERTIFIED" || status === "ADMIN_APPROVED"
        ? "CERTIFIED"
        : status === POSTING_STATUS.PENDING_REVIEW ||
            status === "PENDING_REVIEW"
          ? "PENDING"
          : "NEW";
  const postId = p.postId ?? p.id;
  const brand =
    p.brandName ??
    p.brand ??
    p.brand_name ??
    p.brandLabel ??
    p.brand?.brandName ??
    null;
  const category =
    p.category ??
    p.categoryName ??
    p.bicycleType ??
    p.categoryLabel ??
    null;
  const frameSize = p.frameSize ?? p.size ?? null;
  const modelYear = p.modelYear ?? p.model_year ?? null;
  return {
    id: postId,
    postId,
    name: p.bikeName ?? p.title ?? p.bicycleName ?? "Untitled",
    price: priceDisplay,
    rawPrice: typeof priceNum === "number" ? priceNum : 0,
    category: category ?? "BIKE",
    biketype: p.biketype ?? p.bicycleType ?? p.categoryName ?? null,
    image: imageUrl ?? defaultBikeImage,
    badge,
    specs: {
      ...(p.specs ?? {}),
      brand,
      category,
      frameSize,
      modelYear,
    },
    brand,
    frameSize,
    modelYear,
    sellerId: p.sellerId ?? p.seller_id ?? null,
  };
}

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
const PRICE_RANGE_DEFAULT = [PRICE_MIN, PRICE_MAX];
const PAGE_SIZE = 9;

export default function Marketplace() {
  const { user } = useAuth();
  const { postings, publicPostings, loadPublicPostings, loadPostingsBySeller } =
    usePostings();
  const [searchParams] = useSearchParams();
  const [apiPostings, setApiPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicPostings();
  }, [loadPublicPostings]);

  useEffect(() => {
    const sellerId = user?.id ?? user?.userId ?? user?.user_id;
    if (sellerId) loadPostingsBySeller(sellerId);
  }, [user?.id, user?.userId, user?.user_id, loadPostingsBySeller]);

  // Load bài đăng từ API, không dùng marketplaceBikes mã giả
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    postService
      .getPosts({})
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

  // Giữ lại param ?type cho tương thích nhưng không còn dùng filter theo loại
  const typeFromUrl = searchParams.get("type");
  const [priceRange, setPriceRange] = useState(PRICE_RANGE_DEFAULT);
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frameSizeFilter, setFrameSizeFilter] = useState("all");
  const [modelYearFilter, setModelYearFilter] = useState("all");
  const [searchName, setSearchName] = useState("");
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

  useEffect(() => {
    // Hiện tại không dùng typeFromUrl để filter, nhưng giữ effect cho sau này nếu cần
  }, [typeFromUrl]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);

  // Chỉ hiển thị bài AVAILABLE / ADMIN_APPROVED; gộp API + publicPostings + postings, bỏ trùng theo id. Không dùng marketplaceBikes.
  const allBikes = useMemo(() => {
    const statusOk = (p) => {
      const s = p.status ?? p.postStatus;
      if (
        s === POSTING_STATUS.DRAFTED ||
        s === "DRAFTED" ||
        s === POSTING_STATUS.PENDING ||
        s === "PENDING"
      )
        return false;
      return (
        s === POSTING_STATUS.AVAILABLE ||
        s === POSTING_STATUS.ADMIN_APPROVED ||
        s === "AVAILABLE" ||
        s === "ADMIN_APPROVED"
      );
    };
    const byId = new Map();
    [...apiPostings, ...publicPostings, ...postings]
      .filter((p) => (p?.id ?? p?.postId) != null && statusOk(p))
      .forEach((p) => {
        const key = p.id ?? p.postId;
        byId.set(key, p);
      });
    return [...byId.values()].map(postingToBike);
  }, [apiPostings, postings, publicPostings]);

  // Load đầy đủ Brand/Category/FrameSize/ModelYear từ database giống trang Post
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [brandsRes, categoriesRes, metaRes] = await Promise.all([
          postService.getBrands(),
          postService.getCategories(),
          // Metadata form Post: sizes, groupsets, brake types, ... (có thể 404 nếu BE chưa hỗ trợ)
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

        const nextBrandOpts = [
          { value: "all", label: "All Brands" },
          ...brandList.map((b) => {
            const label = b.brandName ?? b.name ?? "";
            return {
              value: label,
              label,
            };
          }),
        ];
        const nextCategoryOpts = [
          { value: "all", label: "All Categories" },
          ...categoryList.map((c) => {
            const label = c.categoryName ?? c.name ?? "";
            return {
              value: label,
              label,
            };
          }),
        ];

        setBrandOptions(nextBrandOpts);
        setCategoryOptions(nextCategoryOpts);

        // Frame Size từ metadata nếu có, fallback DEFAULT_SIZE_OPTIONS
        if (meta && typeof meta === "object") {
          if (Array.isArray(meta.frameSizes) && meta.frameSizes.length > 0) {
            const sizeOpts = [
              { value: "all", label: "All Sizes" },
              ...meta.frameSizes.map((s) => {
                if (typeof s === "string") {
                  return { value: s, label: s };
                }
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
                  typeof y === "object"
                    ? y.value ?? y.year ?? y.label
                    : y;
                const str = String(v);
                return { value: str, label: str };
              }),
            ];
            setModelYearOptions(yearOpts);
          }
        }
      } catch (err) {
        console.warn(
          "Marketplace: failed to load marketplace metadata",
          err?.message,
        );
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayedBikes = useMemo(() => {
    return allBikes.filter((b) => {
      // Search by bike name
      if (searchName.trim()) {
        const q = searchName.trim().toLowerCase();
        const name = (b.name ?? "").toString().toLowerCase();
        if (!name.includes(q)) return false;
      }

      // Price range (VND)
      const price = Number(b.rawPrice ?? 0);
      if (!Number.isNaN(price)) {
        if (price < priceRange[0] || price > priceRange[1]) return false;
      }

      // Brand
      if (brandFilter !== "all") {
        const brand = (b.brand ?? "").toString().toLowerCase();
        if (brand !== String(brandFilter).toLowerCase()) return false;
      }

      // Category
      if (categoryFilter !== "all") {
        const cat = (b.category ?? "").toString().toLowerCase();
        if (cat !== String(categoryFilter).toLowerCase()) return false;
      }

      // Frame size
      if (frameSizeFilter !== "all") {
        const size = (b.frameSize ?? "").toString().toLowerCase();
        if (size !== String(frameSizeFilter).toLowerCase()) return false;
      }

      // Model year
      if (modelYearFilter !== "all") {
        const year = b.modelYear != null ? String(b.modelYear) : "";
        if (year !== String(modelYearFilter)) return false;
      }

      return true;
    });
  }, [
    allBikes,
    priceRange,
    brandFilter,
    categoryFilter,
    frameSizeFilter,
    modelYearFilter,
    searchName,
  ]);

  const displayedCount = displayedBikes.length;
  const totalPages = Math.max(1, Math.ceil(displayedCount / PAGE_SIZE));
  const paginatedBikes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return displayedBikes.slice(start, start + PAGE_SIZE);
  }, [displayedBikes, page]);

  // Reset về trang 1 khi filter thay đổi đáng kể
  useEffect(() => {
    setPage(1);
  }, [brandFilter, categoryFilter, frameSizeFilter, modelYearFilter, priceRange]);

  const clearFilters = () => {
    setPriceRange(PRICE_RANGE_DEFAULT);
    setBrandFilter("all");
    setCategoryFilter("all");
    setFrameSizeFilter("all");
    setModelYearFilter("all");
    setSearchName("");
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
      <Header showSearch={false} />
      <Box className="marketplace-layout">
        {/* Sidebar Filters */}
        <aside className="marketplace-sidebar">
          <BikeFilterSidebar
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
            onClearFilters={clearFilters}
            priceMin={PRICE_MIN}
            priceMax={PRICE_MAX}
          />
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
            {loading ? (
              <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            ) : displayedBikes.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1", py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No bikes match your filters. Try changing bike type or price
                  range, or check back later.
                </Typography>
              </Box>
            ) : (
              paginatedBikes.map((bike, idx) => (
                <BikeCard key={bike?.id ?? bike?.postId ?? `bike-${idx}`} bike={bike} />
              ))
            )}
          </Box>

          {displayedCount > 0 && (
            <Box
              className="marketplace-pagination-wrap"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mt: 3,
                pb: 2,
              }}
            >
              <Typography sx={{ color: "#64748b", fontSize: 14 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, displayedCount)} of {displayedCount}{" "}
                bikes
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  sx={{ minWidth: 36 }}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === totalPages ||
                      n === page ||
                      Math.abs(n - page) <= 1,
                  )
                  .map((n, idx, arr) => (
                    <span
                      key={n}
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      {idx > 0 && arr[idx - 1] !== n - 1 && (
                        <Typography component="span" sx={{ px: 0.5 }}>
                          …
                        </Typography>
                      )}
                      <Button
                        variant={page === n ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPage(n)}
                        sx={{
                          minWidth: 36,
                          ...(page === n && {
                            backgroundColor: "#00ccad",
                            color: "#0f172a",
                            "&:hover": { backgroundColor: "#00b89a" },
                          }),
                        }}
                      >
                        {n}
                      </Button>
                    </span>
                  ))}
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  sx={{ minWidth: 36 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
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

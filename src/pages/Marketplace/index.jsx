import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { Pagination } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { SimpleProductCard } from "../../components/featuredbikes";
import MarketplaceFilterBar from "../../components/filters/MarketplaceFilterBar";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { POSTING_STATUS } from "../../constants/postingStatus";
import postService from "../../services/postService";
import { formatCurrency } from "../../utils/formatCurrency";
import { verificationScorePctFromPostPayload } from "../../utils/inspectionReportNormalize";
import { fetchPublicInspectionScoresByPostId } from "../../utils/inspectionReportFetch";
import defaultBikeImage from "../../assets/bike-tarmac-sl7.png";
import bicyclesWorkshopImage from "../../assets/bicycles_workshop.jpg";
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
    status === POSTING_STATUS.AVAILABLE ||
    status === "AVAILABLE" ||
    status === POSTING_STATUS.VERIFIED ||
    status === "VERIFIED"
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
    p.category ?? p.categoryName ?? p.bicycleType ?? p.categoryLabel ?? null;
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
    verificationScorePct: verificationScorePctFromPostPayload(p),
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
    status,
    postStatus: status,
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
// 5 columns * 4 rows = 20 items per page.
const PAGE_SIZE = 20;

const MARKETPLACE_BROWSE_HASH = "#marketplace-browse";

export default function Marketplace() {
  const { user } = useAuth();
  const { postings, publicPostings, loadPublicPostings, loadPostingsBySeller } =
    usePostings();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [apiPostings, setApiPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  /** % từ GET public inspection list khi DTO tin không có inspection */
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

  /** Header search / trending links append this hash — scroll to filter + grid (below hero). */
  useEffect(() => {
    if (location.hash !== MARKETPLACE_BROWSE_HASH) return;
    const t = window.setTimeout(() => {
      document.getElementById("marketplace-browse")?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.search, location.hash]);

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
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("category") || "all",
  );
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
    const nextCategory = searchParams.get("category") || "all";
    setCategoryFilter((prev) => (prev === nextCategory ? prev : nextCategory));
  }, [searchParams]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

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
                  typeof y === "object" ? (y.value ?? y.year ?? y.label) : y;
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

  // Sort results theo lựa chọn (Newest / Price)
  const sortedBikes = useMemo(() => {
    const list = [...displayedBikes];
    if (sortBy === "price-low") {
      list.sort((a, b) => Number(a.rawPrice ?? 0) - Number(b.rawPrice ?? 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => Number(b.rawPrice ?? 0) - Number(a.rawPrice ?? 0));
    } else {
      // "newest" – giữ nguyên thứ tự (đã là mới nhất từ API)
    }
    return list;
  }, [displayedBikes, sortBy]);

  const displayedCount = sortedBikes.length;
  const totalPages = Math.max(1, Math.ceil(displayedCount / PAGE_SIZE));
  const pageParam = searchParams.get("page");
  const pageFromUrl = parseInt(pageParam || "1", 10);
  const pageRaw =
    Number.isFinite(pageFromUrl) && pageFromUrl >= 1 ? pageFromUrl : 1;
  const page = Math.min(pageRaw, totalPages);

  const paginatedBikes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedBikes.slice(start, start + PAGE_SIZE);
  }, [sortedBikes, page]);

  // Khi kết quả ít lại mà ?page vẫn lớn — chỉnh URL cho khớp (replace để không spam history).
  useEffect(() => {
    if (displayedCount === 0) return;
    if (pageRaw <= totalPages) return;
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (totalPages <= 1) n.delete("page");
        else n.set("page", String(totalPages));
        return n;
      },
      { replace: true },
    );
  }, [displayedCount, pageRaw, totalPages, setSearchParams]);

  const prevFiltersRef = useRef(null);
  // Xóa ?page khi filter / search đổi (giữ trang khi back từ detail nhờ URL).
  useEffect(() => {
    const next = {
      brandFilter,
      categoryFilter,
      frameSizeFilter,
      modelYearFilter,
      priceRange0: priceRange[0],
      priceRange1: priceRange[1],
      searchName,
    };
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = next;
    if (!prev) return;
    const changed =
      prev.brandFilter !== next.brandFilter ||
      prev.categoryFilter !== next.categoryFilter ||
      prev.frameSizeFilter !== next.frameSizeFilter ||
      prev.modelYearFilter !== next.modelYearFilter ||
      prev.priceRange0 !== next.priceRange0 ||
      prev.priceRange1 !== next.priceRange1 ||
      prev.searchName !== next.searchName;
    if (!changed) return;
    setSearchParams(
      (prevParams) => {
        const n = new URLSearchParams(prevParams);
        if (!n.has("page")) return n;
        n.delete("page");
        return n;
      },
      { replace: true },
    );
  }, [
    brandFilter,
    categoryFilter,
    frameSizeFilter,
    modelYearFilter,
    priceRange,
    searchName,
    setSearchParams,
  ]);

  const clearFilters = () => {
    setPriceRange(PRICE_RANGE_DEFAULT);
    setBrandFilter("all");
    setCategoryFilter("all");
    setFrameSizeFilter("all");
    setModelYearFilter("all");
    setSearchName("");
  };

  return (
    <Box className="marketplace-page">
      <Header />
      {/* <MarketplaceHero /> */}
      <Box className="marketplace-hero-banner marketplace-hero-banner--fullbleed">
        <img
          src={bicyclesWorkshopImage}
          alt="Bicycles workshop"
          className="marketplace-hero-banner-image"
        />
        <Box className="marketplace-hero-banner-overlay">
          <Typography
            component="h1"
            className="marketplace-hero-banner-title"
            variant="h3"
          >
            Marketplace
          </Typography>
        </Box>
      </Box>
      <Box className="marketplace-layout">
        <main className="marketplace-main">
          {/* <MarketplaceFilterBar ... /> */}
          <Box
            id="marketplace-browse"
            className="marketplace-browse-anchor"
            component="section"
            aria-label="Marketplace listings"
          >
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
              onClearFilters={clearFilters}
              priceMin={PRICE_MIN}
              priceMax={PRICE_MAX}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </Box>

          {/* <MarketplaceResults ... /> */}
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
                <SimpleProductCard
                  key={bike?.id ?? bike?.postId ?? `bike-${idx}`}
                  bike={bike}
                  variant={viewMode === "list" ? "list" : "grid"}
                />
              ))
            )}
          </Box>

          {/* <MarketplacePagination ... /> */}
          {displayedCount > 0 && (
            <Box className="marketplace-pagination-wrap">
              <Pagination
                className="marketplace-pagination"
                current={page}
                pageSize={PAGE_SIZE}
                total={displayedCount}
                size="small"
                showSizeChanger={false}
                onChange={(nextPage) => {
                  setSearchParams(
                    (prev) => {
                      const n = new URLSearchParams(prev);
                      if (nextPage <= 1) n.delete("page");
                      else n.set("page", String(nextPage));
                      return n;
                    },
                    { replace: false },
                  );
                  requestAnimationFrame(() => {
                    document
                      .getElementById("marketplace-browse")
                      ?.scrollIntoView({ behavior: "auto", block: "start" });
                  });
                }}
              />
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

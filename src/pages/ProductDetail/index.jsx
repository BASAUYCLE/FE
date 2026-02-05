import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  HeartOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ZoomInOutlined,
  DownloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { getProductById } from "../../data/products";
import { useWishlist } from "../../contexts/WishlistContext";
import { useOrders } from "../../contexts/OrderContext";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import defaultBikeImage from "../../assets/bike-tarmac-sl7.png";
import "./index.css";

/** Map a posting from PostingContext to the product shape used by ProductDetail */
function postingToProduct(p) {
  const defaultImg = p.imageUrl || defaultBikeImage;
  const urls = p.imageUrls?.length > 0 ? p.imageUrls : [defaultImg];
  const images =
    urls.length >= 6
      ? urls.slice(0, 6)
      : [...urls, ...Array(6 - urls.length).fill(urls[0] || defaultBikeImage)];
  return {
    id: p.id,
    name: p.bikeName || "Untitled",
    price: p.priceDisplay || (p.price ? `$${Number(p.price)}` : "$0"),
    image: images[0],
    images,
    category: p.category || "BIKE",
    badge:
      p.status === "AVAILABLE" ? "VERIFIED LISTING" : p.status === "ADMIN_APPROVED" ? "PENDING" : "LISTED",
    specs: {
      frame: p.frameMaterial || "—",
      groupset: p.groupset || "—",
      weight: p.frameSize ? `Size ${p.frameSize}` : undefined,
      size: p.frameSize || undefined,
    },
    seller: {
      name: "Seller",
      rating: "—",
      reviews: 0,
      location: "—",
      shippingEst: "—",
    },
    sellerId: p.sellerId ?? null,
    description: p.description && p.description.trim() ? p.description : "Listed on BASAUYCLE.",
  };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getPostingById } = usePostings();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addOrder } = useOrders();
  const isLoggedIn = isAuthenticated?.() ?? !!user;

  // Ưu tiên tin đăng (posting) từ context; id từ URL có thể là số hoặc chuỗi (backend post_id).
  const posting =
    getPostingById(id) ?? (id != null && !isNaN(Number(id)) ? getPostingById(Number(id)) : null);
  let product = posting
    ? postingToProduct(posting)
    : getProductById(Number(id));

  const images =
    product?.images || (product ? Array(6).fill(product.image) : []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const isOwnListing =
    product?.sellerId != null &&
    user &&
    (product.sellerId == user.id ||
      product.sellerId == user.userId ||
      product.sellerId == user.user_id ||
      product.sellerId === user.email);

  if (!product) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafa" }}>
        <Header />
        <Box
          sx={{ maxWidth: 1160, margin: "0 auto", p: 4, textAlign: "center" }}
        >
          <Typography variant="h5" gutterBottom>
            Product not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{
              bgcolor: "#00ccad",
              color: "#0f172a",
              "&:hover": { bgcolor: "#00b89a" },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const handleWishlistClick = () => {
    if (isOwnListing) return;
    if (!isLoggedIn) {
      message.info("Please sign in to use wishlist");
      navigate("/login");
      return;
    }
    if (inWishlist) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  const handleBuyNow = () => {
    addOrder(product);
    navigate("/orders");
  };

  const breadcrumbs = [
    { label: "HOME", href: "/" },
    {
      label: product.category?.split("/")[0]?.trim() || "ROAD BIKES",
      href: "#",
    },
    {
      label: product.name?.toUpperCase().replace(/\s+/g, " ") || "PRODUCT",
      href: null,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafa" }}>
      <Header />

      <Box sx={{ maxWidth: 1160, margin: "0 auto", p: 3 }}>
        <Breadcrumbs sx={{ mb: 3, fontSize: 12 }}>
          {breadcrumbs.map((b, i) =>
            b.href ? (
              <Link key={i} to={b.href} className="product-detail-breadcrumb">
                {b.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary" fontWeight={600}>
                {b.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Main Image & Gallery - 6 detailed bike images */}
          <Box>
            <Box
              className="product-detail-main-image"
              sx={{
                position: "relative",
                aspectRatio: "4/3",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#1a1a1a",
                mb: 2,
              }}
            >
              <img
                src={images[selectedImageIndex] || product.image}
                alt={`${product.name} - image ${selectedImageIndex + 1}`}
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              <IconButton
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                <ZoomInOutlined />
              </IconButton>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {images.slice(0, 6).map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  sx={{
                    width: 72,
                    height: 56,
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      selectedImageIndex === i
                        ? "2px solid #00ccad"
                        : "2px solid #e5e7eb",
                    flexShrink: 0,
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "#00ccad" },
                  }}
                >
                  <img
                    src={img}
                    alt={`Detail ${i + 1}`}
                    referrerPolicy="no-referrer"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Product Summary */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <span className="product-detail-badge">
                {product.badge || "LISTED"}
              </span>
              {!isOwnListing && (
                <Button
                  size="small"
                  onClick={handleWishlistClick}
                  sx={{ minWidth: 0, p: 0.5 }}
                >
                  {inWishlist ? (
                    <HeartFilled style={{ fontSize: 20, color: "#ef4444" }} />
                  ) : (
                    <HeartOutlined style={{ fontSize: 20 }} />
                  )}
                </Button>
              )}
            </Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#1a1a1a"
              gutterBottom
            >
              {product.name}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}
            >
              <Typography variant="h5" fontWeight={700} color="#00ccad">
                {product.price}
              </Typography>
              {product.originalPrice && (
                <Typography
                  variant="body1"
                  color="#9ca3af"
                  sx={{ textDecoration: "line-through" }}
                >
                  {product.originalPrice}
                </Typography>
              )}
            </Box>
            {isOwnListing ? (
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/manage-listings"
                sx={{
                  borderColor: "#00ccad",
                  color: "#00ccad",
                  fontWeight: 700,
                  py: 1.5,
                  mb: 3,
                  "&:hover": {
                    borderColor: "#00b89a",
                    bgcolor: "rgba(0,204,173,0.08)",
                  },
                }}
              >
                Your listing
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handleBuyNow}
                sx={{
                  bgcolor: "#00ccad",
                  color: "#0f172a",
                  fontWeight: 700,
                  py: 1.5,
                  mb: 3,
                  "&:hover": { bgcolor: "#00b89a" },
                }}
              >
                Buy Now
              </Button>
            )}

            {product.seller && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: "#f9fafb",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Avatar sx={{ bgcolor: "#00ccad", width: 48, height: 48 }}>
                  {product.seller.name?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {product.seller.name}
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    {product.seller.rating} ({product.seller.reviews} reviews)
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    Ships from {product.seller.location} (
                    {product.seller.shippingEst} estimated)
                  </Typography>
                </Box>
              </Box>
            )}

            {product.veloHealthScore && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(0,204,173,0.1)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <SafetyCertificateOutlined
                  style={{ fontSize: 24, color: "#00ccad" }}
                />
                <Box>
                  <Typography fontWeight={700} color="#00ccad">
                    VeloHealth Score: {product.veloHealthScore}/100
                  </Typography>
                  <Typography variant="body2" color="#6b7280">
                    Inspected on {product.inspectedDate}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* Lower section: 2 columns */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Left column: Technical Specs + Ownership Journey */}
          <Box>
            {product.specs && (
              <Box className="product-detail-section" sx={{ mb: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <SettingOutlined style={{ color: "#6b7280", fontSize: 20 }} />
                  <Typography variant="h6" fontWeight={700}>
                    Technical Specs
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                  }}
                >
                  {product.specs.frame && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        FRAME MATERIAL
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.frame}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.groupset && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        GROUPSET
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.groupset}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.wheelset && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        WHEELSET
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.wheelset}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.weight && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        WEIGHT
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.weight}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.size && !product.specs.weight && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        SIZE
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.size}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.motorPower && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        MOTOR
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.motorPower}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Ownership Journey */}
            <Box className="product-detail-section">
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <SyncOutlined style={{ color: "#6b7280", fontSize: 20 }} />
                <Typography variant="h6" fontWeight={700}>
                  Ownership History
                </Typography>
              </Box>
              {product.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography fontWeight={600} color="#00ccad">
                    CURRENT: Listed on BASAUYCLE
                  </Typography>
                  <Typography color="#6b7280" variant="body2" sx={{ mt: 0.5 }}>
                    {product.description}
                  </Typography>
                </Box>
              )}
              {product.history?.map((h, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography fontWeight={600} variant="body2">
                    {h.date?.toUpperCase?.() || h.date}: {h.title}
                  </Typography>
                  <Typography color="#6b7280" variant="body2" sx={{ mt: 0.5 }}>
                    {h.detail}
                  </Typography>
                </Box>
              ))}
              {(!product.history || product.history.length === 0) &&
                !product.description && (
                  <Typography color="#6b7280" variant="body2">
                    No history information available.
                  </Typography>
                )}
            </Box>
          </Box>

          {/* Right column: Pro Inspection Report - dark card */}
          {product.inspection && (
            <Box className="product-detail-inspection-card">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SafetyCertificateOutlined
                    style={{ color: "#00ccad", fontSize: 20 }}
                  />
                  <Typography variant="h6" fontWeight={700} color="#fff">
                    Pro Inspection Report
                  </Typography>
                </Box>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  {product.inspection.reportId}
                </Typography>
              </Box>
              <Box sx={{ display: "grid", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Overall Condition
                  </Typography>
                  <Typography fontWeight={600} color="#fff">
                    {product.inspection.condition}
                  </Typography>
                </Box>
                {product.inspection.carbonFrame && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Carbon Frame Integrity
                    </Typography>
                    <Typography fontWeight={600} color="#00ccad">
                      ✔ {product.inspection.carbonFrame}
                    </Typography>
                  </Box>
                )}
                {product.inspection.drivetrainLife && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">
                        Drivetrain Life
                      </Typography>
                      <Typography fontWeight={600} color="#fff">
                        {product.inspection.drivetrainLife}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 6,
                        bgcolor: "rgba(255,255,255,0.2)",
                        borderRadius: 1,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: product.inspection.drivetrainLife?.includes(
                            "15%",
                          )
                            ? "85%"
                            : "75%",
                          height: "100%",
                          bgcolor: "#00ccad",
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>
                )}
                {product.inspection.brakingPower && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="rgba(255,255,255,0.8)">
                      Braking Power
                    </Typography>
                    <Typography fontWeight={600} color="#fff">
                      {product.inspection.brakingPower}
                    </Typography>
                  </Box>
                )}
              </Box>
              {product.inspection.mechanicVerdict && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">
                    Mechanic's Verdict — {product.inspection.mechanic}
                  </Typography>
                  <Typography color="#fff" sx={{ mt: 1, fontStyle: "italic" }}>
                    "{product.inspection.mechanicVerdict}"
                  </Typography>
                </Box>
              )}
              <Button
                variant="outlined"
                startIcon={<DownloadOutlined />}
                sx={{
                  borderColor: "#00ccad",
                  color: "#00ccad",
                  "&:hover": {
                    borderColor: "#00ccad",
                    bgcolor: "rgba(0,204,173,0.1)",
                  },
                }}
              >
                Full 50-Point Checklist (PDF)
              </Button>
            </Box>
          )}
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

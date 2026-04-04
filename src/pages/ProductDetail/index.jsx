import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import InspectorLayout from "../../components/layout/InspectorLayout";
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
import { message, Modal } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import CheckoutModal from "../../components/CheckoutModal";
import { getProductById } from "../../data/products";
import { useWishlist } from "../../contexts/WishlistContext";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import adminPostService from "../../services/adminPostService";
import postService from "../../services/postService";
import disputeService from "../../services/disputeService";
import orderService from "../../services/orderService";
import feedbackService from "../../services/feedbackService";
import { confirmCrud } from "../../utils/confirmCrud";
import { getAvatarSrc, getAvatarInitial } from "../../utils/avatar";
import {
  POSTING_STATUS,
  POSTING_STATUS_LABEL,
} from "../../constants/postingStatus";
import { DISPUTE_STATUS } from "../../constants/disputeStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import defaultBikeImage from "../../assets/bike-tarmac-sl7.png";
import "../inspector/common/shared.css";
import "./index.css";

/** Align with Login page CTA (login.css — .auth-immersive__btn-primary & card outline) */
const LOGIN_PAGE_PRIMARY_BTN_SX = {
  borderRadius: 999,
  minHeight: 52,
  py: 1.75,
  mb: 3,
  textTransform: "uppercase",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "0.06em",
  background: "linear-gradient(135deg, #00ccad 0%, #0d9488 100%)",
  color: "#fff",
  boxShadow: "0 10px 24px rgba(0, 204, 173, 0.35)",
  "&:hover": {
    background: "linear-gradient(135deg, #00c4aa 0%, #0c8770 100%)",
    boxShadow: "0 12px 28px rgba(0, 204, 173, 0.42)",
    filter: "brightness(1.05)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
};

const LOGIN_PAGE_OUTLINE_BTN_SX = {
  borderRadius: 999,
  minHeight: 52,
  py: 1.75,
  mb: 3,
  textTransform: "uppercase",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "0.06em",
  borderWidth: 2,
  borderColor: "#00ccad",
  color: "#0d9488",
  bgcolor: "#ffffff",
  "&:hover": {
    borderColor: "#0d9488",
    bgcolor: "rgba(0, 204, 173, 0.1)",
    color: "#0f766e",
  },
};

/** Map API GET /posts/:id response to posting shape (full images + content so admin sees same as member) */
function mapApiPostToPosting(row) {
  if (!row || typeof row !== "object") return null;
  const postId = row.postId ?? row.post_id ?? row.id;
  if (postId == null) return null;
  const images =
    row?.images ??
    row?.bicycleImages ??
    row?.imageList ??
    row?.postImages ??
    [];
  const thumb = images.find((i) => i?.isThumbnail);
  const imageUrl =
    thumb?.imageUrl ??
    thumb?.image_url ??
    thumb?.url ??
    images[0]?.imageUrl ??
    images[0]?.image_url ??
    images[0]?.url ??
    null;
  const imageUrls = images
    .map((i) => i?.imageUrl ?? i?.image_url ?? i?.url)
    .filter(Boolean);
  const price = row.price;
  const status =
    row.postStatus ?? row.post_status ?? row.status ?? POSTING_STATUS.PENDING;
  return {
    id: postId,
    postId,
    postingId: postId,
    bikeName: row.bicycleName ?? row.bicycle_name ?? row.title ?? "Untitled",
    brand: row.brandName ?? row.brand_name,
    brandId: row.brandId ?? row.brand_id,
    category: row.categoryName ?? row.category_name,
    categoryId: row.categoryId ?? row.category_id,
    frameSize: row.size ?? row.frameSize ?? row.frame_size,
    frameMaterial: row.frameMaterial ?? row.frame_material,
    groupset: row.groupset,
    brakeType: row.brakeType ?? row.brake_type,
    modelYear: row.modelYear ?? row.model_year,
    color: row.bicycleColor ?? row.bicycle_color ?? row.color,
    description:
      row.bicycleDescription ?? row.bicycle_description ?? row.description,
    price,
    priceDisplay:
      typeof price === "number"
        ? formatCurrency(price)
        : (row.priceDisplay ?? String(price ?? "")),
    imageUrl: imageUrl || (imageUrls[0] ?? null),
    imageUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
    status,
    rejectionReason: row.rejectionReason ?? row.rejection_reason ?? null,
    sellerId: row.sellerId ?? row.seller_id,
    sellerName: row.sellerFullName ?? row.seller_name ?? row.sellerName,
    sellerAvatar: getAvatarSrc(
      row,
      row?.sellerAvatar,
      row?.sellerAvatarUrl,
      row?.seller_avatar,
      row?.seller_avatar_url,
      row?.seller?.avatar,
      row?.seller?.avatarUrl,
      row?.seller?.avatar_url,
      row?.seller?.profileImageUrl,
      row?.seller?.imageUrl,
      row?.user?.avatarUrl,
      row?.user?.avatar_url,
    ),
    sellerLocation: row.sellerLocation ?? row.seller_address,
    views: row.views,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };
}

/** Map a posting from PostingContext or API to the product shape used by ProductDetail */
function postingToProduct(p) {
  const defaultImg = p.imageUrl || defaultBikeImage;
  const urls = p.imageUrls?.length > 0 ? p.imageUrls : [defaultImg];
  const images =
    urls.length >= 6
      ? urls.slice(0, 6)
      : [...urls, ...Array(6 - urls.length).fill(urls[0] || defaultBikeImage)];
  const st = String(p.status ?? "").toUpperCase();
  const badge =
    st === "AVAILABLE"
      ? "VERIFIED LISTING"
      : st === "ADMIN_APPROVED"
        ? "PENDING"
        : st === "PROCESSING" || st === "DEPOSITED"
          ? "ORDER IN PROGRESS"
          : "LISTED";
  return {
    id: p.id,
    name: p.bikeName || "Untitled",
    price:
      p.priceDisplay ||
      (p.price != null ? formatCurrency(Number(p.price)) : "$0"),
    image: images[0],
    images,
    category: p.category || "BIKE",
    badge,
    brand: p.brand ?? null,
    specs: {
      brand: p.brand ?? undefined,
      category: p.category ?? undefined,
      frame: p.frameMaterial ?? undefined,
      frameSize: p.frameSize ?? undefined,
      groupset: p.groupset ?? undefined,
      brakeType: p.brakeType ?? undefined,
      modelYear: p.modelYear != null ? String(p.modelYear) : undefined,
      color: p.color ?? undefined,
      size: p.frameSize ?? undefined,
      wheelset: p.wheelset ?? undefined,
      weight: p.weight ?? undefined,
      motorPower: p.motorPower ?? undefined,
    },
    seller: {
      name: p.sellerName ?? "Seller",
      avatarUrl: p.sellerAvatar ?? null,
      rating: "—",
      reviews: 0,
      location: p.sellerLocation ?? "—",
      shippingEst: "—",
    },
    sellerId: p.sellerId ?? null,
    status: p.status,
    postStatus: p.status,
    description:
      p.description && String(p.description).trim()
        ? String(p.description).trim()
        : "Listed on BASAUYCLE.",
  };
}

/** Chip style key — member `product.badge` text or staff `postingStatus` */
function getProductDetailBadgeVariant(badgeLabel, postingStatus, isStaffView) {
  if (isStaffView && postingStatus) {
    const s = String(postingStatus).toUpperCase();
    if (["AVAILABLE", "VERIFIED", "ACTIVE"].includes(s)) return "verified";
    if (["PENDING", "ADMIN_APPROVED", "PENDING_REVIEW"].includes(s)) {
      return "pending";
    }
    if ([POSTING_STATUS.PROCESSING, POSTING_STATUS.DEPOSITED].includes(s)) {
      return "progress";
    }
    if (s === POSTING_STATUS.REJECTED) return "danger";
    if (s === POSTING_STATUS.SOLD) return "sold";
    if (s === POSTING_STATUS.DRAFTED) return "draft";
    return "neutral";
  }
  const b = String(badgeLabel ?? "").toUpperCase();
  if (b.includes("VERIFIED")) return "verified";
  if (b.includes("PENDING")) return "pending";
  if (b.includes("PROGRESS") || b.includes("ORDER")) return "progress";
  return "listed";
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { getPostingById } = usePostings();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isLoggedIn = isAuthenticated?.() ?? !!user;

  const role = (
    user?.role ??
    user?.userRole ??
    user?.user_role ??
    ""
  ).toUpperCase();
  const isStaffView = role === "ADMIN" || role === "INSPECTOR";
  const isAdminView = role === "ADMIN";

  // Luôn gọi API GET /posts/:id để lấy đúng ảnh member upload (không dùng mã giả / mock khi có id)
  const [fetchedPosting, setFetchedPosting] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeDisputeIdForPost, setActiveDisputeIdForPost] = useState(null);
  const [postFeedbacks, setPostFeedbacks] = useState([]);
  const [postFeedbacksLoading, setPostFeedbacksLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const postId = Number(id) || id;
    if (isNaN(Number(id)) || Number(id) < 1) return;
    setLoadingDetail(true);
    setFetchedPosting(null);
    postService
      .getPostById(postId)
      .then((res) => {
        const data = res?.result ?? res?.data ?? res;
        const mapped = mapApiPostToPosting(data);
        setFetchedPosting(mapped ?? null);
      })
      .catch(() => setFetchedPosting(null))
      .finally(() => setLoadingDetail(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId < 1) {
      setPostFeedbacks([]);
      return;
    }
    let cancelled = false;
    setPostFeedbacksLoading(true);
    feedbackService
      .getFeedbacksByPost(postId)
      .then((res) => {
        if (cancelled) return;
        const data = res?.result ?? res?.data ?? res;
        setPostFeedbacks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPostFeedbacks([]);
      })
      .finally(() => {
        if (!cancelled) setPostFeedbacksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !id) {
      setActiveDisputeIdForPost(null);
      return;
    }
    const postId = Number(id);
    if (!Number.isFinite(postId) || postId < 1) {
      setActiveDisputeIdForPost(null);
      return;
    }
    let cancelled = false;
    const terminal = new Set([
      DISPUTE_STATUS.RESOLVED,
      DISPUTE_STATUS.REJECTED,
    ]);
    (async () => {
      try {
        const res = await disputeService.getMyDisputes();
        const list = res?.result ?? res?.data ?? res;
        if (!Array.isArray(list) || list.length === 0) {
          if (!cancelled) setActiveDisputeIdForPost(null);
          return;
        }
        const candidates = list.filter(
          (d) =>
            d?.disputeId != null &&
            d?.orderId != null &&
            d?.status &&
            !terminal.has(String(d.status).toUpperCase()),
        );
        for (const d of candidates) {
          try {
            const oRes = await orderService.getById(d.orderId);
            const o = oRes?.result ?? oRes?.data ?? oRes;
            if (Number(o?.postId ?? o?.post_id) === postId) {
              if (!cancelled) setActiveDisputeIdForPost(d.disputeId);
              return;
            }
          } catch {
            /* skip */
          }
        }
        if (!cancelled) setActiveDisputeIdForPost(null);
      } catch {
        if (!cancelled) setActiveDisputeIdForPost(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, id]);

  // Posting: ưu tiên dữ liệu từ API (ảnh member upload); chỉ dùng state/context khi đang loading; mock chỉ khi API lỗi
  const postingFromState = locationState?.posting;
  const postingFromContext =
    getPostingById(id) ??
    (id != null && !isNaN(Number(id)) ? getPostingById(Number(id)) : null);
  const posting =
    fetchedPosting != null
      ? fetchedPosting
      : postingFromState
        ? {
            id: postingFromState.id ?? postingFromState.postId ?? id,
            postId: postingFromState.postId ?? postingFromState.id ?? id,
            ...postingFromState,
          }
        : postingFromContext;
  const product = posting
    ? postingToProduct(posting)
    : getProductById(Number(id) || 0);

  const images =
    product?.images || (product ? Array(6).fill(product.image) : []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  const isOwnListing =
    product?.sellerId != null &&
    user &&
    (product.sellerId == user.id ||
      product.sellerId == user.userId ||
      product.sellerId == user.user_id ||
      product.sellerId === user.email);

  const postingStatus = posting?.status ?? null;
  const postingStatusUpper = String(postingStatus ?? "").toUpperCase();
  /** BE: PROCESSING = đã có order (giao hàng / tranh chấp); DEPOSITED = đã cọc; SOLD = đã bán — không cho mua thêm */
  const purchaseBlockedByStatus =
    postingStatusUpper === POSTING_STATUS.PROCESSING ||
    postingStatusUpper === POSTING_STATUS.DEPOSITED ||
    postingStatusUpper === POSTING_STATUS.SOLD;
  const canAdminApproveReject =
    isAdminView && postingStatus === POSTING_STATUS.PENDING;
  const sellerAvatarSrc =
    product?.seller?.avatarUrl ||
    (isOwnListing ? getAvatarSrc(user) : "") ||
    undefined;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // ============ Checkout Modal ============
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const checkoutPrice = posting?.price ?? 0;
  const numericCheckoutPrice =
    typeof checkoutPrice === "number"
      ? checkoutPrice
      : Number(String(checkoutPrice).replace(/[^0-9.]/g, "")) || 0;

  const openCheckout = () => {
    if (!isLoggedIn) {
      message.info("Please sign in to purchase");
      navigate("/login");
      return;
    }
    setCheckoutOpen(true);
  };

  const handleAdminApprove = async () => {
    const postId = posting?.id ?? product?.id;
    if (!postId) return;
    setApprovingId(postId);
    try {
      await adminPostService.approvePost(postId);
      message.success("Listing approved. It is now pending inspection.");
      navigate("/admin-listings");
    } catch (err) {
      const msg = err?.data?.message ?? err?.message ?? "Approve failed.";
      message.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  const handleAdminRejectOpen = () => setRejectModalOpen(true);
  const handleAdminRejectClose = () => {
    setRejectModalOpen(false);
    setRejectReason("");
  };
  const handleAdminRejectConfirm = async () => {
    const postId = posting?.id ?? product?.id;
    if (!postId) return;
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning("Please enter a rejection reason.");
      return;
    }
    setRejectingId(postId);
    try {
      await adminPostService.rejectPost(postId, { rejectionReason: reason });
      message.success(
        "Listing rejected. Member will see the reason in Manage Listings.",
      );
      handleAdminRejectClose();
      navigate("/admin-listings");
    } catch (err) {
      const msg = err?.data?.message ?? err?.message ?? "Reject failed.";
      message.error(msg);
    } finally {
      setRejectingId(null);
    }
  };

  if (loadingDetail && id) {
    const loadingBody = (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading listing…
        </Typography>
      </Box>
    );
    if (isStaffView) {
      return isAdminView ? (
        <AdminLayout>
          <div className="admin-dashboard-page">
            <div className="admin-dashboard">{loadingBody}</div>
          </div>
        </AdminLayout>
      ) : (
        <InspectorLayout>
          <div className="inspector-page">
            <div className="inspector-dashboard">{loadingBody}</div>
          </div>
        </InspectorLayout>
      );
    }
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafa" }}>
        <Header />
        <Box
          sx={{ maxWidth: 1320, margin: "0 auto", p: 4, textAlign: "center" }}
        >
          {loadingBody}
        </Box>
      </Box>
    );
  }

  // Bản nháp: chỉ chủ tin, admin hoặc inspector được xem
  const isDraftHidden =
    product &&
    (posting?.status === POSTING_STATUS.DRAFTED ||
      posting?.postStatus === POSTING_STATUS.DRAFTED) &&
    !isOwnListing &&
    !isStaffView;

  if (!product || isDraftHidden) {
    const notFoundBody = (
      <Box sx={{ maxWidth: 1320, margin: "0 auto", p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isDraftHidden ? "This listing is a draft and is not visible." : null}
        </Typography>
        <Button
          variant="contained"
          onClick={() =>
            navigate(
              isStaffView
                ? isAdminView
                  ? "/admin-dashboard"
                  : "/inspector"
                : "/",
            )
          }
          sx={{
            bgcolor: "#00ccad",
            color: "#0f172a",
            "&:hover": { bgcolor: "#00b89a" },
          }}
        >
          {isStaffView
            ? isAdminView
              ? "Back to dashboard"
              : "Back to inspector"
            : "Back to Home"}
        </Button>
      </Box>
    );
    if (isStaffView) {
      return isAdminView ? (
        <AdminLayout>
          <div className="admin-dashboard-page">
            <div className="admin-dashboard">{notFoundBody}</div>
          </div>
        </AdminLayout>
      ) : (
        <InspectorLayout>
          <div className="inspector-page">
            <div className="inspector-dashboard">{notFoundBody}</div>
          </div>
        </InspectorLayout>
      );
    }
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafa" }}>
        <Header />
        {notFoundBody}
      </Box>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const handleWishlistClick = async () => {
    if (isOwnListing) return;
    if (!isLoggedIn) {
      message.info("Please sign in to use wishlist");
      navigate("/login");
      return;
    }
    if (inWishlist) {
      const ok = await confirmCrud({
        title: "Remove from wishlist?",
        content: `Remove "${product.name ?? "this item"}" from your wishlist?`,
        okText: "Remove",
        danger: true,
      });
      if (!ok) return;
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const breadcrumbs = isStaffView
    ? role === "ADMIN"
      ? [
          { label: "HOME", href: "/" },
          { label: "ADMIN", href: "/admin-dashboard" },
          {
            label: "LISTING",
            href: "/admin-listings",
          },
          {
            label:
              product.name?.toUpperCase().replace(/\s+/g, " ") || "PRODUCT",
            href: null,
          },
        ]
      : [
          { label: "HOME", href: "/" },
          { label: "INSPECTOR", href: "/inspector" },
          {
            label: "INSPECTION",
            href: "/inspector/details",
          },
          {
            label:
              product.name?.toUpperCase().replace(/\s+/g, " ") || "PRODUCT",
            href: null,
          },
        ]
    : [
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

  const mainColumn = (
    <>
      {/* <ProductDetailHeader /> */}
      {!isStaffView && <Header />}

      <Box
        sx={{
          maxWidth: { xs: "100%", lg: 1200, xl: 1400 },
          width: "100%",
          margin: "0 auto",
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        {/* <ProductDetailBreadcrumbs /> */}
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
          {/* <ProductGallery /> */}
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
                onClick={() => setImageZoomOpen(true)}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "#fff" },
                }}
                aria-label="View enlarged image"
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

          {/* <ProductSummary /> */}
          {/* Product Summary */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <span
                className={`product-detail-badge product-detail-badge--${getProductDetailBadgeVariant(
                  isStaffView && postingStatus
                    ? (POSTING_STATUS_LABEL[postingStatus] ?? postingStatus)
                    : product.badge || "LISTED",
                  postingStatus,
                  isStaffView,
                )}`}
              >
                {isStaffView && postingStatus
                  ? (POSTING_STATUS_LABEL[postingStatus] ?? postingStatus)
                  : product.badge || "LISTED"}
              </span>
              {!isOwnListing && !isStaffView && (
                <Button
                  size="small"
                  onClick={handleWishlistClick}
                  disabled={purchaseBlockedByStatus && !inWishlist}
                  title={
                    purchaseBlockedByStatus && !inWishlist
                      ? "Cannot add to wishlist while this listing is in transaction"
                      : undefined
                  }
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
                sx={LOGIN_PAGE_OUTLINE_BTN_SX}
              >
                Your listing
              </Button>
            ) : isStaffView ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/admin-listings"
                    sx={{
                      borderColor: "#64748b",
                      color: "#475569",
                      fontWeight: 600,
                      py: 1.5,
                      mb: 1.5,
                      "&:hover": {
                        borderColor: "#475569",
                        bgcolor: "rgba(100,116,139,0.08)",
                      },
                    }}
                  >
                    Back to Admin Listings
                  </Button>
                  {canAdminApproveReject && (
                    <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAdminApprove}
                        disabled={!!approvingId}
                        sx={{
                          bgcolor: "#22c55e",
                          color: "#fff",
                          fontWeight: 600,
                          py: 1.25,
                          "&:hover": { bgcolor: "#16a34a" },
                        }}
                      >
                        {approvingId ? "Approving…" : "Approve"}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        color="error"
                        onClick={handleAdminRejectOpen}
                        disabled={!!rejectingId}
                        sx={{ fontWeight: 600, py: 1.25 }}
                      >
                        {rejectingId ? "Rejecting…" : "Reject"}
                      </Button>
                    </Box>
                  )}
                </Box>
              </>
            ) : purchaseBlockedByStatus ? (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#fff7ed",
                  border: "1px solid #fed7aa",
                }}
              >
                <Typography fontWeight={700} color="#9a3412" sx={{ mb: 0.5 }}>
                  Purchase unavailable right now
                </Typography>
                <Typography variant="body2" color="#7c2d12">
                  This listing currently has an active order or dispute (it is
                  not available for additional purchases until the current order
                  is completed).
                </Typography>
                {activeDisputeIdForPost != null && (
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/my-disputes/${activeDisputeIdForPost}`}
                    fullWidth
                    sx={{
                      mt: 2,
                      borderColor: "#ea580c",
                      color: "#9a3412",
                      fontWeight: 700,
                      py: 1.25,
                      "&:hover": {
                        borderColor: "#c2410c",
                        bgcolor: "rgba(234, 88, 12, 0.06)",
                      },
                    }}
                  >
                    View dispute details
                  </Button>
                )}
              </Box>
            ) : (
              <Button
                variant="contained"
                disableElevation
                fullWidth
                onClick={openCheckout}
                sx={LOGIN_PAGE_PRIMARY_BTN_SX}
              >
                BUY NOW
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
                <Avatar
                  src={sellerAvatarSrc}
                  sx={{
                    bgcolor: isStaffView ? "#64748b" : "#00ccad",
                    width: 48,
                    height: 48,
                  }}
                >
                  {getAvatarInitial({ name: product.seller.name })}
                </Avatar>
                <Box>
                  <Typography variant="body2" color="#6b7280" sx={{ mb: 0.25 }}>
                    {isStaffView ? "Listing owner" : "Seller"}
                  </Typography>
                  {(() => {
                    const sellerId = product.sellerId;
                    if (sellerId) {
                      return (
                        <Typography
                          component={Link}
                          to={`/user/${sellerId}/feedback`}
                          sx={{
                            fontWeight: 600,
                            color: "#0f766e",
                            textDecoration: "none",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {product.seller.name}
                        </Typography>
                      );
                    }
                    return (
                      <Typography fontWeight={600}>
                        {product.seller.name}
                      </Typography>
                    );
                  })()}
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

        {/* <ProductDetailsSection /> */}
        {/* Lower: 1 cột full width nếu không có inspection; 2 cột khi có Pro Inspection */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: product.inspection
                ? "minmax(0, 1.15fr) minmax(0, 1fr)"
                : "1fr",
            },
            gap: 4,
            mb: 4,
          }}
        >
          {/* Cột chính: Technical Specs + Ownership + Reviews */}
          <Box sx={{ minWidth: 0 }}>
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
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {product.specs.brand && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        BRAND
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.brand}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.category && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        CATEGORY
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.category}
                      </Typography>
                    </Box>
                  )}
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
                  {(product.specs.frameSize || product.specs.size) && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        FRAME SIZE
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.frameSize || product.specs.size}
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
                  {product.specs.brakeType && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        BRAKE TYPE
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.brakeType}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.modelYear && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        MODEL YEAR
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.modelYear}
                      </Typography>
                    </Box>
                  )}
                  {product.specs.color && (
                    <Box className="product-detail-spec-card">
                      <Typography variant="body2" color="#6b7280">
                        COLOR
                      </Typography>
                      <Typography fontWeight={600}>
                        {product.specs.color}
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

            {/* Ownership + Reviews: 2 cột trên desktop để tận dụng chiều ngang */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 3,
                alignItems: "start",
              }}
            >
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
                    <Typography
                      color="#6b7280"
                      variant="body2"
                      sx={{ mt: 0.5 }}
                    >
                      {product.description}
                    </Typography>
                  </Box>
                )}
                {product.history?.map((h, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Typography fontWeight={600} variant="body2">
                      {h.date?.toUpperCase?.() || h.date}: {h.title}
                    </Typography>
                    <Typography
                      color="#6b7280"
                      variant="body2"
                      sx={{ mt: 0.5 }}
                    >
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

              <Box className="product-detail-section">
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Reviews for this listing
                </Typography>
                {postFeedbacksLoading ? (
                  <Typography color="#6b7280" variant="body2">
                    Loading reviews…
                  </Typography>
                ) : postFeedbacks.length === 0 ? (
                  <Typography color="#6b7280" variant="body2">
                    No reviews linked to this listing yet.
                  </Typography>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {postFeedbacks.map((fb, idx) => {
                      const rating = fb.rating ?? fb.stars ?? fb.score ?? null;
                      const comment =
                        fb.comment ?? fb.reviewText ?? fb.content ?? "";
                      const who =
                        fb.buyerName ??
                        fb.buyerFullName ??
                        fb.reviewerName ??
                        "Buyer";
                      return (
                        <Box
                          key={fb.feedbackId ?? fb.id ?? idx}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "#f9fafb",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <Typography fontWeight={600} color="#111827">
                            {who}
                            {rating != null && (
                              <Typography
                                component="span"
                                variant="body2"
                                color="#f59e0b"
                                sx={{ ml: 1 }}
                              >
                                {"★".repeat(
                                  Math.min(5, Math.max(1, Number(rating))),
                                )}
                              </Typography>
                            )}
                          </Typography>
                          {comment ? (
                            <Typography
                              variant="body2"
                              color="#4b5563"
                              sx={{ mt: 0.5 }}
                            >
                              {comment}
                            </Typography>
                          ) : null}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* <ProductInspectionReport /> */}
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

      {/* <ImageZoomModal /> */}
      <Modal
        open={imageZoomOpen}
        onCancel={() => setImageZoomOpen(false)}
        footer={null}
        centered
        width="min(90vw, 900px)"
        styles={{ body: { padding: 0 } }}
      >
        <img
          src={images[selectedImageIndex] || product?.image}
          alt={`${product?.name ?? "Product"} - full size`}
          referrerPolicy="no-referrer"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "85vh",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Modal>

      {/* <RejectListingModal /> */}
      <Modal
        title="Reject listing"
        open={rejectModalOpen}
        onOk={handleAdminRejectConfirm}
        onCancel={handleAdminRejectClose}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: !!rejectingId }}
      >
        <p style={{ marginBottom: 8 }}>
          Enter the rejection reason. The member will see this in Manage
          Listings.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Title, price, or description does not meet guidelines..."
          rows={4}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #d1d5db",
            resize: "vertical",
          }}
        />
      </Modal>

      {/* <CheckoutModal /> */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={product}
        numericPrice={numericCheckoutPrice}
        onSuccess={() => navigate("/orders")}
      />

      {/* <ProductDetailFooter /> */}
      {!isStaffView && (
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
      )}
    </>
  );

  // <ProductDetailLayoutWrapper />
  return isStaffView ? (
    isAdminView ? (
      <AdminLayout>
        <div className="admin-dashboard-page">
          <div className="admin-dashboard">{mainColumn}</div>
        </div>
      </AdminLayout>
    ) : (
      <InspectorLayout>
        <div className="inspector-page">
          <div className="inspector-dashboard">{mainColumn}</div>
        </div>
      </InspectorLayout>
    )
  ) : (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafa" }}>{mainColumn}</Box>
  );
}

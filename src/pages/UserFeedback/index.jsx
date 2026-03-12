import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Avatar,
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { Rate, Empty, Tabs, Tag, Image } from "antd";
import {
  StarFilled,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import userService from "../../services/userService";
import postService from "../../services/postService";
import { feedbackService } from "../../services";
import { formatCurrency } from "../../utils/formatCurrency";
import { POSTING_STATUS } from "../../constants/postingStatus";
import "../Orders/index.css";

export default function UserFeedbackPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [visibleActive, setVisibleActive] = useState(6);
  const [visibleSold, setVisibleSold] = useState(6);
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [helpfulCounts, setHelpfulCounts] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function loadUser() {
      if (!userId) {
        setLoadingUser(false);
        return;
      }
      setLoadingUser(true);
      try {
        const res = await userService.getUserById(userId);
        const data = res?.data ?? res?.result ?? res;
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }
    loadUser();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load feedback + rating từ BE FeedbackController
  useEffect(() => {
    let cancelled = false;
    async function loadFeedback() {
      if (!userId) {
        setFeedbacks([]);
        setRatingSummary(null);
        setLoadingFeedbacks(false);
        return;
      }
      setLoadingFeedbacks(true);
      try {
        const [fbRes, ratingRes] = await Promise.all([
          feedbackService.getFeedbacksBySeller(userId),
          feedbackService.getSellerRating(userId),
        ]);
        if (cancelled) return;
        const fbRaw = fbRes?.data ?? fbRes?.result ?? fbRes;
        const fbList = Array.isArray(fbRaw?.result ?? fbRaw)
          ? fbRaw.result ?? fbRaw
          : fbRaw?.content ?? [];
        setFeedbacks(fbList);
        // Khởi tạo số lượt "Helpful" nếu BE có trường, mặc định 0
        const initialHelpful = {};
        fbList.forEach((f) => {
          const id = f.feedbackId ?? f.id;
          if (id != null) {
            initialHelpful[id] = f.helpfulCount ?? 0;
          }
        });
        setHelpfulCounts(initialHelpful);

        const ratingRaw = ratingRes?.data ?? ratingRes?.result ?? ratingRes;
        const ratingObj = ratingRaw?.result ?? ratingRaw ?? null;
        setRatingSummary(ratingObj);
      } catch {
        if (!cancelled) {
          setFeedbacks([]);
          setRatingSummary(null);
        }
      } finally {
        if (!cancelled) setLoadingFeedbacks(false);
      }
    }
    loadFeedback();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      if (!userId) {
        setListings([]);
        setLoadingListings(false);
        return;
      }
      setLoadingListings(true);
      try {
        const res = await postService.getPostsBySeller(userId);
        const raw = res?.data ?? res?.result ?? res?.content ?? res;
        const list = Array.isArray(raw) ? raw : raw?.content ?? [];
        if (!cancelled) setListings(list);
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    }
    loadListings();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const activeListings = useMemo(
    () =>
      listings.filter((p) => {
        const s = (p.status ?? p.postStatus ?? "").toString().toUpperCase();
        return (
          s === POSTING_STATUS.AVAILABLE ||
          s === POSTING_STATUS.VERIFIED ||
          s === POSTING_STATUS.ACTIVE
        );
      }),
    [listings],
  );

  const soldListings = useMemo(
    () =>
      listings.filter((p) => {
        const s = (p.status ?? p.postStatus ?? "").toString().toUpperCase();
        return s === POSTING_STATUS.SOLD;
      }),
    [listings],
  );

  const stats = useMemo(() => {
    if (!feedbacks.length)
      return { avg: 0, count: 0, five: 0, four: 0, three: 0, two: 0, one: 0 };
    const count =
      ratingSummary?.totalReviews != null
        ? Number(ratingSummary.totalReviews)
        : feedbacks.length;
    const baseAvg =
      ratingSummary?.averageRating != null
        ? Number(ratingSummary.averageRating)
        : feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / count;
    const total = baseAvg * count;
    const buckets = { five: 0, four: 0, three: 0, two: 0, one: 0 };
    feedbacks.forEach((f) => {
      if (f.rating === 5) buckets.five += 1;
      else if (f.rating === 4) buckets.four += 1;
      else if (f.rating === 3) buckets.three += 1;
      else if (f.rating === 2) buckets.two += 1;
      else if (f.rating === 1) buckets.one += 1;
    });
    return {
      avg: Number(total / count).toFixed(1),
      count,
      ...buckets,
    };
  }, [feedbacks]);

  const displayName =
    ratingSummary?.sellerName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Thành viên BASAUYCLE";
  const avatarLetter = displayName?.[0]?.toUpperCase?.() ?? "?";

  // Reset số lượng hiển thị khi user hoặc danh sách thay đổi
  useEffect(() => {
    setVisibleActive(6);
    setVisibleSold(6);
    setFeedbackFilter("all");
  }, [userId, activeListings.length, soldListings.length]);

  const filteredFeedbacks = useMemo(() => {
    // Hiện tại tất cả feedback đều từ người mua → filter chỉ đổi nhãn
    return feedbacks;
  }, [feedbacks, feedbackFilter]);

  const ratingLabel =
    stats.count === 0
      ? "Chưa có đánh giá"
      : Number(stats.avg) >= 4.5
        ? "Rất hài lòng"
        : Number(stats.avg) >= 3.5
          ? "Hài lòng"
          : "Chưa hài lòng";

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f9fafa" }}
    >
      <Header />

      <Box
        sx={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: { xs: "24px 16px", md: "32px 24px" },
        }}
      >
        {/* Header seller info + summary */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
          }}
        >
          <CardContent sx={{ p: 3.25 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                flexWrap: "wrap",
              }}
            >
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: "#0f766e",
                  fontSize: 32,
                  fontWeight: 600,
                }}
              >
                {avatarLetter}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="h5" fontWeight={700} color="#111827">
                  {displayName}
                </Typography>
                <Typography
                  variant="body2"
                  color="#6b7280"
                  sx={{ mt: 0.25 }}
                >
                  Hoạt động gần đây • Tỷ lệ phản hồi —
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mt: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Rate
                      allowHalf
                      disabled
                      value={Number(stats.avg) || 0}
                      style={{ color: "#f59e0b", fontSize: 18 }}
                    />
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}
                    >
                      {stats.avg} / 5
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, color: "#6b7280" }}
                    >
                      {loadingFeedbacks
                        ? "Đang tải..."
                        : `(${stats.count} đánh giá)`}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 999,
                      backgroundColor: "#ecfdf5",
                    }}
                  >
                    <ShoppingCartOutlined
                      style={{ fontSize: 16, color: "#16a34a" }}
                    />
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 500, color: "#166534" }}
                    >
                      Đơn hàng đã bán: {soldListings.length || feedbacks.length}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Listings section */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography variant="h6" fontWeight={700} color="#111827">
                Tất cả tin đăng{" "}
                <Typography component="span" sx={{ fontWeight: 400, fontSize: 14, color: "#6b7280" }}>
                  ({listings.length})
                </Typography>
              </Typography>
            </Box>

            <Tabs
              defaultActiveKey="active"
              items={[
                {
                  key: "active",
                  label: `Tin đang hoạt động (${activeListings.length})`,
                  children: (
                    <Box sx={{ mt: 2 }}>
                      {loadingListings ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <Empty description="Đang tải tin đăng..." />
                        </Box>
                      ) : activeListings.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <Empty description="Chưa có tin đang hoạt động" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 1fr",
                              md: "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 2.5,
                          }}
                        >
                          {activeListings.slice(0, visibleActive).map((p) => {
                            const id = p.postId ?? p.id;
                            const title =
                              p.bicycleName ??
                              p.bicycle_name ??
                              p.title ??
                              "Tin đăng";
                            const thumb =
                              p.thumbnailUrl ||
                              p.imageUrl ||
                              (Array.isArray(p.images) && p.images[0]?.imageUrl) ||
                              null;
                            return (
                            <Box
                              key={id}
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                              }}
                              component="a"
                              href={id ? `/product/${id}` : "#"}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  aspectRatio: "4 / 3",
                                  backgroundColor: "#f3f4f6",
                                  overflow: "hidden",
                                }}
                              >
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={title}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : null}
                              </Box>
                              <Box sx={{ p: 1.5 }}>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#111827",
                                    minHeight: 38,
                                  }}
                                >
                                  {title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#dc2626",
                                    mt: 0.5,
                                  }}
                                >
                                  {formatCurrency(p.price ?? 0)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                    mt: 0.5,
                                  }}
                                >
                                  {p.location ?? ""}
                                </Typography>
                              </Box>
                            </Box>
                            );
                          })}
                          {activeListings.length > visibleActive && (
                            <Box
                              sx={{
                                mt: 3,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="medium"
                                onClick={() =>
                                  setVisibleActive((prev) =>
                                    Math.min(prev + 6, activeListings.length),
                                  )
                                }
                                sx={{
                                  borderRadius: 999,
                                  px: 3.5,
                                  textTransform: "none",
                                  fontSize: 14,
                                  borderColor: "#111827",
                                  color: "#111827",
                                  "&:hover": {
                                    borderColor: "#000000",
                                    color: "#000000",
                                    backgroundColor: "rgba(15,23,42,0.04)",
                                  },
                                }}
                              >
                                Xem thêm tin đăng
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  ),
                },
                {
                  key: "sold",
                  label: `Đã bán (${soldListings.length})`,
                  children: (
                    <Box sx={{ mt: 2 }}>
                      {loadingListings ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <Empty description="Đang tải tin đăng..." />
                        </Box>
                      ) : soldListings.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <Empty description="Chưa có tin đã bán" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 1fr",
                              md: "repeat(3, minmax(0, 1fr))",
                            },
                            gap: 2.5,
                          }}
                        >
                          {soldListings.slice(0, visibleSold).map((p) => {
                            const id = p.postId ?? p.id;
                            const title =
                              p.bicycleName ??
                              p.bicycle_name ??
                              p.title ??
                              "Tin đăng";
                            const thumb =
                              p.thumbnailUrl ||
                              p.imageUrl ||
                              (Array.isArray(p.images) && p.images[0]?.imageUrl) ||
                              null;
                            return (
                            <Box
                              key={id}
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid #e5e7eb",
                                backgroundColor: "#fff",
                                cursor: "pointer",
                              }}
                              component="a"
                              href={id ? `/product/${id}` : "#"}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  aspectRatio: "4 / 3",
                                  backgroundColor: "#f3f4f6",
                                  overflow: "hidden",
                                }}
                              >
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={title}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : null}
                              </Box>
                              <Box sx={{ p: 1.5 }}>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#111827",
                                    minHeight: 38,
                                  }}
                                >
                                  {title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#dc2626",
                                    mt: 0.5,
                                  }}
                                >
                                  {formatCurrency(p.price ?? 0)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                    mt: 0.5,
                                  }}
                                >
                                  {p.location ?? ""}
                                </Typography>
                              </Box>
                            </Box>
                            );
                          })}
                          {soldListings.length > visibleSold && (
                            <Box
                              sx={{
                                mt: 3,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="medium"
                                onClick={() =>
                                  setVisibleSold((prev) =>
                                    Math.min(prev + 6, soldListings.length),
                                  )
                                }
                                sx={{
                                  borderRadius: 999,
                                  px: 3.5,
                                  textTransform: "none",
                                  fontSize: 14,
                                  borderColor: "#111827",
                                  color: "#111827",
                                  "&:hover": {
                                    borderColor: "#000000",
                                    color: "#000000",
                                    backgroundColor: "rgba(15,23,42,0.04)",
                                  },
                                }}
                              >
                                Xem thêm tin đăng
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Feedback section */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Summary row like Chợ Tốt */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 220,
                  backgroundColor: "#fef9c3",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography
                  sx={{ fontSize: 14, fontWeight: 600, color: "#92400e", mb: 0.5 }}
                >
                  {stats.avg} ★ {ratingLabel}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: "#92400e" }}
                >
                  {loadingFeedbacks
                    ? "Đang tải đánh giá..."
                    : `(${stats.count} đánh giá từ người dùng)`}
                </Typography>
              </Box>

              {/* Rating breakdown bars */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 220,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {[5, 4, 3, 2, 1].map((star) => {
                  const countForStar =
                    star === 5
                      ? stats.five
                      : star === 4
                        ? stats.four
                        : star === 3
                          ? stats.three
                          : star === 2
                            ? stats.two
                            : stats.one;
                  const percent =
                    stats.count > 0 ? (countForStar / stats.count) * 100 : 0;
                  return (
                    <Box
                      key={star}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12, color: "#6b7280", minWidth: 40 }}
                      >
                        {star} ★
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 999,
                          backgroundColor: "#e5e7eb",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${percent}%`,
                            height: "100%",
                            backgroundColor: "#f59e0b",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#6b7280",
                          minWidth: 16,
                          textAlign: "right",
                        }}
                      >
                        {countForStar}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ flex: 1, minWidth: 260 }}>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 500, color: "#6b7280", mb: 1 }}
                >
                  Người dùng đánh giá
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Tag color="#facc15">
                    Giao tiếp lịch sự, thân thiện (0)
                  </Tag>
                  <Tag color="#22c55e">Đúng hẹn (0)</Tag>
                  <Tag>Đúng mô tả (0)</Tag>
                </Box>
              </Box>
            </Box>

            {/* Filter row */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#ffffff",
                pb: 2.5,
                mb: 2.5,
                borderBottom: "1px solid #f3f4f6",
                boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 500, color: "#6b7280", mb: 1 }}
                  >
                    Lọc đánh giá theo
                  </Typography>
                  <Box sx={{ display: "inline-flex", gap: 1 }}>
                    <Tag color="#111827" style={{ color: "#fff" }}>
                      Tất cả ({stats.count})
                    </Tag>
                    <Tag>Từ người mua ({stats.count})</Tag>
                    <Tag>Từ người bán (0)</Tag>
                  </Box>
                </Box>
              </Box>
            </Box>

            {loadingFeedbacks ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Empty description="Đang tải đánh giá..." />
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Empty description="Chưa có feedback nào cho người bán này." />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {filteredFeedbacks.map((fb, idx) => {
                    const id = fb.feedbackId ?? fb.id ?? idx;
                    const helpful = helpfulCounts[id] ?? 0;

                    const handleHelpfulClick = () => {
                      setHelpfulCounts((prev) => ({
                        ...prev,
                        [id]: (prev[id] ?? 0) + 1,
                      }));
                    };

                    const rawImages =
                      (Array.isArray(fb.images) && fb.images) ||
                      (Array.isArray(fb.imageUrls) && fb.imageUrls) ||
                      [];
                    const imageUrls = rawImages
                      .map((img) =>
                        typeof img === "string"
                          ? img
                          : img?.imageUrl ?? img?.url ?? img?.thumbnailUrl ?? null,
                      )
                      .filter(Boolean);

                    return (
                      <Box
                        key={id}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#fff",
                          p: 1.75,
                        }}
                      >
                        {/* Avatar + name + stars + time */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "#e5e7eb",
                              fontSize: 16,
                              fontWeight: 600,
                            }}
                          >
                            {fb.buyerName?.[0]?.toUpperCase?.() ?? "U"}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#111827",
                              }}
                            >
                              {fb.buyerName ?? "Người mua"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                mt: 0.25,
                              }}
                            >
                              <Rate
                                disabled
                                value={fb.rating ?? 0}
                                style={{ color: "#f59e0b", fontSize: 14 }}
                              />
                              <Typography
                                sx={{ fontSize: 12, color: "#9ca3af" }}
                              >
                                {(fb.createdAt || fb.date)
                                  ? new Date(
                                      fb.createdAt ?? fb.date,
                                    ).toLocaleDateString("vi-VN")
                                  : ""}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Review text */}
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#374151",
                            mb: 0.75,
                          }}
                        >
                          {fb.comment}
                        </Typography>

                        {/* Review images */}
                        {imageUrls.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mb: 0.75,
                            }}
                          >
                            <Image.PreviewGroup>
                              {imageUrls.map((url, i) => (
                                <Image
                                  key={i}
                                  src={url}
                                  alt={`Ảnh đánh giá ${i + 1}`}
                                  width={72}
                                  height={72}
                                  style={{
                                    borderRadius: 8,
                                    objectFit: "cover",
                                  }}
                                />
                              ))}
                            </Image.PreviewGroup>
                          </Box>
                        )}

                        {/* Related product + price */}
                        <Box sx={{ mb: 0.75 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "#6b7280",
                              mb: 0.25,
                            }}
                          >
                            {fb.postTitle}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#dc2626",
                            }}
                          >
                            {fb.price != null ? formatCurrency(fb.price) : ""}
                          </Typography>
                        </Box>

                        {/* Tags */}
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          <Tag
                            bordered={false}
                            color="#fef3c7"
                            style={{
                              borderRadius: 999,
                              padding: "2px 10px",
                              fontSize: 12,
                            }}
                          >
                            Giao tiếp lịch sự
                          </Tag>
                          <Tag
                            bordered={false}
                            color="#e0f2fe"
                            style={{
                              borderRadius: 999,
                              padding: "2px 10px",
                              fontSize: 12,
                            }}
                          >
                            Đúng hẹn
                          </Tag>
                          <Tag
                            bordered={false}
                            style={{
                              borderRadius: 999,
                              padding: "2px 10px",
                              fontSize: 12,
                            }}
                          >
                            Đúng mô tả
                          </Tag>
                        </Box>

                        {/* Helpful button */}
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleHelpfulClick}
                          sx={{
                            mt: 1,
                            px: 0,
                            minWidth: 0,
                            fontSize: 12,
                            textTransform: "none",
                            color: "#6b7280",
                            "&:hover": {
                              backgroundColor: "transparent",
                              color: "#0f766e",
                            },
                          }}
                        >
                          👍 Helpful ({helpful})
                        </Button>
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ textAlign: "center", mt: 3 }}>
                  <Button
                    variant="outlined"
                    size="medium"
                    sx={{
                      borderRadius: 999,
                      px: 3.5,
                      textTransform: "none",
                      fontSize: 14,
                    }}
                  >
                    Xem tất cả {stats.count} đánh giá
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Footer />
    </Box>
  );
}


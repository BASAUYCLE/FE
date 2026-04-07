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
import { Rate, Empty, Tabs, Tag, Image, Tooltip } from "antd";
import {
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Star } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";
import postService from "../../services/postService";
import { feedbackService } from "../../services";
import { formatCurrency } from "../../utils/formatCurrency";
import { POSTING_STATUS } from "../../constants/postingStatus";
import { getAvatarSrc } from "../../utils/avatar";
import feedbackBannerImage from "../../assets/banner_feedback.png";
import "../Orders/index.css";

/** Mỗi lần hiển thị: 4 cột × 3 hàng = 12 tin */
const LISTINGS_PAGE_SIZE = 12;

function getFeedbackRole(feedback) {
  const roleRaw = String(
    feedback?.reviewerRole ??
      feedback?.fromRole ??
      feedback?.feedbackFrom ??
      feedback?.role ??
      "",
  ).toLowerCase();
  if (roleRaw.includes("seller")) return "seller";
  if (roleRaw.includes("buyer")) return "buyer";
  return "buyer";
}

function extractFeedbackLabels(feedback) {
  const rawTags = feedback?.tags ?? feedback?.keywords ?? feedback?.criteria ?? [];
  const labels = new Set();

  if (Array.isArray(rawTags)) {
    rawTags.forEach((item) => {
      const label = String(item?.label ?? item?.name ?? item ?? "").trim();
      if (label) labels.add(label);
    });
  }

  return [...labels];
}

function pickFirstValue(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return null;
}

function formatRelativeTime(input) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = date.getTime() - Date.now();
  const absSec = Math.abs(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  if (absSec < 3600) return rtf.format(Math.round(diffMs / (1000 * 60)), "minute");
  if (absSec < 86400) return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), "hour");
  if (absSec < 2592000) return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), "day");
  if (absSec < 31536000) return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24 * 30)), "month");
  return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24 * 365)), "year");
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function UserFeedbackPage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [visibleActive, setVisibleActive] = useState(LISTINGS_PAGE_SIZE);
  const [visibleSold, setVisibleSold] = useState(LISTINGS_PAGE_SIZE);
  const [listingsTab, setListingsTab] = useState("active");
  const [feedbackFilter, setFeedbackFilter] = useState("all");

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

  const uniqueListings = useMemo(() => {
    const byId = new Map();
    const noIdItems = [];
    listings.forEach((p, idx) => {
      const id = p?.postId ?? p?.id;
      if (id == null || id === "") {
        noIdItems.push({ ...p, __fallbackKey: `no-id-${idx}` });
        return;
      }
      byId.set(String(id), p);
    });
    return [...byId.values(), ...noIdItems];
  }, [listings]);

  const activeListings = useMemo(
    () =>
      uniqueListings.filter((p) => {
        const s = (p.status ?? p.postStatus ?? "").toString().toUpperCase();
        return (
          s === POSTING_STATUS.AVAILABLE ||
          s === POSTING_STATUS.VERIFIED ||
          s === POSTING_STATUS.ACTIVE
        );
      }),
    [uniqueListings],
  );

  const soldListings = useMemo(
    () =>
      uniqueListings.filter((p) => {
        const s = (p.status ?? p.postStatus ?? "").toString().toUpperCase();
        return s === POSTING_STATUS.SOLD;
      }),
    [uniqueListings],
  );

  const stats = useMemo(() => {
    if (!feedbacks.length)
      return { avg: 0, count: 0, five: 0, four: 0, three: 0, two: 0, one: 0 };
    const countFromApi = pickFirstValue(
      ratingSummary?.totalReviews,
      ratingSummary?.totalReview,
      ratingSummary?.reviewCount,
      ratingSummary?.totalRatings,
      ratingSummary?.total_reviews,
      ratingSummary?.count,
    );
    const avgFromApi = pickFirstValue(
      ratingSummary?.averageRating,
      ratingSummary?.avgRating,
      ratingSummary?.average,
      ratingSummary?.avg,
      ratingSummary?.average_rating,
    );
    const count = toNumberOrNull(countFromApi) ?? feedbacks.length;
    const baseAvg =
      toNumberOrNull(avgFromApi) ??
      (count > 0 ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / count : 0);
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
  }, [feedbacks, ratingSummary]);

  const displayName =
    ratingSummary?.sellerName ||
    ratingSummary?.sellerFullName ||
    ratingSummary?.fullName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    "BASAUYCLE Member";

  const avatarUrl = pickFirstValue(
    currentUser &&
      String(currentUser?.id ?? currentUser?.userId ?? "") === String(userId)
      ? getAvatarSrc(currentUser)
      : null,
    getAvatarSrc(user),
    ratingSummary?.sellerAvatar,
    ratingSummary?.sellerAvatarUrl,
    ratingSummary?.avatar,
    ratingSummary?.avatarUrl,
    ratingSummary?.avatar_url,
  );

  const lastActiveRaw = pickFirstValue(
    user?.lastActiveAt,
    user?.lastSeenAt,
    user?.updatedAt,
    user?.updated_at,
    ratingSummary?.lastActiveAt,
  );
  const locationText = pickFirstValue(
    user?.location,
    user?.address,
    user?.city && user?.province ? `${user.city}, ${user.province}` : null,
    user?.provinceName,
    ratingSummary?.sellerLocation,
    activeListings?.[0]?.location,
    soldListings?.[0]?.location,
  );

  const activityText = formatRelativeTime(lastActiveRaw); // không ??
  const displayLocation = locationText ?? "Bien Hoa City, Dong Nai";

  const avatarLetter = displayName?.[0]?.toUpperCase?.() ?? "?";

  // Reset số lượng hiển thị khi user hoặc danh sách thay đổi
  useEffect(() => {
    setVisibleActive(LISTINGS_PAGE_SIZE);
    setVisibleSold(LISTINGS_PAGE_SIZE);
    setListingsTab("active");
    setFeedbackFilter("all");
  }, [userId, activeListings.length, soldListings.length]);

  const filteredFeedbacks = useMemo(() => {
    if (feedbackFilter === "buyer") {
      return feedbacks.filter((fb) => getFeedbackRole(fb) === "buyer");
    }
    if (feedbackFilter === "seller") {
      return feedbacks.filter((fb) => getFeedbackRole(fb) === "seller");
    }
    return feedbacks;
  }, [feedbacks, feedbackFilter]);

  const feedbackFilterCount = useMemo(() => {
    const buyer = feedbacks.filter((fb) => getFeedbackRole(fb) === "buyer").length;
    const seller = feedbacks.filter((fb) => getFeedbackRole(fb) === "seller").length;
    return { buyer, seller };
  }, [feedbacks]);

  const feedbackTagSummary = useMemo(() => {
    const counter = new Map();
    feedbacks.forEach((fb) => {
      extractFeedbackLabels(fb).forEach((label) => {
        counter.set(label, (counter.get(label) ?? 0) + 1);
      });
    });
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));
  }, [feedbacks]);

  const ratingLabel =
    stats.count === 0
      ? "No ratings yet"
      : Number(stats.avg) >= 4.5
        ? "Very satisfied"
        : Number(stats.avg) >= 3.5
          ? "Satisfied"
          : "Not satisfied";

  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}
    >
      <Header />

      <Box
        sx={{
          maxWidth: "var(--page-content-max)",
          margin: "0 auto",
          padding: { xs: "16px 12px", sm: "20px 16px", md: "24px 20px" },
          boxSizing: "border-box",
        }}
      >
        {/* Header seller info + summary */}
        <Card
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
            overflow: "hidden",
            border: "1px solid #e8eaed",
          }}
        >
          <Box sx={{ lineHeight: 0, backgroundColor: "#ffffff", maxHeight: 160, overflow: "hidden" }}>
            <Box
              component="img"
              src={feedbackBannerImage}
              alt="User feedback banner"
              sx={{
                width: "100%",
                height: 160,
                display: "block",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </Box>
          <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  bgcolor: "#00CCAD",
                  fontSize: 28,
                  fontWeight: 600,
                }}
                src={avatarUrl || undefined}
              >
                {avatarLetter}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Box
                  sx={{
                    mt: 0.9,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      px: 1.1,
                      py: 0.4,
                      borderRadius: 999,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      color: "#64748b",
                      fontSize: 13,
                      lineHeight: 1.2,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.75,
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        boxShadow: "0 0 0 2px rgba(34,197,94,0.18)",
                        flex: "0 0 auto",
                      }}
                    />
                    <span>Active {activityText}</span>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    mt: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      {stats.avg}
                    </Typography>
                    <Star size={15} color="#f59e0b" fill="#f59e0b" />
                    <Typography sx={{ fontSize: 13, color: "#475569", textDecoration: "underline", textUnderlineOffset: 2 }}>
                      ({stats.count} ratings)
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
            mb: 2,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
            border: "1px solid #e8eaed",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                mb: 1.25,
              }}
            >
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                All listings{" "}
                <Typography component="span" sx={{ fontWeight: 400, fontSize: 13, color: "#6b7280" }}>
                  ({uniqueListings.length})
                </Typography>
              </Typography>
            </Box>

            <Tabs
              activeKey={listingsTab}
              onChange={setListingsTab}
              indicator={{ size: 0 }}
              tabBarGutter={10}
              tabBarStyle={{ marginBottom: 0, borderBottom: "none" }}
              items={[
                {
                  key: "active",
                  label: (
                    <Box
                      sx={{
                        borderRadius: 999,
                        px: 2.25,
                        py: 0.8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: listingsTab === "active" ? "#ffffff" : "#111827",
                        backgroundColor: listingsTab === "active" ? "#111827" : "#f3f4f6",
                        lineHeight: 1.1,
                      }}
                    >
                      Active listings ({activeListings.length})
                    </Box>
                  ),
                  children: (
                    <Box sx={{ mt: 1.5 }}>
                      {loadingListings ? (
                        <Box sx={{ textAlign: "center", py: 2.5 }}>
                          <Empty description="Loading listings..." />
                        </Box>
                      ) : activeListings.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 2.5 }}>
                          <Empty description="No active listings yet" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, minmax(0, 1fr))",
                              md: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: 1.5,
                          }}
                        >
                          {activeListings.slice(0, visibleActive).map((p) => {
                            const id = p.postId ?? p.id;
                            const title =
                              p.bicycleName ??
                              p.bicycle_name ??
                              p.title ??
                              "Listing";
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
                              <Box sx={{ p: 1.25 }}>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: "#111827",
                                    minHeight: 34,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#dc2626",
                                    mt: 0.35,
                                  }}
                                >
                                  {formatCurrency(p.price ?? 0)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                    mt: 0.35,
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
                                mt: 2,
                                display: "flex",
                                justifyContent: "center",
                                gridColumn: "1 / -1",
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="medium"
                                onClick={() =>
                                  setVisibleActive((prev) =>
                                    Math.min(prev + LISTINGS_PAGE_SIZE, activeListings.length),
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
                                View more listings
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
                  label: (
                    <Box
                      sx={{
                        borderRadius: 999,
                        px: 2.25,
                        py: 0.8,
                        fontSize: 13,
                        fontWeight: 600,
                        color: listingsTab === "sold" ? "#ffffff" : "#111827",
                        backgroundColor: listingsTab === "sold" ? "#111827" : "#f3f4f6",
                        lineHeight: 1.1,
                      }}
                    >
                      Sold ({soldListings.length})
                    </Box>
                  ),
                  children: (
                    <Box sx={{ mt: 1.5 }}>
                      {loadingListings ? (
                        <Box sx={{ textAlign: "center", py: 2.5 }}>
                          <Empty description="Loading listings..." />
                        </Box>
                      ) : soldListings.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 2.5 }}>
                          <Empty description="No sold listings yet" />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "repeat(2, minmax(0, 1fr))",
                              md: "repeat(4, minmax(0, 1fr))",
                            },
                            gap: 1.5,
                          }}
                        >
                          {soldListings.slice(0, visibleSold).map((p) => {
                            const id = p.postId ?? p.id;
                            const title =
                              p.bicycleName ??
                              p.bicycle_name ??
                              p.title ??
                              "Listing";
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
                              <Box sx={{ p: 1.25 }}>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: "#111827",
                                    minHeight: 34,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {title}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#dc2626",
                                    mt: 0.35,
                                  }}
                                >
                                  {formatCurrency(p.price ?? 0)}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                    mt: 0.35,
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
                                mt: 2,
                                display: "flex",
                                justifyContent: "center",
                                gridColumn: "1 / -1",
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="medium"
                                onClick={() =>
                                  setVisibleSold((prev) =>
                                    Math.min(prev + LISTINGS_PAGE_SIZE, soldListings.length),
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
                                View more listings
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
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
            border: "1px solid #e8eaed",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#111827" }}>
                Ratings
              </Typography>
              <Tooltip
                title="Filter highlighted seller criteria based on user ratings"
                placement="topLeft"
                color="#1f1f1f"
                overlayInnerStyle={{ borderRadius: 14, fontSize: 14, lineHeight: 1.45, padding: "14px 16px" }}
                arrow
              >
                <InfoCircleOutlined style={{ fontSize: 18, color: "#6b7280", cursor: "pointer" }} />
              </Tooltip>
            </Box>
            {/* Summary row like Chợ Tốt */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: { xs: "100%", md: 220 },
                  maxWidth: 280,
                  backgroundColor: "#fef9c3",
                  borderRadius: 2,
                  p: 1.75,
                }}
              >
                <Typography
                  sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: "#111827", lineHeight: 1.15, mb: 0.5 }}
                >
                  {stats.avg}{" "}
                  <Box component="span" sx={{ display: "inline-flex", verticalAlign: "middle" }}>
                    <Star size={15} color="#f59e0b" fill="#f59e0b" />
                  </Box>{" "}
                  {ratingLabel}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, color: "#4b5563" }}
                >
                  {loadingFeedbacks
                    ? "Loading ratings..."
                    : `(${stats.count} ratings from users)`}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {feedbackTagSummary.length > 0 ? (
                    feedbackTagSummary.map((item) => (
                      <Tag key={item.label} style={{ borderRadius: 999, paddingInline: 10 }}>
                        {item.label} ({item.count})
                      </Tag>
                    ))
                  ) : null}
                </Box>
              </Box>
            </Box>

            {/* Filter row */}
            <Box
              sx={{
                pb: 1.25,
                mb: 2,
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#4b5563", mr: 0.5 }}>
                  Filter ratings by
                </Typography>
                <Button
                  size="small"
                  onClick={() => setFeedbackFilter("all")}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    textTransform: "none",
                    fontSize: 13,
                    color: feedbackFilter === "all" ? "#fff" : "#111827",
                    backgroundColor: feedbackFilter === "all" ? "#111827" : "#f3f4f6",
                    "&:hover": { backgroundColor: feedbackFilter === "all" ? "#111827" : "#e5e7eb" },
                  }}
                >
                  All ({stats.count})
                </Button>
                <Button
                  size="small"
                  onClick={() => setFeedbackFilter("buyer")}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    textTransform: "none",
                    fontSize: 14,
                    color: feedbackFilter === "buyer" ? "#fff" : "#111827",
                    backgroundColor: feedbackFilter === "buyer" ? "#111827" : "#f3f4f6",
                    "&:hover": { backgroundColor: feedbackFilter === "buyer" ? "#111827" : "#e5e7eb" },
                  }}
                >
                  From buyers ({feedbackFilterCount.buyer})
                </Button>
                <Button
                  size="small"
                  onClick={() => setFeedbackFilter("seller")}
                  sx={{
                    borderRadius: 999,
                    px: 2,
                    textTransform: "none",
                    fontSize: 14,
                    color: feedbackFilter === "seller" ? "#fff" : "#111827",
                    backgroundColor: feedbackFilter === "seller" ? "#111827" : "#f3f4f6",
                    "&:hover": { backgroundColor: feedbackFilter === "seller" ? "#111827" : "#e5e7eb" },
                  }}
                >
                  From sellers ({feedbackFilterCount.seller})
                </Button>
              </Box>
            </Box>

            {loadingFeedbacks ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Empty description="Loading ratings..." />
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Empty description="No feedback for this seller yet." />
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                    },
                    gap: 1.5,
                  }}
                >
                  {filteredFeedbacks.map((fb, idx) => {
                    const id = fb.feedbackId ?? fb.id ?? idx;

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
                          borderRadius: 1.5,
                          border: "1px solid #e5e7eb",
                          backgroundColor: "#fff",
                          p: 1.5,
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
                            src={
                              getAvatarSrc(
                                fb,
                                fb?.buyerAvatar,
                                fb?.buyerAvatarUrl,
                                fb?.buyer_avatar,
                                fb?.buyer_avatar_url,
                                fb?.reviewerAvatar,
                                fb?.reviewerAvatarUrl,
                                fb?.reviewer_avatar,
                                fb?.reviewer_avatar_url,
                              ) || undefined
                            }
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
                              {fb.buyerName ?? "Buyer"}
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
                                    ).toLocaleDateString("en-US")
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
                                  alt={`Review image ${i + 1}`}
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

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {extractFeedbackLabels(fb).slice(0, 4).map((label) => (
                            <Tag
                              key={`${id}-${label}`}
                              bordered={false}
                              style={{
                                borderRadius: 999,
                                padding: "2px 10px",
                                fontSize: 12,
                              }}
                            >
                              {label}
                            </Tag>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
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


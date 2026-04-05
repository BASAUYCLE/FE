import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { DollarSign, TrendingUp, FileText, RefreshCw } from "lucide-react";
import adminPostService from "../../../services/adminPostService";
import systemConfigService from "../../../services/systemConfigService";
import { formatCurrency } from "../../../utils/formatCurrency";
import "../dashboard/index.css";
import "./index.css";

const PERIODS = [
  { value: "week", label: "This week", days: 7 },
  { value: "month", label: "This month", days: 30 },
  { value: "quarter", label: "This quarter", days: 90 },
];

const POSTING_FEE_FALLBACK = 50_000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function startOfPeriod(days) {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Nhóm posts theo ngày trong khoảng `days` gần nhất */
function buildDailyBuckets(posts, days) {
  const buckets = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = [];
  }
  posts.forEach((p) => {
    const key = (p.createdAt ?? "").slice(0, 10);
    if (key && buckets[key] !== undefined) buckets[key].push(p);
  });
  return buckets;
}

/** Nhóm posts theo tuần trong khoảng `days` */
function buildWeeklyBuckets(posts, days) {
  const buckets = {};
  const today = new Date();
  // Tạo bucket cho mỗi tuần
  for (let i = Math.ceil(days / 7) - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 7);
    const week = `W${String(getISOWeek(d)).padStart(2, "0")}`;
    buckets[week] = [];
  }
  posts.forEach((p) => {
    const d = new Date(p.createdAt ?? "");
    if (isNaN(d)) return;
    const key = `W${String(getISOWeek(d)).padStart(2, "0")}`;
    if (buckets[key] !== undefined) buckets[key].push(p);
  });
  return buckets;
}

function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function buildChartData(posts, period, postingFee) {
  const periodDef = PERIODS.find((p) => p.value === period) ?? PERIODS[0];
  const days = periodDef.days;

  if (period === "quarter") {
    // Nhóm theo tuần
    const buckets = buildWeeklyBuckets(posts, days);
    const entries = Object.entries(buckets);
    const maxCount = Math.max(...entries.map(([, arr]) => arr.length), 1);
    return entries.map(([key, arr]) => ({
      label: key,
      value: Math.round((arr.length / maxCount) * 100),
      count: arr.length,
      amount: arr.length > 0 ? formatCurrency(arr.length * postingFee) : "—",
    }));
  }

  // Nhóm theo ngày
  const buckets = buildDailyBuckets(posts, days);
  const entries = Object.entries(buckets); // [dateKey, posts[]]
  const maxCount = Math.max(...entries.map(([, arr]) => arr.length), 1);

  // Label: ngày/tháng hoặc T2…CN
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return entries.map(([key, arr]) => {
    const d = new Date(key);
    const label =
      period === "week"
        ? dayLabels[d.getDay()]
        : `${d.getDate()}/${d.getMonth() + 1}`;
    return {
      label,
      value: Math.round((arr.length / maxCount) * 100),
      count: arr.length,
      amount: arr.length > 0 ? formatCurrency(arr.length * postingFee) : "—",
    };
  });
}

/** Status badge color */
const STATUS_COLOR = {
  AVAILABLE: "#10b981",
  DEPOSITED: "#d97706",
  SOLD: "#7c3aed",
  PENDING: "#f59e0b",
  ADMIN_APPROVED: "#3b82f6",
  REJECTED: "#ef4444",
  HIDDEN: "#94a3b8",
  DRAFTED: "#94a3b8",
};
const STATUS_LABEL = {
  AVAILABLE: "Available",
  DEPOSITED: "Deposited",
  SOLD: "Sold",
  PENDING: "Pending",
  ADMIN_APPROVED: "Approved",
  REJECTED: "Rejected",
  HIDDEN: "Hidden",
  DRAFTED: "Draft",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminRevenue() {
  const [period, setPeriod] = useState("week");
  const [allPosts, setAllPosts] = useState([]);
  const [postingFee, setPostingFee] = useState(POSTING_FEE_FALLBACK);
  const [loading, setLoading] = useState(true);

  // Fetch all posts + posting fee once
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, feeRes] = await Promise.allSettled([
        adminPostService.getAllPosts(),
        systemConfigService.getByKey("POSTING_FEE"),
      ]);

      if (postsRes.status === "fulfilled") {
        const raw =
          postsRes.value?.result ?? postsRes.value?.data ?? postsRes.value;
        const list = Array.isArray(raw)
          ? raw
          : (raw?.content ?? raw?.posts ?? raw?.data ?? []);
        setAllPosts(list);
      }

      if (feeRes.status === "fulfilled") {
        const raw = feeRes.value?.result ?? feeRes.value?.data ?? feeRes.value;
        const strVal =
          typeof raw === "string"
            ? raw
            : (raw?.configValue ??
              raw?.config_value ??
              raw?.value ??
              String(raw ?? ""));
        const num = parseFloat(strVal);
        if (!isNaN(num) && num > 0) setPostingFee(num);
      }
    } catch (err) {
      console.warn("AdminRevenue: fetch failed", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Posts trong kỳ đã chọn (chỉ tính các bài đã được submit = không phải DRAFTED)
  const periodPosts = useMemo(() => {
    const days = PERIODS.find((p) => p.value === period)?.days ?? 7;
    const cutoff = startOfPeriod(days);
    return allPosts.filter((p) => {
      const created = new Date(p.createdAt ?? p.created_at ?? "");
      return !isNaN(created) && created >= cutoff && p.postStatus !== "DRAFTED";
    });
  }, [allPosts, period]);

  const totalRevenue = periodPosts.length * postingFee;
  const totalAllPosts = allPosts.filter(
    (p) => p.postStatus !== "DRAFTED",
  ).length;
  const chartData = useMemo(
    () => buildChartData(periodPosts, period, postingFee),
    [periodPosts, period, postingFee],
  );

  // Bảng lịch sử: 20 bài gần nhất trong kỳ, sắp xếp mới nhất trước
  const recentPosts = useMemo(() => {
    return [...periodPosts]
      .sort((a, b) => new Date(b.createdAt ?? "") - new Date(a.createdAt ?? ""))
      .slice(0, 20)
      .map((p) => ({
        id: p.postId ?? p.id,
        title: p.bicycleName ?? p.title ?? "—",
        seller: p.sellerFullName ?? p.sellerName ?? p.seller?.fullName ?? "—",
        status: p.postStatus ?? p.status ?? "—",
        date: p.createdAt ?? p.created_at ?? null,
        fee: postingFee,
      }));
  }, [periodPosts, postingFee]);

  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? "";

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-revenue-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            {/* Header */}
            <header className="admin-topbar admin-revenue-topbar">
              <div>
                <h1 className="admin-page-title">Listing revenue</h1>
                <p className="admin-page-subtitle">
                  Listing fee: {formatCurrency(postingFee)} / post · Total
                  posted listings: {totalAllPosts}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  className="admin-period-tab"
                  onClick={fetchData}
                  disabled={loading}
                  style={{ padding: "8px 12px" }}
                >
                  <RefreshCw size={14} />
                </button>
                <div className="admin-period-tabs">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`admin-period-tab ${period === p.value ? "active" : ""}`}
                      onClick={() => setPeriod(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Stats */}
            <section className="admin-stats admin-revenue-stats">
              {/* Tổng doanh thu kỳ */}
              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon green">
                    <DollarSign />
                  </div>
                  <span className="admin-stat-trend up">{periodLabel}</span>
                </div>
                <div className="admin-stat-title">Revenue in period</div>
                <div className="admin-stat-value">
                  {loading ? "…" : formatCurrency(totalRevenue)}
                </div>
              </div>

              {/* Số bài đăng trong kỳ */}
              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon indigo">
                    <FileText />
                  </div>
                  <span className="admin-stat-trend up">posts</span>
                </div>
                <div className="admin-stat-title">Posts in period</div>
                <div className="admin-stat-value">
                  {loading ? "…" : periodPosts.length.toLocaleString()}
                </div>
              </div>

              {/* Phí đăng bài đơn vị */}
              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon blue">
                    <TrendingUp />
                  </div>
                  <span className="admin-stat-trend up">SystemConfig</span>
                </div>
                <div className="admin-stat-title">Fee / post</div>
                <div className="admin-stat-value">
                  {formatCurrency(postingFee)}
                </div>
              </div>
            </section>

            {/* Bar chart */}
            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div className="admin-card-title">Posting chart</div>
                  <div className="admin-card-subtitle">{periodLabel}</div>
                </div>
              </div>
              <div className="admin-chart">
                {chartData.map((bar, i) => (
                  <div className="admin-chart-bar" key={`${bar.label}-${i}`}>
                    <div
                      className={`admin-chart-fill ${i === chartData.length - 1 ? "highlight" : ""}`}
                      style={{
                        height: `${Math.max(bar.value, bar.count > 0 ? 4 : 0)}%`,
                      }}
                    >
                      {bar.count > 0 && (
                        <span
                          className={`admin-chart-tooltip ${i === chartData.length - 1 ? "show" : ""}`}
                        >
                          {bar.count} posts · {bar.amount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-chart-labels">
                {chartData.map((bar, i) => (
                  <span key={`label-${i}`}>{bar.label}</span>
                ))}
              </div>
            </section>

            {/* Bảng lịch sử đăng bài */}
            <section className="admin-card admin-table-card">
              <div className="admin-card-header">
                <div>
                  <div className="admin-card-title">
                    Posting history in period
                  </div>
                  <div className="admin-card-subtitle">
                    {recentPosts.length} most recent posts · Fee per post:{" "}
                    {formatCurrency(postingFee)}
                  </div>
                </div>
              </div>

              <div className="admin-table admin-revenue-table">
                <div className="admin-table-row admin-table-header">
                  <div>Listing title</div>
                  <div>Seller</div>
                  <div>Posted date</div>
                  <div>Status</div>
                  <div>Posting fee</div>
                </div>

                {loading ? (
                  <div className="admin-table-empty">Loading...</div>
                ) : recentPosts.length === 0 ? (
                  <div className="admin-table-empty">
                    No postings in this period yet.
                  </div>
                ) : (
                  recentPosts.map((row, idx) => (
                    <div className="admin-table-row" key={row.id ?? idx}>
                      <div className="admin-rev-title">{row.title}</div>
                      <div>{row.seller}</div>
                      <div className="admin-rev-date">
                        {row.date
                          ? new Date(row.date).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </div>
                      <div>
                        <span
                          className="admin-rev-status-badge"
                          style={{
                            background: `${STATUS_COLOR[row.status] ?? "#94a3b8"}18`,
                            color: STATUS_COLOR[row.status] ?? "#94a3b8",
                          }}
                        >
                          {STATUS_LABEL[row.status] ?? row.status}
                        </span>
                      </div>
                      <div className="admin-rev-fee">
                        +{formatCurrency(row.fee)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

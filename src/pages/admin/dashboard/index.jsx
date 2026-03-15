import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
<<<<<<< HEAD
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
=======
  Users, FileText, CheckCircle, Clock, TrendingUp,
  DollarSign, ShieldCheck, ShoppingCart, AlertCircle, ArrowRight,
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
} from "lucide-react";
import adminPostService from "../../../services/adminPostService";
import userService from "../../../services/userService";
import adminService from "../../../services/adminService";
import axiosInstance from "../../../services/axiosConfig";
import systemConfigService from "../../../services/systemConfigService";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./index.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

const POSTING_FEE_FALLBACK = 50_000;

function parseList(res) {
  const raw = res?.result ?? res?.data ?? res;
<<<<<<< HEAD
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
=======
  if (Array.isArray(raw))            return raw;
  if (Array.isArray(raw?.content))   return raw.content;
  if (Array.isArray(raw?.data))      return raw.data;
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
  return [];
}

function extractThumb(p) {
  const arr = p?.images ?? p?.bicycleImages ?? [];
  const thumb = arr.find((i) => i?.isThumbnail) ?? arr[0];
  return thumb?.imageUrl ?? p?.thumbnailUrl ?? p?.imageUrl ?? null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

<<<<<<< HEAD
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
=======
  const [stats,      setStats]      = useState(null);
  const [recentPosts,setRecentPosts]= useState([]);
  const [recentUsers,setRecentUsers]= useState([]);
  const [loading,    setLoading]    = useState(true);
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b

  const load = useCallback(async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const [postsRes, usersRes, txRes, feeRes, inspRes] =
        await Promise.allSettled([
          adminPostService.getAllPosts(),
          userService.getAdminUsers(),
          adminService.getAllTransactions(),
          systemConfigService.getByKey("POSTING_FEE"),
          axiosInstance.get("/inspection/completed"),
        ]);

      // ── Posts ──────────────────────────────────────────
      const posts =
        postsRes.status === "fulfilled" ? parseList(postsRes.value) : [];
      const pending = posts.filter(
        (p) => (p.postStatus ?? p.status) === "PENDING",
      ).length;
      const available = posts.filter(
        (p) => (p.postStatus ?? p.status) === "AVAILABLE",
      ).length;
      const deposited = posts.filter(
        (p) => (p.postStatus ?? p.status) === "DEPOSITED",
      ).length;
      const sold = posts.filter(
        (p) => (p.postStatus ?? p.status) === "SOLD",
      ).length;
      const approved = posts.filter((p) =>
        ["AVAILABLE", "DEPOSITED", "SOLD"].includes(p.postStatus ?? p.status),
      ).length;

      // ── Users ──────────────────────────────────────────
      const users =
        usersRes.status === "fulfilled" ? parseList(usersRes.value) : [];
      const pendingU = users.filter(
        (u) =>
          (u.status ?? u.accountStatus ?? u.userStatus ?? "").toUpperCase() ===
            "PENDING" ||
          u.isVerified === false ||
          u.verified === false,
=======
      const [postsRes, usersRes, txRes, feeRes, inspRes] = await Promise.allSettled([
        adminPostService.getAllPosts(),
        userService.getAdminUsers(),
        adminService.getAllTransactions(),
        systemConfigService.getByKey("POSTING_FEE"),
        axiosInstance.get("/inspection/completed"),
      ]);

      // ── Posts ──────────────────────────────────────────
      const posts = postsRes.status === "fulfilled" ? parseList(postsRes.value) : [];
      const pending   = posts.filter((p) => (p.postStatus ?? p.status) === "PENDING").length;
      const available = posts.filter((p) => (p.postStatus ?? p.status) === "AVAILABLE").length;
      const deposited = posts.filter((p) => (p.postStatus ?? p.status) === "DEPOSITED").length;
      const sold      = posts.filter((p) => (p.postStatus ?? p.status) === "SOLD").length;
      const approved  = posts.filter((p) =>
        ["AVAILABLE", "DEPOSITED", "SOLD"].includes(p.postStatus ?? p.status)
      ).length;

      // ── Users ──────────────────────────────────────────
      const users     = usersRes.status === "fulfilled" ? parseList(usersRes.value) : [];
      const pendingU  = users.filter((u) =>
        (u.status ?? u.accountStatus ?? u.userStatus ?? "").toUpperCase() === "PENDING" ||
        u.isVerified === false || u.verified === false
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      ).length;

      // ── Posting fee & revenue ──────────────────────────
      let postingFee = POSTING_FEE_FALLBACK;
      if (feeRes.status === "fulfilled") {
        const raw = feeRes.value?.result ?? feeRes.value?.data ?? feeRes.value;
<<<<<<< HEAD
        const v =
          typeof raw === "string"
            ? raw
            : (raw?.configValue ?? raw?.config_value ?? String(raw ?? ""));
=======
        const v = typeof raw === "string" ? raw : raw?.configValue ?? raw?.config_value ?? String(raw ?? "");
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
        const n = parseFloat(v);
        if (!isNaN(n) && n > 0) postingFee = n;
      }
      // Doanh thu = số bài đã submit × phí
<<<<<<< HEAD
      const submittedPosts = posts.filter(
        (p) => (p.postStatus ?? p.status ?? "") !== "DRAFTED",
=======
      const submittedPosts = posts.filter((p) =>
        (p.postStatus ?? p.status ?? "") !== "DRAFTED"
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      ).length;
      const revenue = submittedPosts * postingFee;

      // ── Transactions ───────────────────────────────────
      const txList = txRes.status === "fulfilled" ? parseList(txRes.value) : [];
      const txToday = txList.filter((tx) => {
        const d = new Date(tx.createdAt ?? "");
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }).length;

      // ── Inspections ────────────────────────────────────
<<<<<<< HEAD
      const inspList =
        inspRes.status === "fulfilled" ? parseList(inspRes.value) : [];
=======
      const inspList  = inspRes.status === "fulfilled" ? parseList(inspRes.value) : [];
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      const inspCount = inspList.length || approved; // fallback: approved posts đều đã qua inspection

      setStats({
        totalUsers: users.length,
        pendingUsers: pendingU,
        totalPosts: posts.length,
        pendingPosts: pending,
        availablePosts: available,
        depositedPosts: deposited,
        soldPosts: sold,
        revenue,
        postingFee,
        txToday,
        inspCount,
      });

      // ── Recent posts (5 bài mới nhất, có ảnh) ─────────
      const sorted = [...posts]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 5);
<<<<<<< HEAD
      setRecentPosts(
        sorted.map((p) => ({
          id: p.postId ?? p.id,
          title: p.bicycleName ?? p.title ?? "—",
          seller: p.sellerFullName ?? p.sellerName ?? "—",
          status: p.postStatus ?? p.status ?? "—",
          price: typeof p.price === "number" ? formatCurrency(p.price) : "—",
          thumb: extractThumb(p),
          date: p.createdAt ?? null,
        })),
      );
=======
      setRecentPosts(sorted.map((p) => ({
        id:     p.postId ?? p.id,
        title:  p.bicycleName ?? p.title ?? "—",
        seller: p.sellerFullName ?? p.sellerName ?? "—",
        status: p.postStatus ?? p.status ?? "—",
        price:  typeof (p.price) === "number" ? formatCurrency(p.price) : "—",
        thumb:  extractThumb(p),
        date:   p.createdAt ?? null,
      })));
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b

      // ── Recent users (5 user mới nhất) ─────────────────
      const sortedU = [...users]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 5);
<<<<<<< HEAD
      setRecentUsers(
        sortedU.map((u) => ({
          id: u.userId ?? u.id,
          name: u.fullName ?? u.name ?? u.email ?? "—",
          email: u.email ?? "—",
          role: u.role ?? u.userRole ?? "USER",
          status: u.status ?? u.accountStatus ?? "ACTIVE",
          date: u.createdAt ?? null,
        })),
      );
=======
      setRecentUsers(sortedU.map((u) => ({
        id:     u.userId ?? u.id,
        name:   u.fullName ?? u.name ?? u.email ?? "—",
        email:  u.email ?? "—",
        role:   u.role ?? u.userRole ?? "USER",
        status: u.status ?? u.accountStatus ?? "ACTIVE",
        date:   u.createdAt ?? null,
      })));
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
    } catch (err) {
      console.warn("AdminDashboard: load failed", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    load();
  }, [load]);

  // ─── Stat cards config ────────────────────────────────────────────────────
  const statCards = stats
    ? [
        {
          icon: <Users />,
          tone: "blue",
          label: "Members",
          value: stats.totalUsers,
          sub:
            stats.pendingUsers > 0
              ? `${stats.pendingUsers} pending`
              : "All approved",
          href: "/admin-users",
        },
        {
          icon: <FileText />,
          tone: "indigo",
          label: "Listings",
          value: stats.totalPosts,
          sub: `${stats.pendingPosts} pending inspection · ${stats.availablePosts} on sale`,
          href: "/admin-listings",
        },
        {
          icon: <DollarSign />,
          tone: "green",
          label: "Posting fee revenue",
          value: formatCurrency(stats.revenue),
          sub: `${stats.postingFee === POSTING_FEE_FALLBACK ? "" : ""}${formatCurrency(stats.postingFee)} / listing`,
          href: "/admin-revenue",
        },
        {
          icon: <ShieldCheck />,
          tone: "teal",
          label: "Inspected",
          value: stats.inspCount,
          sub: `${stats.soldPosts} sold · ${stats.depositedPosts} deposited`,
          href: "/admin-inspection-reports",
        },
      ]
    : [];

  // ─── Quick link cards ──────────────────────────────────────────────────────
  const quickLinks = [
    {
      label: "Review listings",
      icon: <Clock size={20} />,
      href: "/admin-listings",
      color: "#f59e0b",
    },
    {
      label: "Approved listings",
      icon: <CheckCircle size={20} />,
      href: "/admin-approved-listings",
      color: "#10b981",
    },
    {
      label: "User management",
      icon: <Users size={20} />,
      href: "/admin-users",
      color: "#3b82f6",
    },
    {
      label: "Revenue",
      icon: <TrendingUp size={20} />,
      href: "/admin-revenue",
      color: "#8b5cf6",
    },
    {
      label: "Inspection",
      icon: <ShieldCheck size={20} />,
      href: "/admin-inspection-reports",
      color: "#00ccad",
    },
    {
      label: "Transactions",
      icon: <ShoppingCart size={20} />,
      href: "/admin-transactions",
      color: "#ec4899",
    },
  ];

  const STATUS_BADGE = {
    PENDING: { label: "Pending", bg: "#fef3c7", color: "#b45309" },
    ADMIN_APPROVED: { label: "Await insp", bg: "#dbeafe", color: "#1d4ed8" },
    AVAILABLE: { label: "Sale", bg: "#dcfce7", color: "#15803d" },
    DEPOSITED: { label: "Deposit", bg: "#ffedd5", color: "#c2410c" },
    SOLD: { label: "Sold", bg: "#ede9fe", color: "#6d28d9" },
    REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#b91c1c" },
=======
  useEffect(() => { load(); }, [load]);

  // ─── Stat cards config ────────────────────────────────────────────────────
  const statCards = stats ? [
    {
      icon: <Users />, tone: "blue",
      label: "Members", value: stats.totalUsers,
      sub: stats.pendingUsers > 0 ? `${stats.pendingUsers} pending` : "All approved",
      href: "/admin-users",
    },
    {
      icon: <FileText />, tone: "indigo",
      label: "Listings", value: stats.totalPosts,
      sub: `${stats.pendingPosts} pending inspection · ${stats.availablePosts} on sale`,
      href: "/admin-listings",
    },
    {
      icon: <DollarSign />, tone: "green",
      label: "Posting fee revenue", value: formatCurrency(stats.revenue),
      sub: `${stats.postingFee === POSTING_FEE_FALLBACK ? "" : ""}${formatCurrency(stats.postingFee)} / listing`,
      href: "/admin-revenue",
    },
    {
      icon: <ShieldCheck />, tone: "teal",
      label: "Inspected", value: stats.inspCount,
      sub: `${stats.soldPosts} sold · ${stats.depositedPosts} deposited`,
      href: "/admin-inspection-reports",
    },
  ] : [];

  // ─── Quick link cards ──────────────────────────────────────────────────────
  const quickLinks = [
    { label: "Review listings",     icon: <Clock size={20} />,       href: "/admin-listings",            color: "#f59e0b" },
    { label: "Approved listings",    icon: <CheckCircle size={20} />, href: "/admin-approved-listings",   color: "#10b981" },
    { label: "User management",      icon: <Users size={20} />,       href: "/admin-users",               color: "#3b82f6" },
    { label: "Revenue",              icon: <TrendingUp size={20} />,  href: "/admin-revenue",             color: "#8b5cf6" },
    { label: "Inspection",           icon: <ShieldCheck size={20} />, href: "/admin-inspection-reports",  color: "#00ccad" },
    { label: "Transactions",         icon: <ShoppingCart size={20} />,href: "/admin-transactions",        color: "#ec4899" },
  ];

  const STATUS_BADGE = {
    PENDING:        { label: "Pending",     bg: "#fef3c7", color: "#b45309" },
    ADMIN_APPROVED: { label: "Await insp", bg: "#dbeafe", color: "#1d4ed8" },
    AVAILABLE:      { label: "Sale",     bg: "#dcfce7", color: "#15803d" },
    DEPOSITED:      { label: "Deposit",     bg: "#ffedd5", color: "#c2410c" },
    SOLD:           { label: "Sold",  bg: "#ede9fe", color: "#6d28d9" },
    REJECTED:       { label: "Rejected", bg: "#fee2e2", color: "#b91c1c" },
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard-page">
        <div className="admin-dashboard">
          <div className="admin-content">
<<<<<<< HEAD
            <header className="admin-page-header">
              <h1 className="admin-page-title">System overview</h1>
              <p className="admin-page-subtitle">
=======

            {/* ── Header ── */}
            <header style={{ marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                System overview
              </h1>
              <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                Live data from database · BASAUYCLE Admin
              </p>
            </header>

            {/* ── Stat cards ── */}
            <section className="admin-stats dash-stats-grid">
              {loading
                ? [1, 2, 3, 4].map((i) => (
<<<<<<< HEAD
                    <div
                      key={i}
                      className="admin-card admin-stat-card dash-skeleton"
                    />
=======
                    <div key={i} className="admin-card admin-stat-card dash-skeleton" />
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                  ))
                : statCards.map((c) => (
                    <div
                      key={c.label}
                      className="admin-card admin-stat-card dash-stat-clickable"
                      onClick={() => navigate(c.href)}
                      title={`Đến ${c.label}`}
                    >
                      <div className="admin-stat-top">
<<<<<<< HEAD
                        <div className={`admin-stat-icon ${c.tone}`}>
                          {c.icon}
                        </div>
=======
                        <div className={`admin-stat-icon ${c.tone}`}>{c.icon}</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                        <ArrowRight size={14} color="#cbd5e1" />
                      </div>
                      <div className="admin-stat-title">{c.label}</div>
                      <div className="admin-stat-value">{c.value}</div>
                      <div className="dash-stat-sub">{c.sub}</div>
                    </div>
                  ))}
            </section>

            {/* ── Quick links ── */}
            <section className="admin-card" style={{ padding: "18px 20px" }}>
<<<<<<< HEAD
              <div className="admin-card-title" style={{ marginBottom: 14 }}>
                Quick access
              </div>
=======
              <div className="admin-card-title" style={{ marginBottom: 14 }}>Quick access</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
              <div className="dash-quick-grid">
                {quickLinks.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    className="dash-quick-btn"
                    onClick={() => navigate(q.href)}
                    style={{ "--ql-color": q.color }}
                  >
<<<<<<< HEAD
                    <span
                      className="dash-quick-icon"
                      style={{ color: q.color, background: `${q.color}18` }}
                    >
=======
                    <span className="dash-quick-icon" style={{ color: q.color, background: `${q.color}18` }}>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                      {q.icon}
                    </span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Two columns: recent posts + recent users ── */}
            <div className="dash-two-col">
<<<<<<< HEAD
=======

>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
              {/* Recent posts */}
              <section className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">Recent listings</div>
<<<<<<< HEAD
                    <div className="admin-card-subtitle">
                      {recentPosts.length} latest
                    </div>
=======
                    <div className="admin-card-subtitle">{recentPosts.length} latest</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                  </div>
                  <button
                    type="button"
                    className="dash-see-all"
                    onClick={() => navigate("/admin-listings")}
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>

                <div className="dash-list">
                  {loading ? (
<<<<<<< HEAD
                    [1, 2, 3].map((i) => (
                      <div key={i} className="dash-list-skeleton" />
                    ))
=======
                    [1, 2, 3].map((i) => <div key={i} className="dash-list-skeleton" />)
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                  ) : recentPosts.length === 0 ? (
                    <div className="dash-empty">
                      <AlertCircle size={20} color="#cbd5e1" />
                      <span>No listings yet</span>
                    </div>
                  ) : (
                    recentPosts.map((p) => {
<<<<<<< HEAD
                      const badge = STATUS_BADGE[p.status] ?? {
                        label: p.status,
                        bg: "#f1f5f9",
                        color: "#64748b",
                      };
=======
                      const badge = STATUS_BADGE[p.status] ?? { label: p.status, bg: "#f1f5f9", color: "#64748b" };
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                      return (
                        <div
                          key={p.id}
                          className="dash-list-row dash-list-row-click"
                          onClick={() => navigate(`/admin-listings`)}
                        >
                          {p.thumb ? (
<<<<<<< HEAD
                            <img
                              src={p.thumb}
                              alt={p.title}
                              className="dash-list-thumb"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
=======
                            <img src={p.thumb} alt={p.title} className="dash-list-thumb"
                              onError={(e) => { e.currentTarget.style.display = "none"; }} />
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                          ) : (
                            <div className="dash-list-thumb-ph" />
                          )}
                          <div className="dash-list-info">
                            <div className="dash-list-title">{p.title}</div>
<<<<<<< HEAD
                            <div className="dash-list-sub">
                              {p.seller} · {p.price}
                            </div>
=======
                            <div className="dash-list-sub">{p.seller} · {p.price}</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                          </div>
                          <span
                            className="dash-badge"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Recent users */}
              <section className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">Recent members</div>
<<<<<<< HEAD
                    <div className="admin-card-subtitle">
                      {recentUsers.length} latest
                    </div>
=======
                    <div className="admin-card-subtitle">{recentUsers.length} latest</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                  </div>
                  <button
                    type="button"
                    className="dash-see-all"
                    onClick={() => navigate("/admin-users")}
                  >
                    View all <ArrowRight size={13} />
                  </button>
                </div>

                <div className="dash-list">
                  {loading ? (
<<<<<<< HEAD
                    [1, 2, 3].map((i) => (
                      <div key={i} className="dash-list-skeleton" />
                    ))
=======
                    [1, 2, 3].map((i) => <div key={i} className="dash-list-skeleton" />)
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                  ) : recentUsers.length === 0 ? (
                    <div className="dash-empty">
                      <AlertCircle size={20} color="#cbd5e1" />
                      <span>No members yet</span>
                    </div>
                  ) : (
                    recentUsers.map((u) => {
<<<<<<< HEAD
                      const isAdmin = (u.role ?? "")
                        .toUpperCase()
                        .includes("ADMIN");
                      const isInsp = (u.role ?? "")
                        .toUpperCase()
                        .includes("INSPECTOR");
                      const roleColor = isAdmin
                        ? "#7c3aed"
                        : isInsp
                          ? "#0284c7"
                          : "#64748b";
                      const roleLabel = isAdmin
                        ? "Admin"
                        : isInsp
                          ? "Inspector"
                          : "User";
=======
                      const isAdmin = (u.role ?? "").toUpperCase().includes("ADMIN");
                      const isInsp  = (u.role ?? "").toUpperCase().includes("INSPECTOR");
                      const roleColor = isAdmin ? "#7c3aed" : isInsp ? "#0284c7" : "#64748b";
                      const roleLabel = isAdmin ? "Admin" : isInsp ? "Inspector" : "User";
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                      return (
                        <div
                          key={u.id}
                          className="dash-list-row dash-list-row-click"
                          onClick={() => navigate("/admin-users")}
                        >
<<<<<<< HEAD
                          <div
                            className="dash-user-avatar"
                            style={{
                              background: `${roleColor}18`,
                              color: roleColor,
                            }}
                          >
=======
                          <div className="dash-user-avatar" style={{ background: `${roleColor}18`, color: roleColor }}>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                            {(u.name[0] ?? "?").toUpperCase()}
                          </div>
                          <div className="dash-list-info">
                            <div className="dash-list-title">{u.name}</div>
                            <div className="dash-list-sub">{u.email}</div>
                          </div>
                          <span
                            className="dash-badge"
<<<<<<< HEAD
                            style={{
                              background: `${roleColor}14`,
                              color: roleColor,
                            }}
=======
                            style={{ background: `${roleColor}14`, color: roleColor }}
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                          >
                            {roleLabel}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
<<<<<<< HEAD
=======

>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

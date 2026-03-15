import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
<<<<<<< HEAD
  Search,
  FileCheck2,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
=======
  Search, FileCheck2, Eye, Filter,
  CheckCircle2, XCircle, Clock,
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
} from "lucide-react";
import axiosInstance from "../../../services/axiosConfig";
import adminPostService from "../../../services/adminPostService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import "../dashboard/index.css";
import "./index.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const RESULT_CONFIG = {
  PASS: { label: "Pass", className: "pass" },
  FAIL: { label: "Fail", className: "fail" },
};

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "approved" },
<<<<<<< HEAD
  REJECTED: { label: "Rejected", icon: XCircle, className: "rejected" },
  PENDING: { label: "Pending", icon: Clock, className: "pending" },
};

const INSPECTED_STATUSES = [
  "AVAILABLE",
  "DEPOSITED",
  "SOLD",
  "REJECTED",
  "HIDDEN",
];

/** Lấy chữ cái đầu để hiển thị avatar (inspector) */
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (trimmed === "—") return "—";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}
=======
  REJECTED: { label: "Rejected", icon: XCircle,     className: "rejected" },
  PENDING:  { label: "Pending",  icon: Clock,        className: "pending"  },
};

const INSPECTED_STATUSES = ["AVAILABLE", "DEPOSITED", "SOLD", "REJECTED", "HIDDEN"];
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseList(res) {
  const raw = res?.result ?? res?.data ?? res;
<<<<<<< HEAD
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.reports)) return raw.reports;
  if (Array.isArray(raw?.data)) return raw.data;
  if (raw && typeof raw === "object") return [raw];
=======
  if (Array.isArray(raw))              return raw;
  if (Array.isArray(raw?.content))     return raw.content;
  if (Array.isArray(raw?.reports))     return raw.reports;
  if (Array.isArray(raw?.data))        return raw.data;
  if (raw && typeof raw === "object")  return [raw];
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
  return null;
}

function normalizeReport(row) {
<<<<<<< HEAD
  const result = row.result ?? row.inspectionResult ?? null;
  const status =
    row.status ??
    row.postStatus ??
    (result === "PASS"
      ? "APPROVED"
      : result === "FAIL"
        ? "REJECTED"
        : "PENDING");

  return {
    id: row.reportId ?? row.id ?? row.postId,
    postId: row.postId ?? row.bicyclePostId ?? row.id,
    title:
      row.bicycleName ?? row.listingTitle ?? row.title ?? row.postTitle ?? "—",
    thumbnail:
      (row.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
      row.images?.[0]?.imageUrl ??
      row.thumbnailUrl ??
      row.thumbnail ??
      row.imageUrl ??
      null,
    seller: row.sellerFullName ?? row.sellerName ?? row.seller ?? "—",
    inspector:
      row.inspectorName ?? row.inspectorFullName ?? row.inspector ?? "—",
    inspectedAt:
      row.inspectedAt ??
      row.completedAt ??
      row.updatedAt ??
      row.createdAt ??
      null,
    result: result,
    status: status,
    overallCondition: row.overallCondition ?? row.condition ?? null,
    notes: row.notes ?? row.inspectorNotes ?? null,
    price: row.price ?? row.salePrice ?? null,
=======
  const result  = row.result ?? row.inspectionResult ?? null;
  const status  =
    row.status ?? row.postStatus ??
    (result === "PASS" ? "APPROVED" : result === "FAIL" ? "REJECTED" : "PENDING");

  return {
    id:           row.reportId    ?? row.id           ?? row.postId,
    postId:       row.postId      ?? row.bicyclePostId ?? row.id,
    title:        row.bicycleName ?? row.listingTitle  ?? row.title ?? row.postTitle ?? "—",
    thumbnail:
      (row.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
      row.images?.[0]?.imageUrl ??
      row.thumbnailUrl ?? row.thumbnail ?? row.imageUrl ?? null,
    seller:       row.sellerFullName ?? row.sellerName ?? row.seller ?? "—",
    inspector:    row.inspectorName  ?? row.inspectorFullName ?? row.inspector ?? "—",
    inspectedAt:  row.inspectedAt   ?? row.completedAt ?? row.updatedAt ?? row.createdAt ?? null,
    result:       result,
    status:       status,
    overallCondition: row.overallCondition ?? row.condition ?? null,
    notes:        row.notes ?? row.inspectorNotes ?? null,
    price:        row.price ?? row.salePrice ?? null,
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminInspectionReports() {
<<<<<<< HEAD
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
=======
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  // ── Fetch strategy ────────────────────────────────────────────────────────

  /** Chiến lược 1: admin endpoint tổng hợp */
  /** Chiến lược 1: thử trực tiếp các admin/inspection endpoint */
  const tryDirectEndpoints = useCallback(async () => {
    const URLS = [
      "/admin/inspection/reports",
      "/admin/inspections",
<<<<<<< HEAD
      "/inspection/completed", // inspector endpoint – admin có thể gọi được
=======
      "/inspection/completed",      // inspector endpoint – admin có thể gọi được
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      "/inspection/reports",
    ];
    for (const url of URLS) {
      try {
<<<<<<< HEAD
        const res = await axiosInstance.get(url);
=======
        const res  = await axiosInstance.get(url);
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
        const list = parseList(res);
        if (list && list.length > 0) {
          console.info(`AdminReports: ✓ ${url} → ${list.length}`);
          return list.map(normalizeReport);
        }
      } catch (err) {
        const s = err?.status ?? 0;
<<<<<<< HEAD
        if (s !== 404 && s !== 403)
          console.warn(`AdminReports: ${url} →`, err?.message);
=======
        if (s !== 404 && s !== 403) console.warn(`AdminReports: ${url} →`, err?.message);
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      }
    }
    return null;
  }, []);

  /** Chiến lược 2: getAllPosts → per-post report fetch */
  const fetchPerPost = useCallback(async () => {
    // a) Lấy tất cả posts (1 lần duy nhất)
    let allPosts = [];
    try {
      const res = await adminPostService.getAllPosts();
      const raw = res?.result ?? res?.data ?? res;
<<<<<<< HEAD
      allPosts = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
=======
      allPosts = Array.isArray(raw) ? raw
        : Array.isArray(raw?.content) ? raw.content
        : Array.isArray(raw?.data)    ? raw.data
        : [];
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
    } catch {
      // getAllPosts thất bại → thử từng status
      const settled = await Promise.allSettled(
        INSPECTED_STATUSES.map((s) => adminPostService.getPostsByStatus(s)),
      );
      allPosts = settled
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => {
          const raw = r.value?.result ?? r.value?.data ?? r.value;
<<<<<<< HEAD
          return Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
=======
          return Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
        });
    }

    // Chỉ giữ các post đã qua kiểm định
    const inspectedPosts = allPosts.filter((p) => {
      const st = p.postStatus ?? p.status ?? "";
      return INSPECTED_STATUSES.includes(st);
    });

    if (!inspectedPosts.length) return [];

    // b) Với mỗi post, thử lấy inspection report; nếu không có → dùng dữ liệu post làm minimal report
    const reportResults = await Promise.allSettled(
      inspectedPosts.map(async (p) => {
        const pid = p.postId ?? p.id;
        if (!pid) return null;

        const postStatus = p.postStatus ?? p.status ?? "";
        const baseInfo = {
<<<<<<< HEAD
          postId: pid,
          bicycleName: p.bicycleName ?? p.title,
          sellerFullName: p.sellerFullName ?? p.sellerName,
          thumbnailUrl:
            (p.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
            p.images?.[0]?.imageUrl ??
            p.thumbnailUrl ??
            p.thumbnail ??
            p.imageUrl,
          price: p.price ?? p.salePrice,
          status: postStatus === "REJECTED" ? "REJECTED" : "APPROVED",
          result: postStatus === "REJECTED" ? "FAIL" : "PASS",
          inspectedAt: p.updatedAt ?? p.inspectedAt ?? p.createdAt,
=======
          postId:        pid,
          bicycleName:   p.bicycleName ?? p.title,
          sellerFullName:p.sellerFullName ?? p.sellerName,
          thumbnailUrl:
            (p.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
            p.images?.[0]?.imageUrl ??
            p.thumbnailUrl ?? p.thumbnail ?? p.imageUrl,
          price:         p.price ?? p.salePrice,
          status:        postStatus === "REJECTED" ? "REJECTED" : "APPROVED",
          result:        postStatus === "REJECTED" ? "FAIL" : "PASS",
          inspectedAt:   p.updatedAt ?? p.inspectedAt ?? p.createdAt,
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
        };

        // Thử lấy full report
        for (const url of [
          `/inspection/${pid}/report`,
          `/admin/inspection/${pid}`,
          `/inspection/${pid}`,
        ]) {
          try {
            const res = await axiosInstance.get(url);
            const raw = res?.result ?? res?.data ?? res;
            if (raw && typeof raw === "object") {
              return normalizeReport({ ...baseInfo, ...raw });
            }
          } catch {
            // thử URL tiếp
          }
        }

        // Không lấy được report → dùng minimal từ post
        return normalizeReport(baseInfo);
      }),
    );

    return reportResults
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => r.value);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      let list = await tryDirectEndpoints();
      if (!list || list.length === 0) {
        console.info("AdminReports: fallback → per-post fetch");
        list = await fetchPerPost();
      }
      // Sắp xếp mới nhất trước
<<<<<<< HEAD
      list.sort(
        (a, b) => new Date(b.inspectedAt ?? 0) - new Date(a.inspectedAt ?? 0),
      );
=======
      list.sort((a, b) => new Date(b.inspectedAt ?? 0) - new Date(a.inspectedAt ?? 0));
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      setReports(list);
    } catch (err) {
      console.warn("AdminReports: fetch failed", err?.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [tryDirectEndpoints, fetchPerPost]);

<<<<<<< HEAD
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
=======
  useEffect(() => { fetchAll(); }, [fetchAll]);
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.inspector.toLowerCase().includes(q) ||
        r.seller.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        r.status === statusFilter ||
        (statusFilter === "APPROVED" && r.result === "PASS") ||
        (statusFilter === "REJECTED" && r.result === "FAIL");
      return matchQ && matchStatus;
    });
  }, [reports, search, statusFilter]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-inspection-reports-page">
        <div className="admin-dashboard">
          <div className="admin-content">
<<<<<<< HEAD
            {/* Header */}
            <header
              className="admin-topbar"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <h1 className="admin-page-title">Inspection history</h1>
                <p className="admin-page-subtitle">
                  All listings inspected by inspectors · {reports.length}{" "}
                  reports
=======

            {/* Header */}
            <header className="admin-topbar" style={{ flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 className="admin-page-title">Inspection history</h1>
                <p className="admin-page-subtitle">
                  All listings inspected by inspectors · {reports.length} reports
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                </p>
              </div>
            </header>

            {/* Stats mini */}
            <div className="admin-ir-stats">
              {[
                {
                  label: "Total reports",
                  value: reports.length,
                  color: "#64748b",
                },
                {
                  label: "Pass",
                  value: reports.filter((r) => r.result === "PASS").length,
                  color: "#10b981",
                },
                {
                  label: "Fail",
                  value: reports.filter((r) => r.result === "FAIL").length,
                  color: "#ef4444",
                },
                {
                  label: "Pending",
                  value: reports.filter((r) => !r.result).length,
                  color: "#d97706",
                },
              ].map((s) => (
                <div key={s.label} className="admin-card admin-ir-stat">
<<<<<<< HEAD
                  <span
                    className="admin-ir-stat-val"
                    style={{ color: s.color }}
                  >
=======
                  <span className="admin-ir-stat-val" style={{ color: s.color }}>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                    {s.value}
                  </span>
                  <span className="admin-ir-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Filters */}
            <section className="admin-card admin-table-card">
              <div className="admin-card-header">
                <div className="admin-approved-filters">
                  <div className="admin-search-wrap">
                    <Search className="admin-search-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Search by bike name, inspector, seller..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="admin-search-input"
                    />
                  </div>
                  <div className="admin-filter-wrap">
                    <Filter size={14} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="admin-pill"
                    >
                      <option value="all">Tất cả</option>
                      <option value="APPROVED">Đã duyệt (Pass)</option>
                      <option value="REJECTED">Từ chối (Fail)</option>
                      <option value="PENDING">Đang chờ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="admin-table admin-reports-table">
                <div className="admin-table-row admin-table-header">
                  <div>Bike / Seller</div>
                  <div>Inspector</div>
                  <div>Inspection time</div>
                  <div>Condition</div>
                  <div>Result</div>
                  <div>Status</div>
                </div>

                {loading ? (
<<<<<<< HEAD
                  <div className="admin-table-empty">
                    Loading inspection reports…
                  </div>
=======
                  <div className="admin-table-empty">Loading inspection reports…</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                ) : filtered.length === 0 ? (
                  <div className="admin-table-empty">
                    <FileCheck2 size={32} color="#cbd5e1" />
                    <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                      No inspection reports yet.
                    </p>
                  </div>
                ) : (
                  filtered.map((row, idx) => {
<<<<<<< HEAD
                    const statusCfg =
                      STATUS_CONFIG[row.status] ?? STATUS_CONFIG.PENDING;
=======
                    const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.PENDING;
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                    const resultCfg = RESULT_CONFIG[row.result];
                    const Icon = statusCfg.icon;
                    const isExpanded = expanded === (row.postId ?? row.id);

                    return (
                      <div key={row.id ?? idx}>
                        <div className="admin-table-row admin-ir-row">
                          {/* Xe + seller */}
                          <div
                            className="admin-ir-bike admin-ir-bike-link"
<<<<<<< HEAD
                            onClick={() =>
                              row.postId && setPreviewId(row.postId)
                            }
=======
                            onClick={() => row.postId && setPreviewId(row.postId)}
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                            title={row.postId ? "View listing" : undefined}
                          >
                            {row.thumbnail ? (
                              <img
                                src={row.thumbnail}
                                alt={row.title}
                                className="admin-ir-thumb"
<<<<<<< HEAD
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
=======
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                              />
                            ) : (
                              <div className="admin-ir-thumb-placeholder" />
                            )}
                            <div>
<<<<<<< HEAD
                              <div className="admin-ir-bike-name">
                                {row.title}
                              </div>
                              <div className="admin-ir-seller">
                                {row.seller}
                              </div>
=======
                              <div className="admin-ir-bike-name">{row.title}</div>
                              <div className="admin-ir-seller">{row.seller}</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                              {row.price && (
                                <div className="admin-ir-price">
                                  {formatCurrency(row.price)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inspector */}
<<<<<<< HEAD
                          <div className="admin-ir-inspector">
                            {row.inspector && row.inspector !== "—" ? (
                              <div
                                className="admin-account-cell"
                                title={row.inspector}
                              >
                                <span className="admin-account-avatar">
                                  {getInitials(row.inspector)}
                                </span>
                                <span className="admin-account-name">
                                  {row.inspector}
                                </span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </div>
=======
                          <div className="admin-ir-inspector">{row.inspector}</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b

                          {/* Thời gian */}
                          <div className="admin-ir-date">
                            {row.inspectedAt
<<<<<<< HEAD
                              ? new Date(row.inspectedAt).toLocaleString(
                                  "en-US",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
=======
                              ? new Date(row.inspectedAt).toLocaleString("en-US", {
                                  day: "2-digit", month: "2-digit", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                              : "—"}
                          </div>

                          {/* Overall condition */}
                          <div className="admin-ir-condition">
                            {row.overallCondition ?? "—"}
                          </div>

                          {/* Result */}
                          <div>
                            {resultCfg ? (
<<<<<<< HEAD
                              <span
                                className={`admin-report-result ${resultCfg.className}`}
                              >
                                {resultCfg.label}
                              </span>
                            ) : (
                              <span className="admin-report-result pending">
                                Pending
                              </span>
=======
                              <span className={`admin-report-result ${resultCfg.className}`}>
                                {resultCfg.label}
                              </span>
                            ) : (
                              <span className="admin-report-result pending">Pending</span>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                            )}
                          </div>

                          {/* Status + expand */}
                          <div className="admin-ir-status-cell">
<<<<<<< HEAD
                            <span
                              className={`admin-report-status ${statusCfg.className}`}
                            >
=======
                            <span className={`admin-report-status ${statusCfg.className}`}>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                              <Icon size={12} /> {statusCfg.label}
                            </span>
                            {row.notes && (
                              <button
                                type="button"
                                className="admin-ir-expand-btn"
                                title="View inspector notes"
                                onClick={() =>
<<<<<<< HEAD
                                  setExpanded(
                                    isExpanded ? null : (row.postId ?? row.id),
                                  )
=======
                                  setExpanded(isExpanded ? null : (row.postId ?? row.id))
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                                }
                              >
                                <Eye size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notes row (expand) */}
                        {isExpanded && row.notes && (
                          <div className="admin-ir-notes-row">
<<<<<<< HEAD
                            <span className="admin-ir-notes-label">
                              Inspector notes:
                            </span>
                            <span className="admin-ir-notes-text">
                              {row.notes}
                            </span>
=======
                            <span className="admin-ir-notes-label">Inspector notes:</span>
                            <span className="admin-ir-notes-text">{row.notes}</span>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
                          </div>
                        )}
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
      <ProductPreviewModal
        postId={previewId}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
      />
    </AdminLayout>
  );
}

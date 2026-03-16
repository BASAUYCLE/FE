import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Search, FileCheck2, Eye, Filter,
  CheckCircle2, XCircle, Clock,
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
  REJECTED: { label: "Rejected", icon: XCircle,     className: "rejected" },
  PENDING:  { label: "Pending",  icon: Clock,        className: "pending"  },
};

const INSPECTED_STATUSES = ["AVAILABLE", "DEPOSITED", "SOLD", "REJECTED", "HIDDEN"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw))              return raw;
  if (Array.isArray(raw?.content))     return raw.content;
  if (Array.isArray(raw?.reports))     return raw.reports;
  if (Array.isArray(raw?.data))        return raw.data;
  if (raw && typeof raw === "object")  return [raw];
  return null;
}

function normalizeReport(row) {
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
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminInspectionReports() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
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
      "/inspection/completed",      // inspector endpoint – admin có thể gọi được
      "/inspection/reports",
    ];
    for (const url of URLS) {
      try {
        const res  = await axiosInstance.get(url);
        const list = parseList(res);
        if (list && list.length > 0) {
          console.info(`AdminReports: ✓ ${url} → ${list.length}`);
          return list.map(normalizeReport);
        }
      } catch (err) {
        const s = err?.status ?? 0;
        if (s !== 404 && s !== 403) console.warn(`AdminReports: ${url} →`, err?.message);
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
      allPosts = Array.isArray(raw) ? raw
        : Array.isArray(raw?.content) ? raw.content
        : Array.isArray(raw?.data)    ? raw.data
        : [];
    } catch {
      // getAllPosts thất bại → thử từng status
      const settled = await Promise.allSettled(
        INSPECTED_STATUSES.map((s) => adminPostService.getPostsByStatus(s)),
      );
      allPosts = settled
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => {
          const raw = r.value?.result ?? r.value?.data ?? r.value;
          return Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
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
      list.sort((a, b) => new Date(b.inspectedAt ?? 0) - new Date(a.inspectedAt ?? 0));
      setReports(list);
    } catch (err) {
      console.warn("AdminReports: fetch failed", err?.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [tryDirectEndpoints, fetchPerPost]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

            {/* Header */}
            <header className="admin-topbar" style={{ flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 className="admin-page-title">Inspection history</h1>
                <p className="admin-page-subtitle">
                  All listings inspected by inspectors · {reports.length} reports
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
                  <span className="admin-ir-stat-val" style={{ color: s.color }}>
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
                  <div className="admin-table-empty">Loading inspection reports…</div>
                ) : filtered.length === 0 ? (
                  <div className="admin-table-empty">
                    <FileCheck2 size={32} color="#cbd5e1" />
                    <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                      No inspection reports yet.
                    </p>
                  </div>
                ) : (
                  filtered.map((row, idx) => {
                    const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.PENDING;
                    const resultCfg = RESULT_CONFIG[row.result];
                    const Icon = statusCfg.icon;
                    const isExpanded = expanded === (row.postId ?? row.id);

                    return (
                      <div key={row.id ?? idx}>
                        <div className="admin-table-row admin-ir-row">
                          {/* Xe + seller */}
                          <div
                            className="admin-ir-bike admin-ir-bike-link"
                            onClick={() => row.postId && setPreviewId(row.postId)}
                            title={row.postId ? "View listing" : undefined}
                          >
                            {row.thumbnail ? (
                              <img
                                src={row.thumbnail}
                                alt={row.title}
                                className="admin-ir-thumb"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            ) : (
                              <div className="admin-ir-thumb-placeholder" />
                            )}
                            <div>
                              <div className="admin-ir-bike-name">{row.title}</div>
                              <div className="admin-ir-seller">{row.seller}</div>
                              {row.price && (
                                <div className="admin-ir-price">
                                  {formatCurrency(row.price)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inspector */}
                          <div className="admin-ir-inspector">{row.inspector}</div>

                          {/* Thời gian */}
                          <div className="admin-ir-date">
                            {row.inspectedAt
                              ? new Date(row.inspectedAt).toLocaleString("en-US", {
                                  day: "2-digit", month: "2-digit", year: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </div>

                          {/* Overall condition */}
                          <div className="admin-ir-condition">
                            {row.overallCondition ?? "—"}
                          </div>

                          {/* Result */}
                          <div>
                            {resultCfg ? (
                              <span className={`admin-report-result ${resultCfg.className}`}>
                                {resultCfg.label}
                              </span>
                            ) : (
                              <span className="admin-report-result pending">Pending</span>
                            )}
                          </div>

                          {/* Status + expand */}
                          <div className="admin-ir-status-cell">
                            <span className={`admin-report-status ${statusCfg.className}`}>
                              <Icon size={12} /> {statusCfg.label}
                            </span>
                            {row.notes && (
                              <button
                                type="button"
                                className="admin-ir-expand-btn"
                                title="View inspector notes"
                                onClick={() =>
                                  setExpanded(isExpanded ? null : (row.postId ?? row.id))
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
                            <span className="admin-ir-notes-label">Inspector notes:</span>
                            <span className="admin-ir-notes-text">{row.notes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

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

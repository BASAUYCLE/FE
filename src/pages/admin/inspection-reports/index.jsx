import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Search,
  FileCheck2,
  Eye,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import adminPostService from "../../../services/adminPostService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import { useAuth } from "../../../contexts/AuthContext";
import "../dashboard/index.css";
import "./index.css";

// ─── Constants ───────────────────────────────────────────────────────────────

const RESULT_CONFIG = {
  PASS: { label: "Pass", className: "pass" },
  FAIL: { label: "Fail", className: "fail" },
};

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "approved" },
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
const INSPECTOR_PENDING_STATUS = "ADMIN_APPROVED";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.reports)) return raw.reports;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function normalizeReport(row) {
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
      row.inspectorName ??
      row.inspectorFullName ??
      row.inspector?.fullName ??
      row.inspector?.name ??
      row.inspectedByName ??
      row.inspectedBy ??
      row.reviewerName ??
      row.reviewer ??
      row.inspector ??
      "—",
    inspectorEmail:
      row.inspectorEmail ??
      row.inspector?.email ??
      row.reviewerEmail ??
      row.inspectedByEmail ??
      "—",
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
  };
}

function normalizeFromPost(post, historyByPostId) {
  const postId = post?.postId ?? post?.id ?? null;
  const postStatus = String(post?.postStatus ?? post?.status ?? "").toUpperCase();
  const history = postId != null ? historyByPostId.get(String(postId)) : null;

  const isInspected = INSPECTED_STATUSES.includes(postStatus);
  const status = isInspected ? (postStatus === "REJECTED" ? "REJECTED" : "APPROVED") : "PENDING";

  return normalizeReport({
    reportId: history?.reportId,
    postId,
    bicycleName: post?.bicycleName ?? post?.title ?? post?.postTitle,
    sellerFullName: post?.sellerFullName ?? post?.sellerName ?? post?.seller?.fullName,
    images: post?.images,
    thumbnailUrl:
      post?.thumbnailUrl ??
      post?.thumbnail ??
      post?.imageUrl ??
      post?.images?.find?.((i) => i?.isThumbnail)?.imageUrl ??
      post?.images?.[0]?.imageUrl,
    price: post?.price ?? post?.salePrice,
    inspectorName:
      history?.inspectorName ??
      history?.inspectorFullName ??
      history?.inspector?.fullName ??
      history?.inspector?.name ??
      history?.inspectedByName ??
      post?.inspectorName ??
      post?.inspectedByName ??
      post?.inspectedBy ??
      post?.reviewerName ??
      null,
    inspectorEmail:
      history?.inspectorEmail ??
      history?.inspector?.email ??
      history?.reviewerEmail ??
      post?.inspectorEmail ??
      post?.reviewerEmail ??
      null,
    inspectedAt:
      history?.createdAt ??
      history?.inspectedAt ??
      post?.updatedAt ??
      post?.createdAt ??
      null,
    overallCondition: history?.overallCondition ?? null,
    notes: history?.notes ?? null,
    result: history?.result ?? (isInspected ? (postStatus === "REJECTED" ? "FAIL" : "PASS") : null),
    status,
    postStatus,
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminInspectionReports() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewId, setPreviewId] = useState(null);

  const handleViewInspectorDetails = useCallback(
    (postId) => {
      if (!isAuthenticated?.()) {
        message.warning("Please sign in first.");
        navigate("/login");
        return;
      }
      const role = String(
        user?.role ?? user?.userRole ?? user?.user_role ?? "",
      ).toUpperCase();
      if (role !== "ADMIN" && role !== "INSPECTOR") {
        message.error("You are not allowed to view inspector details.");
        navigate("/unauthorized");
        return;
      }
      if (postId) {
        navigate(`/inspector/${postId}`);
        return;
      }
      navigate("/inspector/details");
    },
    [isAuthenticated, navigate, user],
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [allPostsRes, historyRes] = await Promise.all([
        adminPostService.getAllPosts(),
        adminPostService.getApprovalHistory(),
      ]);

      const allPosts = parseList(allPostsRes);
      const historyRows = parseList(historyRes);

      const historyByPostId = new Map();
      historyRows.forEach((row) => {
        const candidatePostIds = [
          row?.postId,
          row?.bicyclePostId,
          row?.post?.postId,
          row?.post?.id,
        ].filter((v) => v != null);
        if (!candidatePostIds.length) return;
        const key = String(candidatePostIds[0]);
        const prev = historyByPostId.get(key);
        const prevTs = new Date(
          prev?.createdAt ?? prev?.inspectedAt ?? prev?.updatedAt ?? 0,
        ).getTime();
        const curTs = new Date(row?.createdAt ?? 0).getTime();
        if (!prev || curTs >= prevTs) {
          historyByPostId.set(key, row);
        }
      });

      const list = allPosts
        .filter((post) => {
          const st = String(post?.postStatus ?? post?.status ?? "").toUpperCase();
          return st === INSPECTOR_PENDING_STATUS || INSPECTED_STATUSES.includes(st);
        })
        .map((post) => normalizeFromPost(post, historyByPostId))
        .filter((row) => {
          if (row.status !== "APPROVED") return true;
          const hasName = row.inspector && row.inspector !== "—";
          const hasEmail = row.inspectorEmail && row.inspectorEmail !== "—";
          return hasName || hasEmail;
        });

      // Sắp xếp mới nhất trước
      list.sort(
        (a, b) => new Date(b.inspectedAt ?? 0) - new Date(a.inspectedAt ?? 0),
      );
      setReports(list);
    } catch (err) {
      console.warn("AdminReports: fetch failed", err?.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
            <header
              className="admin-topbar"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <h1 className="admin-page-title">Inspection history</h1>
                <p className="admin-page-subtitle">
                  Bao gồm bài đã duyệt và chưa duyệt bởi inspector ·{" "}
                  {reports.length} reports
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
                  <span
                    className="admin-ir-stat-val"
                    style={{ color: s.color }}
                  >
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
                  <div className="admin-table-empty">
                    Loading inspection reports…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="admin-table-empty">
                    <FileCheck2 size={32} color="#cbd5e1" />
                    <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                      No inspection reports yet.
                    </p>
                  </div>
                ) : (
                  filtered.map((row, idx) => {
                    const statusCfg =
                      STATUS_CONFIG[row.status] ?? STATUS_CONFIG.PENDING;
                    const resultCfg = RESULT_CONFIG[row.result];
                    const Icon = statusCfg.icon;

                    return (
                      <div key={row.id ?? idx}>
                        <div className="admin-table-row admin-ir-row">
                          {/* Xe + seller */}
                          <div
                            className="admin-ir-bike admin-ir-bike-link"
                            onClick={() =>
                              row.postId && setPreviewId(row.postId)
                            }
                            title={row.postId ? "View listing" : undefined}
                          >
                            {row.thumbnail ? (
                              <img
                                src={row.thumbnail}
                                alt={row.title}
                                className="admin-ir-thumb"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="admin-ir-thumb-placeholder" />
                            )}
                            <div>
                              <div className="admin-ir-bike-name">
                                {row.title}
                              </div>
                              <div className="admin-ir-seller">
                                {row.seller}
                              </div>
                              {row.price && (
                                <div className="admin-ir-price">
                                  {formatCurrency(row.price)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inspector */}
                          <div className="admin-ir-inspector">
                            {row.inspectorEmail && row.inspectorEmail !== "—" ? (
                              <span className="admin-ir-inspector-email">
                                {row.inspectorEmail}
                              </span>
                            ) : (
                              "—"
                            )}
                          </div>

                          {/* Thời gian */}
                          <div className="admin-ir-date">
                            {row.inspectedAt
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
                              : "—"}
                          </div>

                          {/* Overall condition */}
                          <div className="admin-ir-condition">
                            {row.overallCondition ?? "—"}
                          </div>

                          {/* Result */}
                          <div>
                            {resultCfg ? (
                              <span
                                className={`admin-report-result ${resultCfg.className}`}
                              >
                                {resultCfg.label}
                              </span>
                            ) : (
                              <span className="admin-report-result pending">
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Status + expand */}
                          <div className="admin-ir-status-cell">
                            <span
                              className={`admin-report-status ${statusCfg.className}`}
                            >
                              <Icon size={12} /> {statusCfg.label}
                            </span>
                            <button
                              type="button"
                              className="admin-ir-expand-btn"
                              title="View inspector details"
                              onClick={() =>
                                handleViewInspectorDetails(row.postId ?? row.id)
                              }
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>
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

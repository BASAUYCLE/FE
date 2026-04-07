import { useState, useMemo, useEffect, useCallback } from "react";
import { Alert } from "antd";
import { FileCheck2, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { inspectionService, postService } from "../../../services";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import AdminInspectionModal from "../../../components/AdminInspectionModal";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import AdminToolbarFilters from "../../../components/admin/AdminToolbarFilters";
import {
  buildListingMetaLine,
  coerceInspectionDateToIso,
  normalizeInspectionReportRow,
} from "../../../utils/inspectionReportTableNormalize";
import { resolveListingThumbnailUrl } from "../../../utils/listingThumbnailUrl";
import "../../admin/dashboard/index.css";
import "../../admin/inspection-reports/index.css";
import "./index.css";

const RESULT_CONFIG = {
  PASS: { label: "Pass", className: "pass" },
  FAIL: { label: "Fail", className: "fail" },
};

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "approved" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "rejected" },
  PENDING: { label: "Pending", icon: Clock, className: "pending" },
};

const PAGE_SIZE = 10;

const IR_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "APPROVED", label: "Approved (Pass)" },
  { value: "REJECTED", label: "Rejected (Fail)" },
  { value: "PENDING", label: "Pending" },
];

function parseList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.reports)) return raw.reports;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function unwrapApiEntity(res) {
  return res?.result ?? res?.data ?? res;
}

/**
 * BE không gửi seller trên InspectionReportResponse — bù bằng GET /posts/:id.
 */
function enrichReportRowFromPostDetail(row, post) {
  if (!post || typeof post !== "object") return row;
  const sellerRaw =
    post.sellerFullName ??
    post.seller_name ??
    post.sellerName ??
    post.seller?.fullName ??
    post.seller?.name;
  const sellerTrim =
    sellerRaw != null && String(sellerRaw).trim() !== ""
      ? String(sellerRaw).trim()
      : null;
  const priceVal = row.price ?? post.price ?? post.salePrice;
  const thumb = row.thumbnail || resolveListingThumbnailUrl(post) || null;
  const metaLine = row.metaLine ?? buildListingMetaLine(post) ?? row.metaLine;
  return {
    ...row,
    seller: sellerTrim ?? row.seller,
    price: priceVal ?? row.price,
    thumbnail: thumb ?? row.thumbnail,
    metaLine: metaLine ?? row.metaLine,
  };
}

async function fetchPostDetailsByIds(postIdStrings, chunkSize = 6) {
  const map = new Map();
  const ids = [...postIdStrings].filter(Boolean);
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    const settled = await Promise.allSettled(
      chunk.map(async (id) => {
        const res = await postService.getPostById(id);
        const post = unwrapApiEntity(res);
        return { id, post };
      }),
    );
    for (const s of settled) {
      if (s.status !== "fulfilled" || !s.value?.post) continue;
      map.set(String(s.value.id), s.value.post);
    }
  }
  return map;
}

/**
 * GET /inspection/reports item (+ nested post) → same row shape as admin table.
 */
function normalizedRowFromInspectorApiItem(item, fallbackInspectorEmail) {
  const post = item.post && typeof item.post === "object" ? item.post : null;
  const images = item.images ?? post?.images ?? [];
  const inspectedAtRaw =
    item.inspectedAt ?? item.completedAt ?? item.updatedAt ?? item.createdAt;
  const inspectedAt =
    coerceInspectionDateToIso(inspectedAtRaw) ?? inspectedAtRaw ?? null;

  const thumbExtra =
    resolveListingThumbnailUrl(item) || resolveListingThumbnailUrl(post);

  const flat = {
    reportId: item.reportId ?? item.id,
    postId: item.postId ?? post?.postId ?? post?.id,
    /** Giữ `post` để pickSellerFromReportRow / ảnh đọc từ nested DTO */
    post: post ?? undefined,
    bicycleName:
      item.postTitle ??
      item.bicycleName ??
      post?.bicycleName ??
      post?.title ??
      post?.postTitle,
    sellerFullName:
      item.sellerFullName ??
      item.sellerName ??
      post?.sellerFullName ??
      post?.sellerName ??
      post?.seller?.fullName,
    images,
    thumbnailUrl:
      item.thumbnailUrl ??
      post?.thumbnailUrl ??
      post?.thumbnail ??
      post?.imageUrl ??
      (thumbExtra || null),
    price: item.price ?? post?.price ?? post?.salePrice,
    inspectorName:
      item.inspectorName ??
      item.inspectorFullName ??
      item.inspector?.fullName ??
      item.inspector?.name,
    inspectorEmail:
      item.inspectorEmail ??
      item.inspector?.email ??
      fallbackInspectorEmail ??
      null,
    inspectedAt,
    overallCondition: item.overallCondition ?? item.condition,
    notes: item.notes ?? item.inspectorNotes,
    result: item.result ?? item.inspectionResult,
    status: item.status,
    postStatus: item.postStatus ?? post?.postStatus ?? post?.status,
    metaLine: buildListingMetaLine(post) ?? buildListingMetaLine(item),
  };

  return normalizeInspectionReportRow(flat);
}

/**
 * Inspector inspection history — same table UI & modals as admin inspection reports.
 */
export default function InspectorHistoryPage() {
  const { user } = useAuth();
  const fallbackInspectorEmail =
    user?.email ?? user?.userEmail ?? user?.username ?? null;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [previewId, setPreviewId] = useState(null);
  const [inspectionModal, setInspectionModal] = useState({
    postId: null,
    title: null,
    sessionKey: 0,
    posterHint: null,
    listingMeta: null,
    thumbnailUrl: null,
  });
  const [page, setPage] = useState(1);

  const handleViewPostDetails = useCallback((postId) => {
    if (postId) setPreviewId(postId);
  }, []);

  const openInspectionRecord = useCallback((row) => {
    const pid = row?.postId ?? row?.id;
    if (pid == null) return;
    setInspectionModal({
      postId: pid,
      title: row?.title ?? null,
      sessionKey: Date.now(),
      posterHint: row?.seller && row.seller !== "—" ? row.seller : null,
      listingMeta: row?.metaLine ?? null,
      thumbnailUrl: row?.thumbnail ?? null,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await inspectionService.getMyInspectionHistory();
        const list = parseList(res);
        const rows = list.map((item) =>
          normalizedRowFromInspectorApiItem(item, fallbackInspectorEmail),
        );
        rows.sort(
          (a, b) => new Date(b.inspectedAt ?? 0) - new Date(a.inspectedAt ?? 0),
        );

        const needPostDetailIds = [
          ...new Set(
            rows
              .filter(
                (r) => r.postId != null && (!r.seller || r.seller === "—"),
              )
              .map((r) => String(r.postId)),
          ),
        ];
        let merged = rows;
        if (needPostDetailIds.length > 0) {
          const byId = await fetchPostDetailsByIds(needPostDetailIds);
          if (!cancelled) {
            merged = rows.map((r) =>
              enrichReportRowFromPostDetail(
                r,
                r.postId != null ? byId.get(String(r.postId)) : null,
              ),
            );
          }
        }

        if (!cancelled) setReports(merged);
      } catch (e) {
        if (!cancelled) {
          setReports([]);
          setLoadError(
            e?.message ??
              "Could not load inspection history. Ensure GET /inspection/reports is available.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fallbackInspectorEmail]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ =
        !q ||
        String(r.title ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.inspector ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.seller ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.inspectorEmail ?? "")
          .toLowerCase()
          .includes(q);
      const matchStatus =
        statusFilter === "all" ||
        r.status === statusFilter ||
        (statusFilter === "APPROVED" && r.result === "PASS") ||
        (statusFilter === "REJECTED" && r.result === "FAIL");
      return matchQ && matchStatus;
    });
  }, [reports, search, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, reports.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <InspectorLayout>
      <div className="admin-dashboard-page admin-inspection-reports-page inspector-history-adminlike">
        <div className="admin-dashboard">
          <div className="admin-content">
            <header
              className="admin-topbar"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <h1 className="admin-page-title">Inspection history</h1>
                <p className="admin-page-subtitle">
                  Listings you have inspected — {reports.length} report
                  {reports.length === 1 ? "" : "s"}
                </p>
              </div>
            </header>

            {loadError ? (
              <Alert
                type="warning"
                showIcon
                message={loadError}
                role="status"
                style={{ marginBottom: 16 }}
              />
            ) : null}

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

            <section className="admin-card admin-table-card admin-toolbar-page">
              <div className="admin-card-header">
                <AdminToolbarFilters
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search by bike name, inspector, seller..."
                  filterValue={statusFilter}
                  onFilterChange={setStatusFilter}
                  filterOptions={IR_STATUS_FILTER_OPTIONS}
                  idPrefix="inspector-ir-status"
                  filterAriaLabel="Filter by report status"
                />
              </div>

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
                ) : pageItems.length === 0 ? (
                  <div className="admin-table-empty">
                    <FileCheck2 size={32} color="#cbd5e1" />
                    <p style={{ margin: "8px 0 0", color: "#94a3b8" }}>
                      No inspection reports yet.
                    </p>
                  </div>
                ) : (
                  pageItems.map((row, idx) => {
                    const statusCfg =
                      STATUS_CONFIG[row.status] ?? STATUS_CONFIG.PENDING;
                    const resultCfg = RESULT_CONFIG[row.result];
                    const Icon = statusCfg.icon;

                    return (
                      <div key={row.id ?? idx}>
                        <div className="admin-table-row admin-ir-row">
                          <div
                            className="admin-ir-bike admin-ir-bike-link"
                            onClick={() =>
                              handleViewPostDetails(row.postId ?? row.id)
                            }
                            title={
                              (row.postId ?? row.id)
                                ? "View listing & photos"
                                : undefined
                            }
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
                              {row.price != null && row.price !== "" ? (
                                <div className="admin-ir-price">
                                  {formatCurrency(row.price)}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="admin-ir-inspector">
                            {row.inspectorEmail &&
                            row.inspectorEmail !== "—" ? (
                              <span className="admin-ir-inspector-email">
                                {row.inspectorEmail}
                              </span>
                            ) : (
                              "—"
                            )}
                          </div>

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

                          <div className="admin-ir-condition">
                            {row.overallCondition
                              ? String(row.overallCondition).replace(/_/g, " ")
                              : "—"}
                          </div>

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

                          <div className="admin-ir-status-cell">
                            <span
                              className={`admin-report-status ${statusCfg.className}`}
                            >
                              <Icon size={12} /> {statusCfg.label}
                            </span>
                            <button
                              type="button"
                              className="admin-ir-expand-btn"
                              title="View inspection record"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInspectionRecord(row);
                              }}
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
              <AdminPaginationBar
                totalCount={filtered.length}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                nounPhrase="reports"
              />
            </section>
          </div>
        </div>
      </div>

      <AdminInspectionModal
        key={
          inspectionModal.postId != null
            ? String(inspectionModal.sessionKey)
            : "inspector-ir-inspection-closed"
        }
        postId={inspectionModal.postId}
        listingTitle={inspectionModal.title}
        posterHint={inspectionModal.posterHint}
        listingMeta={inspectionModal.listingMeta}
        listingThumbnailUrl={inspectionModal.thumbnailUrl}
        open={inspectionModal.postId != null}
        onClose={() =>
          setInspectionModal({
            postId: null,
            title: null,
            sessionKey: 0,
            posterHint: null,
            listingMeta: null,
            thumbnailUrl: null,
          })
        }
      />
      <ProductPreviewModal
        postId={previewId}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
      />
    </InspectorLayout>
  );
}

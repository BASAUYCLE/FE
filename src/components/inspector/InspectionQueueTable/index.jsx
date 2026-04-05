import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "antd";
import { Eye, Upload, Play } from "lucide-react";
import {
  INSPECTION_STATUS,
  INSPECTION_STATUS_LABEL,
  INSPECTION_STATUS_TAG_COLOR,
} from "../../../constants/inspectionStatus";
import AdminPaginationBar from "../../admin/AdminPaginationBar";
import AdminToolbarFilters from "../../admin/AdminToolbarFilters";
import ProductPreviewModal from "../../ProductPreviewModal";

const PAGE_SIZE = 10;

function InspectorBikeThumb({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const url = typeof src === "string" ? src.trim() : "";
  const show = Boolean(url && !failed);
  return show ? (
    <img src={url} alt={alt || ""} onError={() => setFailed(true)} />
  ) : (
    <div className="inspector-bike-thumb-placeholder" aria-hidden />
  );
}

/** Status filters for the pending queue (not every row type may appear). */
const QUEUE_STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: INSPECTION_STATUS.PENDING, label: "Pending" },
  { value: INSPECTION_STATUS.IN_PROGRESS, label: "In progress" },
  { value: INSPECTION_STATUS.OVERDUE, label: "Overdue" },
  { value: INSPECTION_STATUS.COMPLETED, label: "Completed" },
  { value: INSPECTION_STATUS.REJECTED, label: "Rejected" },
];

/** Result filters for inspection history (PASS / FAIL from submit). */
const HISTORY_RESULT_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PASS", label: "Pass" },
  { value: "FAIL", label: "Fail" },
];

function formatRequestedDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Reusable inspection queue table.
 * @param {"queue"|"history"} [variant="queue"] — history: inspected date, Pass/Fail filter, view-only actions.
 */
export default function InspectionQueueTable({
  inspections = [],
  loading = false,
  variant = "queue",
}) {
  const navigate = useNavigate();
  const isHistory = variant === "history";
  const filterOptions = isHistory
    ? HISTORY_RESULT_FILTER_OPTIONS
    : QUEUE_STATUS_FILTER_OPTIONS;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [previewPostId, setPreviewPostId] = useState(null);

  const openPostPreview = (item) => {
    const pid = Number(item?.postId ?? item?.id);
    if (Number.isFinite(pid) && pid >= 1) setPreviewPostId(pid);
  };

  const filteredInspections = useMemo(() => {
    let list = inspections;
    if (statusFilter !== "ALL") {
      if (isHistory) {
        list = list.filter(
          (i) => (i.inspectionResult ?? "").toUpperCase() === statusFilter,
        );
      } else {
        list = list.filter((i) => (i.status ?? "") === statusFilter);
      }
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((i) => {
      const idStr = String(i.id ?? i.postId ?? "").toLowerCase();
      return (
        idStr.includes(q) ||
        i.bicycleName?.toLowerCase().includes(q) ||
        i.bicycleType?.toLowerCase().includes(q) ||
        i.sellerName?.toLowerCase().includes(q) ||
        i.sellerLocation?.toLowerCase().includes(q)
      );
    });
  }, [inspections, search, statusFilter, isHistory]);

  const totalPages = Math.ceil(filteredInspections.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredInspections.slice(start, start + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [inspections.length, search, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="admin-card inspector-queue-card">
      <div className="admin-card-header inspector-queue-card-header">
        <div className="inspector-queue-toolbar">
          <div className="admin-toolbar-page inspector-toolbar-page">
            <AdminToolbarFilters
              idPrefix={
                isHistory
                  ? "inspector-toolbar-history"
                  : "inspector-toolbar-status"
              }
              searchValue={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              searchPlaceholder="Search by model, status…"
              filterValue={statusFilter}
              onFilterChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              filterOptions={filterOptions}
              filterAriaLabel={
                isHistory ? "Filter by inspection result" : "Filter by status"
              }
            />
          </div>
        </div>
      </div>
      <div className="admin-table">
        <div className="admin-table-row inspector-table-row inspector-table-header">
          <div>BICYCLE DETAILS</div>
          <div>SELLER INFO</div>
          <div>{isHistory ? "INSPECTED ON" : "REQUESTED DATE"}</div>
          <div>STATUS</div>
          <div>ACTIONS</div>
        </div>
        {loading ? (
          <div className="admin-table-row inspector-table-row">
            <div
              style={{
                padding: "24px",
                gridColumn: "1 / -1",
                textAlign: "center",
              }}
            >
              Loading…
            </div>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="admin-table-row inspector-table-row">
            <div
              style={{
                padding: "24px",
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              {isHistory
                ? "No inspection history yet."
                : "No inspections match your filters."}
            </div>
          </div>
        ) : (
          pageItems.map((item, idx) => (
            <div
              key={item?.id ?? item?.postId ?? `inspector-${idx}`}
              className="admin-table-row inspector-table-row"
            >
              <div>
                <div className="inspector-bike-cell">
                  <InspectorBikeThumb
                    src={item.bicycleImage}
                    alt={item.bicycleName}
                  />
                  <div>
                    <button
                      type="button"
                      className="inspector-bike-name inspector-bike-name--link"
                      aria-label={`View listing: ${item.bicycleName ?? "post"}`}
                      onClick={() => openPostPreview(item)}
                    >
                      {item.bicycleName}
                    </button>
                    {item.bicycleType && item.bicycleType !== "—" ? (
                      <div className="inspector-bike-meta">
                        {item.bicycleType}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div>
                {formatRequestedDate(
                  isHistory
                    ? item.inspectedAt || item.requestedDate
                    : item.requestedDate,
                )}
              </div>
              <div>
                {isHistory ? (
                  <Tag
                    color={
                      item.inspectionResult === "FAIL"
                        ? "red"
                        : item.inspectionResult === "PASS"
                          ? "green"
                          : "default"
                    }
                  >
                    {item.inspectionResult === "PASS"
                      ? "Pass"
                      : item.inspectionResult === "FAIL"
                        ? "Fail"
                        : "—"}
                  </Tag>
                ) : (
                  <Tag
                    color={
                      INSPECTION_STATUS_TAG_COLOR[item.status] ?? "default"
                    }
                  >
                    {INSPECTION_STATUS_LABEL[item.status] ?? item.status}
                  </Tag>
                )}
              </div>
              <div className="inspector-actions-cell">
                <button
                  type="button"
                  className="admin-actions-button"
                  aria-label="View details"
                  onClick={() => navigate(`/inspector/${item.id}`)}
                >
                  <Eye size={18} />
                </button>
                {!isHistory &&
                  (item.status === "IN_PROGRESS" ? (
                    <button
                      type="button"
                      className="inspector-btn-continue"
                      onClick={() => navigate(`/inspector/${item.id}`)}
                    >
                      <Play
                        size={12}
                        style={{ marginRight: 4, verticalAlign: "middle" }}
                      />
                      Not Inspected
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inspector-btn-upload"
                      onClick={() => navigate(`/inspector/${item.id}`)}
                    >
                      <Upload
                        size={12}
                        style={{ marginRight: 4, verticalAlign: "middle" }}
                      />
                      Inspected
                    </button>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
      <AdminPaginationBar
        totalCount={filteredInspections.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        nounPhrase={isHistory ? "records" : "inspections"}
      />
      <ProductPreviewModal
        postId={previewPostId}
        open={previewPostId != null}
        onClose={() => setPreviewPostId(null)}
      />
    </section>
  );
}

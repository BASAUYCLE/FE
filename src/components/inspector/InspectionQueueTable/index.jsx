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

const PAGE_SIZE = 10;

/** Status filters shown in toolbar (queue may not include every value). */
const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: INSPECTION_STATUS.PENDING, label: "Pending" },
  { value: INSPECTION_STATUS.IN_PROGRESS, label: "In progress" },
  { value: INSPECTION_STATUS.OVERDUE, label: "Overdue" },
  { value: INSPECTION_STATUS.COMPLETED, label: "Completed" },
  { value: INSPECTION_STATUS.REJECTED, label: "Rejected" },
];

function formatRequestedDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Reusable inspection queue table.
 */
export default function InspectionQueueTable({
  inspections = [],
  loading = false,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filteredInspections = useMemo(() => {
    let list = inspections;
    if (statusFilter !== "ALL") {
      list = list.filter((i) => (i.status ?? "") === statusFilter);
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
  }, [inspections, search, statusFilter]);

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
              idPrefix="inspector-toolbar-status"
              searchValue={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              searchPlaceholder="Search by ID, model, seller…"
              filterValue={statusFilter}
              onFilterChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              filterOptions={STATUS_FILTER_OPTIONS}
              filterAriaLabel="Filter by status"
            />
          </div>
        </div>
      </div>
      <div className="admin-table">
        <div className="admin-table-row inspector-table-row inspector-table-header">
          <div>BICYCLE DETAILS</div>
          <div>SELLER INFO</div>
          <div>REQUESTED DATE</div>
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
        ) : (
          pageItems.map((item, idx) => (
            <div
              key={item?.id ?? item?.postId ?? `inspector-${idx}`}
              className="admin-table-row inspector-table-row"
            >
              <div>
                <div className="inspector-bike-cell">
                  <img src={item.bicycleImage} alt={item.bicycleName} />
                  <div>
                    <div className="inspector-bike-name">
                      {item.bicycleName}
                    </div>
                    <div className="inspector-bike-meta">
                      ID: #{item.id} • {item.bicycleType}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="inspector-seller-name">{item.sellerName}</div>
                <div className="inspector-seller-location">
                  {item.sellerLocation}
                </div>
              </div>
              <div>{formatRequestedDate(item.requestedDate)}</div>
              <div>
                <Tag
                  color={INSPECTION_STATUS_TAG_COLOR[item.status] ?? "default"}
                >
                  {INSPECTION_STATUS_LABEL[item.status] ?? item.status}
                </Tag>
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
                {item.status === "IN_PROGRESS" ? (
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
                )}
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
        nounPhrase="inspections"
      />
    </section>
  );
}

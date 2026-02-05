import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "antd";
import { Search, Filter, Eye, Upload, Play } from "lucide-react";
import { INSPECTION_STATUS_LABEL, INSPECTION_STATUS_TAG_COLOR } from "../../../constants/inspectionStatus";

const PAGE_SIZE = 4;

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
 * Reusable inspection queue table. Used by Dashboard and Inspection Details page.
 */
export default function InspectionQueueTable({ inspections = [], loading = false }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredInspections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inspections;
    return inspections.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.bicycleName?.toLowerCase().includes(q) ||
        i.bicycleType?.toLowerCase().includes(q)
    );
  }, [inspections, search]);

  const totalPages = Math.ceil(filteredInspections.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredInspections.slice(start, start + PAGE_SIZE);

  return (
    <section className="admin-card inspector-queue-card">
      <div className="admin-card-header">
        <div className="inspector-queue-toolbar">
          <div className="inspector-search">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by ID or model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button type="button" className="admin-outline-button">
            <Filter size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Filters
          </button>
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
            <div style={{ padding: "24px", gridColumn: "1 / -1", textAlign: "center" }}>
              Đang tải...
            </div>
          </div>
        ) : (
          pageItems.map((item) => (
          <div key={item.id} className="admin-table-row inspector-table-row">
            <div>
              <div className="inspector-bike-cell">
                <img src={item.bicycleImage} alt={item.bicycleName} />
                <div>
                  <div className="inspector-bike-name">{item.bicycleName}</div>
                  <div className="inspector-bike-meta">
                    ID: #{item.id} • {item.bicycleType}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inspector-seller-name">{item.sellerName}</div>
              <div className="inspector-seller-location">{item.sellerLocation}</div>
            </div>
            <div>{formatRequestedDate(item.requestedDate)}</div>
            <div>
              <Tag color={INSPECTION_STATUS_TAG_COLOR[item.status] ?? "default"}>
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
                  <Play size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Not Inspected
                </button>
              ) : (
                <button
                  type="button"
                  className="inspector-btn-upload"
                  onClick={() => navigate(`/inspector/${item.id}`)}
                >
                  <Upload size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Inspected
                </button>
              )}
            </div>
          </div>
        ))
        )}
      </div>
      <div className="inspector-pagination">
        <span>
          Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredInspections.length)} of{" "}
          {filteredInspections.length} inspections
        </span>
        <div className="inspector-pagination-btns">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              className={p === page ? "active" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

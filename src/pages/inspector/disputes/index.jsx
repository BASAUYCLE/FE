import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Tag, message } from "antd";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import {
  INSPECTOR_NAV_LINKS,
  getInspectorActiveLink,
} from "../../../config/inspectorNav";
import { mockDisputeCases } from "../../../data/inspections";
import { Wrench, FileDown, Plus, Search, Eye } from "lucide-react";
import "./index.css";

const PAGE_SIZE = 4;
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "RESOLVED", label: "Resolved" },
];
const PRIORITY_OPTIONS = [
  { value: "", label: "Priority: All" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const STATUS_TAG_MAP = {
  OPEN: { color: "#3b82f6", label: "Open" },
  IN_REVIEW: { color: "#eab308", label: "In Review" },
  ESCALATED: { color: "#ef4444", label: "Escalated" },
  RESOLVED: { color: "#64748b", label: "Resolved" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function InspectorDisputes() {
  const { pathname } = useLocation();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredCases = useMemo(() => {
    let list = [...mockDisputeCases];
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    if (priorityFilter) list = list.filter((c) => c.priority === priorityFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.buyerName?.toLowerCase().includes(q) ||
          c.sellerName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [statusFilter, priorityFilter, search]);

  const totalPages = Math.ceil(filteredCases.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredCases.slice(start, start + PAGE_SIZE);

  const handleExportReport = () => {
    // API can be wired later
  };

  const handleNewCase = () => {
    // API can be wired later
  };

  const handleViewDetails = (caseId) => {
    message.info(`Case ${caseId} – detail page can be wired later.`);
  };

  return (
    <div className="inspector-page">
      <Header
        navLinks={INSPECTOR_NAV_LINKS}
        activeLink={getInspectorActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="inspector-dashboard">
        <div className="inspector-content disputes-support-content">
          <div className="disputes-banner">
            <div className="disputes-banner-left">
              <div className="disputes-banner-icon">
                <Wrench size={28} color="#fff" />
              </div>
              <div className="disputes-banner-text">
                <h1 className="disputes-banner-title">Dispute Support Center</h1>
                <p className="disputes-banner-desc">
                  Reviewing and resolving marketplace transaction conflicts.
                </p>
              </div>
            </div>
            <div className="disputes-actions-row">
              <button
                type="button"
                className="disputes-banner-btn disputes-btn-export"
                onClick={handleExportReport}
              >
                <FileDown size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Export Report
              </button>
              <button
                type="button"
                className="disputes-banner-btn disputes-btn-new"
                onClick={handleNewCase}
              >
                <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                New Case
              </button>
            </div>
          </div>

          <div className="admin-card disputes-table-card">
            <div className="inspector-queue-toolbar disputes-toolbar">
              <div className="disputes-filters">
                <select
                  className="disputes-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  className="disputes-select"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inspector-search">
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search Case ID or User..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div className="admin-table">
              <div className="disputes-table-row disputes-table-header">
                <div>CASE ID</div>
                <div>DISPUTE INFORMATION</div>
                <div>PARTIES</div>
                <div>STATUS</div>
                <div>DATE</div>
                <div>ACTIONS</div>
              </div>
              {pageItems.map((c) => (
                <div key={c.id} className="disputes-table-row">
                  <div className="disputes-case-id">#{c.id}</div>
                  <div className="disputes-info">
                    <span className="disputes-info-type">{c.disputeType}</span>
                    <span className="disputes-info-item"> ({c.itemName})</span>
                  </div>
                  <div className="disputes-parties">
                    <span>B: {c.buyerName}</span>, <span>S: {c.sellerName}</span>
                  </div>
                  <div>
                    <Tag
                      color={
                        c.status === "RESOLVED"
                          ? "default"
                          : c.status === "IN_REVIEW"
                            ? "gold"
                            : c.status === "ESCALATED"
                              ? "red"
                              : "blue"
                      }
                    >
                      {STATUS_TAG_MAP[c.status]?.label ?? c.status}
                    </Tag>
                  </div>
                  <div>{formatDate(c.date)}</div>
                  <div>
                    <button
                      type="button"
                      className="disputes-link-view"
                      onClick={() => handleViewDetails(c.id)}
                    >
                      <Eye size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="inspector-pagination">
              <span>
                Showing {start + 1} to {Math.min(start + PAGE_SIZE, filteredCases.length)} of{" "}
                {filteredCases.length} results
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

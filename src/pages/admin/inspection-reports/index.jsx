import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import {
  Search,
  FileCheck2,
  Eye,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import "../dashboard/index.css";
import "./index.css";

const MOCK_REPORTS = [
  {
    id: "RPT-2025-001",
    listingTitle: "Specialized Tarmac SL7",
    inspector: "John Inspector",
    inspectedAt: "28/01/2025 14:30",
    result: "PASS",
    status: "APPROVED",
  },
  {
    id: "RPT-2025-002",
    listingTitle: "Canyon Grizl CF SL",
    inspector: "Jane Smith",
    inspectedAt: "28/01/2025 11:20",
    result: "PASS",
    status: "APPROVED",
  },
  {
    id: "RPT-2025-003",
    listingTitle: "Trek Domane SL 6",
    inspector: "Bob Wilson",
    inspectedAt: "27/01/2025 16:45",
    result: "PENDING",
    status: "PENDING",
  },
  {
    id: "RPT-2025-004",
    listingTitle: "Giant TCR Advanced",
    inspector: "Alice Brown",
    inspectedAt: "27/01/2025 09:15",
    result: "FAIL",
    status: "REJECTED",
  },
  {
    id: "RPT-2025-005",
    listingTitle: "Santa Cruz Bronson",
    inspector: "Chris Lee",
    inspectedAt: "26/01/2025 13:00",
    result: "PASS",
    status: "APPROVED",
  },
];

const STATUS_CONFIG = {
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "approved" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "rejected" },
  PENDING: { label: "Pending", icon: Clock, className: "pending" },
};

export default function AdminInspectionReports() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_REPORTS.filter((row) => {
      const matchSearch =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.listingTitle.toLowerCase().includes(q) ||
        row.inspector.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="admin-dashboard-page admin-inspection-reports-page">
      <Header
        navLinks={ADMIN_NAV_LINKS}
        activeLink={getAdminActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="admin-dashboard">
        <div className="admin-content">
          <header className="admin-topbar">
            <div>
              <h1 className="admin-page-title">Inspection reports</h1>
            <p className="admin-page-subtitle">
                View and process bicycle inspection reports from inspectors.
            </p>
            </div>
          </header>

          <section className="admin-card admin-table-card">
            <div className="admin-card-header">
              <div className="admin-approved-filters">
                <div className="admin-search-wrap">
                  <Search className="admin-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search by report ID, listing, inspector..."
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
                    <option value="all">All statuses</option>
                    {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-table-actions">
                <button type="button" className="admin-outline-button">
                  <Download size={14} /> Export Excel
                </button>
              </div>
            </div>
            <div className="admin-table admin-reports-table">
              <div className="admin-table-row admin-table-header">
                <div>Report ID</div>
                <div>Listing</div>
                <div>Inspector</div>
                <div>Inspection time</div>
                <div>Result</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {filtered.length === 0 ? (
                <div className="admin-table-empty">No reports.</div>
              ) : (
                filtered.map((row) => {
                  const config =
                    STATUS_CONFIG[row.status] || STATUS_CONFIG.PENDING;
                  const Icon = config.icon;
                  return (
                    <div className="admin-table-row" key={row.id}>
                      <div className="admin-report-id">{row.id}</div>
                      <div className="admin-report-title">
                        {row.listingTitle}
                      </div>
                      <div>{row.inspector}</div>
                      <div>{row.inspectedAt}</div>
                      <div>
                        <span
                          className={`admin-report-result ${row.result?.toLowerCase()}`}
                        >
                          {row.result === "PASS"
                            ? "Pass"
                            : row.result === "FAIL"
                              ? "Fail"
                              : "Pending"}
                        </span>
                      </div>
                      <div>
                        <span
                          className={`admin-report-status ${config.className}`}
                        >
                          <Icon size={12} /> {config.label}
                        </span>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="View report"
                          aria-label="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="Download PDF"
                          aria-label="Download"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

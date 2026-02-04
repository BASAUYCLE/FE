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
    inspector: "Nguyễn Văn Kiểm",
    inspectedAt: "28/01/2025 14:30",
    result: "PASS",
    status: "APPROVED",
  },
  {
    id: "RPT-2025-002",
    listingTitle: "Canyon Grizl CF SL",
    inspector: "Trần Thị Hà",
    inspectedAt: "28/01/2025 11:20",
    result: "PASS",
    status: "APPROVED",
  },
  {
    id: "RPT-2025-003",
    listingTitle: "Trek Domane SL 6",
    inspector: "Lê Văn Minh",
    inspectedAt: "27/01/2025 16:45",
    result: "PENDING",
    status: "PENDING",
  },
  {
    id: "RPT-2025-004",
    listingTitle: "Giant TCR Advanced",
    inspector: "Phạm Thị Lan",
    inspectedAt: "27/01/2025 09:15",
    result: "FAIL",
    status: "REJECTED",
  },
  {
    id: "RPT-2025-005",
    listingTitle: "Santa Cruz Bronson",
    inspector: "Hoàng Văn Đức",
    inspectedAt: "26/01/2025 13:00",
    result: "PASS",
    status: "APPROVED",
  },
];

const STATUS_CONFIG = {
  APPROVED: { label: "Đã duyệt", icon: CheckCircle2, className: "approved" },
  REJECTED: { label: "Từ chối", icon: XCircle, className: "rejected" },
  PENDING: { label: "Chờ duyệt", icon: Clock, className: "pending" },
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
              <h1 className="admin-page-title">Quản lý báo cáo kiểm duyệt</h1>
              <p className="admin-page-subtitle">
                Xem và xử lý các bản báo cáo kiểm định xe từ inspector.
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
                    placeholder="Tìm theo mã báo cáo, tin đăng, inspector..."
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
                    <option value="all">Tất cả trạng thái</option>
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
                  <Download size={14} /> Xuất Excel
                </button>
              </div>
            </div>
            <div className="admin-table admin-reports-table">
              <div className="admin-table-row admin-table-header">
                <div>Mã báo cáo</div>
                <div>Tin đăng</div>
                <div>Inspector</div>
                <div>Thời gian kiểm</div>
                <div>Kết quả</div>
                <div>Trạng thái</div>
                <div>Thao tác</div>
              </div>
              {filtered.length === 0 ? (
                <div className="admin-table-empty">Không có báo cáo nào.</div>
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
                            ? "Đạt"
                            : row.result === "FAIL"
                              ? "Không đạt"
                              : "Chờ xử lý"}
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
                          title="Xem báo cáo"
                          aria-label="Xem"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="Tải PDF"
                          aria-label="Tải"
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

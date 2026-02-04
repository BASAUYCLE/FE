import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import {
  Search,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { POSTING_STATUS_LABEL } from "../../../constants/postingStatus";
import "../dashboard/index.css";
import "./index.css";

const MOCK_VERIFIED_LISTINGS = [
  {
    id: "BK-9021",
    title: "Specialized Tarmac SL7",
    seller: "Nguyễn Văn A",
    category: "Road Bike",
    price: "125.000.000 ₫",
    inspectedAt: "28/01/2025",
    status: "VERIFIED",
  },
  {
    id: "BK-9022",
    title: "Canyon Grizl CF SL",
    seller: "Trần Thị B",
    category: "Gravel",
    price: "89.000.000 ₫",
    inspectedAt: "27/01/2025",
    status: "VERIFIED",
  },
  {
    id: "BK-9023",
    title: "Trek Domane SL 6",
    seller: "Lê Văn C",
    category: "Road Bike",
    price: "95.000.000 ₫",
    inspectedAt: "26/01/2025",
    status: "VERIFIED",
  },
  {
    id: "BK-9024",
    title: "Giant TCR Advanced",
    seller: "Phạm Thị D",
    category: "Road Bike",
    price: "72.000.000 ₫",
    inspectedAt: "25/01/2025",
    status: "VERIFIED",
  },
  {
    id: "BK-9025",
    title: "Santa Cruz Bronson",
    seller: "Hoàng Văn E",
    category: "Mountain",
    price: "185.000.000 ₫",
    inspectedAt: "24/01/2025",
    status: "VERIFIED",
  },
];

export default function AdminApprovedListings() {
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_VERIFIED_LISTINGS.filter((row) => {
      const matchSearch =
        !q ||
        row.title.toLowerCase().includes(q) ||
        row.seller.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === "all" ||
        row.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(MOCK_VERIFIED_LISTINGS.map((r) => r.category));
    return ["all", ...Array.from(set)];
  }, []);

  return (
    <div className="admin-dashboard-page admin-approved-listings-page">
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
            <h1 className="admin-page-title">Tin đăng đã qua kiểm duyệt</h1>
            <p className="admin-page-subtitle">
              Quản lý các tin đăng đã được kiểm định và duyệt hiển thị.
            </p>
          </header>

          <section className="admin-card admin-table-card">
            <div className="admin-card-header">
              <div className="admin-approved-filters">
                <div className="admin-search-wrap">
                  <Search className="admin-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Tìm theo tiêu đề, người đăng, mã tin..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
                <div className="admin-filter-wrap">
                  <Filter size={14} />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="admin-pill"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c === "all" ? "Tất cả danh mục" : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-table-actions">
                <span className="admin-count-badge">
                  {filtered.length} tin đăng
                </span>
              </div>
            </div>
            <div className="admin-table admin-approved-table">
              <div className="admin-table-row admin-table-header">
                <div>Mã / Tin đăng</div>
                <div>Người đăng</div>
                <div>Danh mục</div>
                <div>Giá</div>
                <div>Ngày kiểm định</div>
                <div>Trạng thái</div>
                <div>Thao tác</div>
              </div>
              {filtered.length === 0 ? (
                <div className="admin-table-empty">Không có tin đăng nào.</div>
              ) : (
                filtered.map((row) => (
                  <div className="admin-table-row" key={row.id}>
                    <div>
                      <div className="admin-approved-id">#{row.id}</div>
                      <div className="admin-approved-title">{row.title}</div>
                    </div>
                    <div>{row.seller}</div>
                    <div>{row.category}</div>
                    <div className="admin-approved-price">{row.price}</div>
                    <div>{row.inspectedAt}</div>
                    <div>
                      <span className="admin-status verified">
                        <CheckCircle2 size={12} />{" "}
                        {POSTING_STATUS_LABEL[row.status] || row.status}
                      </span>
                    </div>
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="admin-actions-button"
                        title="Xem chi tiết"
                        aria-label="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-actions-button"
                        title="Thêm"
                        aria-label="Thêm"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

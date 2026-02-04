import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { LayoutGrid, Tags, BarChart3 } from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import "./index.css";

const CATEGORY_ROWS = [
  {
    id: "#CAT001",
    name: "Mountain Bikes (MTB)",
    subLabel: "Mountain Bikes",
    iconColor: "#e5f8f3",
    icon: "mountain",
    brands: "Giant, Trek, Specialized",
    count: "1,245",
    status: "Active",
    statusTone: "success",
  },
  {
    id: "#CAT002",
    name: "Road Bikes",
    subLabel: "Road Bikes",
    iconColor: "#fff2e5",
    icon: "road",
    brands: "Cervelo, Bianchi, Cannondale",
    count: "856",
    status: "Active",
    statusTone: "success",
  },
  {
    id: "#CAT003",
    name: "Electric Bikes (E-Bike)",
    subLabel: "Electric Bikes",
    iconColor: "#eef1ff",
    icon: "electric",
    brands: "Rad Power, VanMoof",
    count: "432",
    status: "Active",
    statusTone: "success",
  },
  {
    id: "#CAT004",
    name: "Kids Bikes",
    subLabel: "Kids Bikes",
    iconColor: "#eff4f8",
    icon: "kids",
    brands: "Woom, Frog, Strider",
    count: "1,029",
    status: "Hidden",
    statusTone: "muted",
  },
];

export default function CategoryManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { pathname } = useLocation();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATEGORY_ROWS.filter((row) => {
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.subLabel.toLowerCase().includes(q) ||
        row.brands.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || row.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const handleAction = (action, rowId) => {
    console.log(`[CategoryManagement] ${action} ${rowId}`);
  };

  return (
    <Box component="main" className="category-management-page">
      <Header
        navLinks={ADMIN_NAV_LINKS}
        activeLink={getAdminActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showSellButton={false}
        showLogin={false}
        showAvatar
        showWishlistIcon={false}
        showNotificationIcon={true}
      />

      <div className="category-management-shell">
        <section className="category-management-content">
          <div className="category-management-topbar">
            <div className="category-management-topbar-spacer" />
          </div>

          <div className="category-management-header">
            <div className="category-management-header-spacer" />
            <button
              type="button"
              className="category-management-primary-btn"
              onClick={() => handleAction("add-category", "header")}
            >
              <PlusOutlined />
              Add Category
            </button>
          </div>

          <div className="category-management-stats">
            <div className="category-management-stat-card">
              <div>
                <span className="category-management-stat-label">
                  Total Categories
                </span>
                <div className="category-management-stat-value">12</div>
              </div>
              <div className="category-management-stat-icon primary">
                <LayoutGrid />
              </div>
            </div>
            <div className="category-management-stat-card">
              <div>
                <span className="category-management-stat-label">
                  Total Brands
                </span>
                <div className="category-management-stat-value">48</div>
              </div>
              <div className="category-management-stat-icon success">
                <Tags />
              </div>
            </div>
            <div className="category-management-stat-card">
              <div>
                <span className="category-management-stat-label">
                  Category Views
                </span>
                <div className="category-management-stat-value">12.4K</div>
              </div>
              <div className="category-management-stat-icon purple">
                <BarChart3 />
              </div>
            </div>
          </div>

          <div className="category-management-card">
            <div className="category-management-filters">
              <div className="category-management-search">
                <SearchOutlined />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="category-management-filter-actions">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                </select>
                <button
                  type="button"
                  className="category-management-icon-btn"
                  onClick={() => handleAction("filter", "table")}
                  aria-label="Filter"
                >
                  <FilterOutlined />
                </button>
              </div>
            </div>

            <div className="category-management-table">
              <div className="category-management-table-row header">
                <div>ID</div>
                <div>Category</div>
                <div>Popular Brands</div>
                <div>Bike Count</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {filteredRows.map((row) => (
                <div key={row.id} className="category-management-table-row">
                  <div className="category-management-cell-id">{row.id}</div>
                  <div className="category-management-cell-category">
                    <div
                      className={`category-management-category-icon ${row.icon}`}
                      style={{ backgroundColor: row.iconColor }}
                    />
                    <div>
                      <div className="category-management-category-title">
                        {row.name}
                      </div>
                      <div className="category-management-category-subtitle">
                        {row.subLabel}
                      </div>
                    </div>
                  </div>
                  <div className="category-management-cell-brands">
                    {row.brands}
                  </div>
                  <div className="category-management-cell-count">
                    {row.count}
                  </div>
                  <div>
                    <span
                      className={`category-management-status ${row.statusTone}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <div className="category-management-cell-actions">
                    <button
                      type="button"
                      className="category-management-action-btn"
                      onClick={() => handleAction("edit", row.id)}
                      aria-label={`Edit ${row.name}`}
                    >
                      <EditOutlined />
                    </button>
                    <button
                      type="button"
                      className="category-management-action-btn"
                      onClick={() => handleAction("delete", row.id)}
                      aria-label={`Delete ${row.name}`}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="category-management-footer">
              <div className="category-management-footer-left">
                Showing 1 - 4 of 12 categories
              </div>
              <div className="category-management-pagination">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="category-management-page-btn"
                >
                  Previous
                </button>
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPage(num)}
                    className={`category-management-page-btn ${
                      page === num ? "active" : ""
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(Math.min(3, page + 1))}
                  className="category-management-page-btn"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </Box>
  );
}

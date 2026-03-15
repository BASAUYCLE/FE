import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Search,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { POSTING_STATUS_LABEL } from "../../../constants/postingStatus";
import adminPostService from "../../../services/adminPostService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import "../dashboard/index.css";
import "./index.css";

export default function AdminApprovedListings() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);

<<<<<<< HEAD
  /** Lấy chữ cái đầu để hiển thị avatar (admin/inspector) */
  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0])
        .toUpperCase()
        .slice(0, 2);
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  };

  /** Chuẩn hóa 1 post từ BE → row UI */
  const normalizePost = (row) => {
    const price = row.price ?? row.askingPrice ?? row.amount;
    const approvedBy =
      row.approvedBy ??
      row.approvedByUser?.fullName ??
      row.approvedByUser?.name ??
      row.adminFullName ??
      row.approvedByUserName ??
      null;
    return {
      id: row.postId ?? row.id,
      title: row.bicycleName ?? row.title ?? row.postTitle ?? "—",
      seller:
        row.sellerFullName ??
        row.sellerName ??
        row.seller?.fullName ??
        row.seller?.name ??
        "—",
      category:
        row.categoryName ?? row.category?.categoryName ?? row.category ?? "—",
      price: typeof price === "number" ? formatCurrency(price) : (price ?? "—"),
      thumbnail:
        (row.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
        row.images?.[0]?.imageUrl ??
        row.thumbnailUrl ??
        null,
      inspectedAt:
        row.inspectedAt ??
        row.inspectionDate ??
        row.updatedAt ??
        row.createdAt ??
        null,
      status: row.postStatus ?? row.status ?? "ADMIN_APPROVED",
      approvedBy:
        approvedBy && typeof approvedBy === "string"
          ? approvedBy
          : approvedBy
            ? String(approvedBy)
            : null,
=======
  /** Chuẩn hóa 1 post từ BE → row UI */
  const normalizePost = (row) => {
    const price = row.price ?? row.askingPrice ?? row.amount;
    return {
      id:       row.postId ?? row.id,
      title:    row.bicycleName ?? row.title ?? row.postTitle ?? "—",
      seller:
        row.sellerFullName ?? row.sellerName ??
        row.seller?.fullName ?? row.seller?.name ?? "—",
      category: row.categoryName ?? row.category?.categoryName ?? row.category ?? "—",
      price:    typeof price === "number" ? formatCurrency(price) : (price ?? "—"),
      thumbnail:
        (row.images ?? []).find((i) => i?.isThumbnail)?.imageUrl ??
        row.images?.[0]?.imageUrl ?? row.thumbnailUrl ?? null,
      inspectedAt:
        row.inspectedAt ?? row.inspectionDate ??
        row.updatedAt   ?? row.createdAt      ?? null,
      status: row.postStatus ?? row.status ?? "ADMIN_APPROVED",
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
    };
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getPostsByStatus("ADMIN_APPROVED");
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
<<<<<<< HEAD
      const list = Array.isArray(raw)
        ? raw
        : (raw?.content ?? raw?.posts ?? raw?.data ?? []);
=======
      const list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.posts ?? raw?.data ?? []);
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      setListings(list.map(normalizePost));
    } catch (err) {
      console.warn("AdminApprovedListings: fetch failed", err?.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((row) => {
      const matchSearch =
        !q ||
        (row.title && row.title.toLowerCase().includes(q)) ||
        (row.seller && row.seller.toLowerCase().includes(q)) ||
        (row.id && String(row.id).toLowerCase().includes(q));
      const matchCategory =
        categoryFilter === "all" ||
        (row.category &&
          row.category.toLowerCase() === categoryFilter.toLowerCase());
      return matchSearch && matchCategory;
    });
  }, [listings, search, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(listings.map((r) => r.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [listings]);

  return (
    <AdminLayout>
<<<<<<< HEAD
=======

>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
      <div className="admin-dashboard-page admin-approved-listings-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            <header className="admin-topbar">
              <h1 className="admin-page-title">Bài đăng đã duyệt</h1>
              <p className="admin-page-subtitle">
<<<<<<< HEAD
                Các bài post đã được Admin duyệt, đang chờ kiểm định trước khi
                lên sàn.
              </p>
            </header>

            <section className="admin-card admin-table-card">
              <div className="admin-card-header">
                <div className="admin-approved-filters">
                  <div className="admin-search-wrap">
                    <Search className="admin-search-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Search by title, seller, post ID..."
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
                          {c === "all" ? "All categories" : c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-table-actions">
                  <span className="admin-count-badge">
                    {filtered.length} listing(s)
                  </span>
                </div>
              </div>
              <div className="admin-table admin-approved-table">
                <div className="admin-table-row admin-table-header">
                  <div>ID / Listing</div>
                  <div>Seller</div>
                  <div>Category</div>
                  <div>Price</div>
                  <div>Ngày duyệt</div>
                  <div>Người duyệt</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {loading ? (
                  <div className="admin-table-empty">Loading listings...</div>
                ) : filtered.length === 0 ? (
                  <div className="admin-table-empty">No listings.</div>
                ) : (
                  filtered.map((row, idx) => (
                    <div
                      className="admin-table-row"
                      key={row?.id ?? `approved-${idx}`}
                    >
                      <div
                        className="admin-approved-listing-cell admin-row-link"
                        onClick={() => row.id && setPreviewId(row.id)}
                        title="View listing"
                      >
                        {row.thumbnail ? (
                          <img
                            src={row.thumbnail}
                            alt={row.title}
                            className="admin-approved-thumb"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="admin-approved-thumb-placeholder" />
                        )}
                        <div className="admin-approved-title">{row.title}</div>
                      </div>
                      <div>{row.seller}</div>
                      <div>{row.category}</div>
                      <div className="admin-approved-price">{row.price}</div>
                      <div>
                        {row.inspectedAt
                          ? new Date(row.inspectedAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : "—"}
                      </div>
                      <div>
                        {row.approvedBy ? (
                          <div
                            className="admin-account-cell"
                            title={row.approvedBy}
                          >
                            <span className="admin-account-avatar">
                              {getInitials(row.approvedBy)}
                            </span>
                            <span className="admin-account-name">
                              {row.approvedBy}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div>
                        <span
                          className={`admin-status ${row.status?.toLowerCase?.() ?? "verified"}`}
                        >
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
                          onClick={() => row.id && setPreviewId(row.id)}
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
=======
                Các bài post đã được Admin duyệt, đang chờ kiểm định trước khi lên sàn.
              </p>
          </header>

          <section className="admin-card admin-table-card">
            <div className="admin-card-header">
              <div className="admin-approved-filters">
                <div className="admin-search-wrap">
                  <Search className="admin-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="Search by title, seller, post ID..."
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
                        {c === "all" ? "All categories" : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-table-actions">
                <span className="admin-count-badge">
                  {filtered.length} listing(s)
                </span>
              </div>
            </div>
            <div className="admin-table admin-approved-table">
              <div className="admin-table-row admin-table-header">
                <div>ID / Listing</div>
                <div>Seller</div>
                <div>Category</div>
                <div>Price</div>
                <div>Ngày duyệt</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {loading ? (
                <div className="admin-table-empty">Loading listings...</div>
              ) : filtered.length === 0 ? (
                <div className="admin-table-empty">No listings.</div>
              ) : (
                filtered.map((row, idx) => (
                  <div className="admin-table-row" key={row?.id ?? `approved-${idx}`}>
                    <div
                      className="admin-approved-listing-cell admin-row-link"
                      onClick={() => row.id && setPreviewId(row.id)}
                      title="View listing"
                    >
                      {row.thumbnail ? (
                        <img
                          src={row.thumbnail}
                          alt={row.title}
                          className="admin-approved-thumb"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="admin-approved-thumb-placeholder" />
                      )}
                      <div className="admin-approved-title">{row.title}</div>
                    </div>
                    <div>{row.seller}</div>
                    <div>{row.category}</div>
                    <div className="admin-approved-price">{row.price}</div>
                    <div>
                      {row.inspectedAt
                        ? new Date(row.inspectedAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </div>
                    <div>
                      <span className={`admin-status ${row.status?.toLowerCase?.() ?? "verified"}`}>
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
                        onClick={() => row.id && setPreviewId(row.id)}
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
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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

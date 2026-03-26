import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { Search, Eye, MoreHorizontal, Filter } from "lucide-react";
import { POSTING_STATUS_LABEL } from "../../../constants/postingStatus";
import adminPostService from "../../../services/adminPostService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import "../dashboard/index.css";
import "./index.css";

const PAGE_SIZE = 10;

export default function AdminApprovedListings() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewId, setPreviewId] = useState(null);
  const [page, setPage] = useState(1);

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
    };
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminPostService.getAllPosts();
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
      const list = Array.isArray(raw)
        ? raw
        : (raw?.content ?? raw?.posts ?? raw?.data ?? []);
      const normalized = list.map(normalizePost);
      normalized.sort((a, b) => {
        const ta = new Date(a.inspectedAt ?? 0).getTime();
        const tb = new Date(b.inspectedAt ?? 0).getTime();
        return tb - ta;
      });
      setListings(normalized);
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
      const matchStatus =
        statusFilter === "all" ||
        String(row.status ?? "").toUpperCase() === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [listings, search, categoryFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, listings.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categories = useMemo(() => {
    const set = new Set(listings.map((r) => r.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [listings]);

  const statusOptions = useMemo(() => {
    const set = new Set(
      listings.map((r) => String(r.status ?? "").toUpperCase()).filter(Boolean),
    );
    return ["all", ...Array.from(set)];
  }, [listings]);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-approved-listings-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            <header className="admin-topbar">
              <h1 className="admin-page-title">
                Marketplace listing overview
              </h1>
              <p className="admin-page-subtitle">
                Full list of marketplace listings across all statuses.
              </p>
            </header>

            <section className="admin-card admin-table-card">
              <div className="admin-status-filter-bar">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`admin-status-filter-btn ${
                      statusFilter === status ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all"
                      ? "All status"
                      : (POSTING_STATUS_LABEL[status] ?? status)}
                  </button>
                ))}
              </div>
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
                  <div>Updated at</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
                {loading ? (
                  <div className="admin-table-empty">Loading listings...</div>
                ) : pageRows.length === 0 ? (
                  <div className="admin-table-empty">No listings.</div>
                ) : (
                  pageRows.map((row, idx) => (
                    <div
                      className="admin-table-row"
                      key={row?.id ?? `listing-${idx}`}
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
                              "en-US",
                            )
                          : "—"}
                      </div>
                      <div>
                        <span
                          className={`admin-status-chip admin-status-chip--${String(
                            row.status ?? "",
                          )
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, "-")}`}
                        >
                          {POSTING_STATUS_LABEL[row.status] ||
                            row.status ||
                            "—"}
                        </span>
                      </div>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="View details"
                          aria-label="View"
                          onClick={() => row.id && setPreviewId(row.id)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="More"
                          aria-label="More"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="admin-tx-pagination" style={{ marginTop: 12 }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>
                    {filtered.length} listing(s) · Page {page}/{totalPages}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      className="admin-tx-page-btn"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="admin-tx-page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </section>
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

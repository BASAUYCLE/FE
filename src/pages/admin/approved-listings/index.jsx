import { useState, useMemo, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Eye,
  MoreHorizontal,
  Filter,
  ChevronDown,
  Check,
  LayoutGrid,
  CheckCircle2,
  BadgeCheck,
  BadgeDollarSign,
  Repeat,
  Clock,
  Ban,
} from "lucide-react";
import { POSTING_STATUS_LABEL } from "../../../constants/postingStatus";
import adminPostService from "../../../services/adminPostService";
import { formatCurrency } from "../../../utils/formatCurrency";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import AdminToolbarFilters from "../../../components/admin/AdminToolbarFilters";
import "../dashboard/index.css";
import "../user/index.css";
import "./index.css";

/** Kích thước icon Lucide — khớp `.stat-icon svg` (22px) trên admin-users */
const LUCIDE_STAT = { size: 22, strokeWidth: 2 };
const LUCIDE_TABLE_ACTION = { size: 16, strokeWidth: 2 };

/** Thẻ lọc trạng thái — Lucide components + stat-card giống admin-users */
const LISTING_STATS_CONFIG = [
  {
    key: "members",
    filter: "all",
    label: "All listings",
    Icon: LayoutGrid,
  },
  {
    key: "verified",
    filter: "AVAILABLE",
    label: "Available",
    Icon: CheckCircle2,
  },
  {
    key: "hidden",
    filter: "SOLD",
    label: "Sold",
    Icon: BadgeCheck,
  },
  {
    key: "deposited",
    filter: "DEPOSITED",
    label: "Deposited",
    Icon: BadgeDollarSign,
  },
  {
    key: "pending",
    filter: "PROCESSING",
    label: "In transaction",
    Icon: Repeat,
  },
  {
    key: "listing-pending",
    filter: "PENDING",
    label: "Pending",
    Icon: Clock,
  },
  {
    key: "rejected",
    filter: "REJECTED",
    label: "Rejected",
    Icon: Ban,
  },
];

const PAGE_SIZE = 10;

function categoryOptionLabel(c) {
  return c === "all" ? "All categories" : c;
}

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

  const categoryFilterOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c,
        label: categoryOptionLabel(c),
      })),
    [categories],
  );

  const countForStatusFilter = useCallback(
    (filter) => {
      if (filter === "all") return listings.length;
      return listings.filter(
        (l) => String(l.status ?? "").toUpperCase() === filter,
      ).length;
    },
    [listings],
  );

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-approved-listings-page admin-toolbar-page">
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
              <section className="user-stats admin-approved-listing-stats">
                {LISTING_STATS_CONFIG.map((item) => {
                  const { Icon } = item;
                  const count = countForStatusFilter(item.filter);
                  const isActive =
                    item.filter === "all"
                      ? statusFilter === "all"
                      : statusFilter === item.filter;
                  return (
                    <div
                      key={item.key}
                      role="button"
                      tabIndex={0}
                      className={`stat-card stat-card--${item.key} ${
                        isActive ? "stat-card--active" : ""
                      }`}
                      onClick={() => setStatusFilter(item.filter)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setStatusFilter(item.filter);
                        }
                      }}
                    >
                      <div className="stat-icon">
                        <Icon aria-hidden {...LUCIDE_STAT} />
                      </div>
                      <div className="stat-meta">
                        <div className="stat-label">{item.label}</div>
                        <div className="stat-row">
                          <span className="stat-value">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
              <div className="admin-card-header">
                <AdminToolbarFilters
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search by title, seller, post ID..."
                  filterValue={categoryFilter}
                  onFilterChange={setCategoryFilter}
                  filterOptions={categoryFilterOptions}
                  idPrefix="admin-approved-category"
                  filterAriaLabel="Filter by category"
                />
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
                          <Eye aria-hidden {...LUCIDE_TABLE_ACTION} />
                        </button>
                        <button
                          type="button"
                          className="admin-actions-button"
                          title="More"
                          aria-label="More"
                        >
                          <MoreHorizontal aria-hidden {...LUCIDE_TABLE_ACTION} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!loading && (
                <AdminPaginationBar
                  totalCount={filtered.length}
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  nounPhrase="listing(s)"
                  style={{ padding: "0 20px 16px" }}
                />
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

import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { Search, ArrowDownCircle, ArrowUpCircle, TrendingUp, Users } from "lucide-react";
import axiosInstance from "../../../services/axiosConfig";
import { formatCurrency } from "../../../utils/formatCurrency";
import "../dashboard/index.css";
import "./index.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const TX_TYPE_LABEL = {
  TOP_UP:   "Top up",
  DEPOSIT:  "Deposit",
  PURCHASE: "Purchase",
  REFUND:   "Refund",
  POSTING_FEE: "Posting fee",
};

const TX_TYPE_COLOR = {
  TOP_UP:      "#10b981",
  REFUND:      "#3b82f6",
  DEPOSIT:     "#d97706",
  PURCHASE:    "#7c3aed",
  POSTING_FEE: "#f43f5e",
};

const TX_STATUS_CONFIG = {
  SUCCESS:   { label: "Success", bg: "#dcfce7", color: "#16a34a" },
  COMPLETED: { label: "Success", bg: "#dcfce7", color: "#16a34a" },
  PENDING:   { label: "Processing", bg: "#fef9c3", color: "#b45309" },
  FAILED:    { label: "Failed",   bg: "#fee2e2", color: "#dc2626" },
};

const TYPE_FILTERS = [
  { value: "ALL",         label: "All" },
  { value: "TOP_UP",      label: "Top up" },
  { value: "DEPOSIT",     label: "Deposit" },
  { value: "PURCHASE",    label: "Purchase" },
  { value: "REFUND",      label: "Refund" },
  { value: "POSTING_FEE", label: "Posting fee" },
];

const STATUS_FILTERS = [
  { value: "ALL",      label: "All" },
  { value: "SUCCESS",  label: "Success" },
  { value: "PENDING",  label: "Processing" },
  { value: "FAILED",   label: "Failed" },
];

const PAGE_SIZE = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTxType = (tx) =>
  tx.transactionType ?? tx.transaction_type ?? tx.type ?? null;

const getTxStatus = (tx) =>
  tx.status ?? tx.transactionStatus ?? null;

const isMoneyIn = (type) => type === "TOP_UP" || type === "REFUND";

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransactionManagement() {
  const [allTx, setAllTx]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter]     = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage]       = useState(1);

  /** Parse bất kỳ dạng response nào về array */
  const parseList = (res) => {
    const raw = res?.result ?? res?.data ?? res;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.content))      return raw.content;
    if (Array.isArray(raw?.transactions)) return raw.transactions;
    if (Array.isArray(raw?.data))         return raw.data;
    return null;
  };

  /** Bước 1: thử các admin endpoint tổng hợp */
  const tryAdminEndpoints = useCallback(async () => {
    const ADMIN_URLS = [
      "/admin/transactions",
      "/admin/wallets/transactions",
      "/transactions/all",
      "/admin/wallet/all-transactions",
    ];
    for (const url of ADMIN_URLS) {
      try {
        const res = await axiosInstance.get(url);
        const list = parseList(res);
        if (list && list.length > 0) {
          console.info(`AdminTx: ✓ ${url} → ${list.length} records`);
          return list;
        }
      } catch (err) {
        const s = err?.status ?? 0;
        if (s !== 404 && s !== 403 && s !== 405) {
          console.warn(`AdminTx: ${url} →`, err?.message);
        }
      }
    }
    return null; // không tìm được → dùng chiến lược per-user
  }, []);

  /** Bước 2: fetch danh sách users rồi lấy transaction từng người song song */
  const fetchPerUser = useCallback(async () => {
    // Lấy danh sách tất cả users
    let users = [];
    try {
      const res = await axiosInstance.get("/admin/users");
      const raw = res?.result ?? res?.data ?? res;
      users = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content) ? raw.content
        : Array.isArray(raw?.users)   ? raw.users
        : [];
    } catch {
      return [];
    }
    if (!users.length) return [];

    // Với mỗi user, thử lấy transaction của họ
    // BE Spring Boot thường dùng /transactions?userId= hoặc /transactions/{userId}
    const TX_USER_URLS = (uid) => [
      `/admin/transactions?userId=${uid}`,
      `/admin/users/${uid}/transactions`,
      `/transactions?userId=${uid}`,
      `/transactions/${uid}`,
    ];

    const results = await Promise.allSettled(
      users.map(async (u) => {
        const uid = u.userId ?? u.id ?? u.accountId;
        if (!uid) return [];
        const displayName = u.fullName ?? u.name ?? u.email ?? String(uid);

        for (const url of TX_USER_URLS(uid)) {
          try {
            const res = await axiosInstance.get(url);
            const list = parseList(res);
            if (list && list.length > 0) {
              // gán thông tin user vào từng transaction
              return list.map((tx) => ({
                ...tx,
                userName:   tx.userName   ?? tx.userFullName ?? displayName,
                userEmail:  tx.userEmail  ?? u.email ?? "",
                _userId:    uid,
              }));
            }
          } catch {
            // thử URL tiếp theo
          }
        }
        return [];
      }),
    );

    const merged = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    // Loại bỏ trùng lặp theo transactionId
    const seen = new Set();
    return merged.filter((tx) => {
      const key = tx.transactionId ?? tx.id ?? JSON.stringify(tx);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Chiến lược 1: admin endpoint tổng hợp
      let list = await tryAdminEndpoints();

      // Chiến lược 2: per-user aggregation (fallback)
      if (!list || list.length === 0) {
        console.info("AdminTx: falling back to per-user aggregation…");
        list = await fetchPerUser();
      }

      // Sắp xếp mới nhất trước
      list.sort(
        (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
      );
      console.info(`AdminTx: total ${list.length} transactions`);
      setAllTx(list);
    } catch (err) {
      console.warn("AdminTransactions: fetch failed", err?.message);
      setAllTx([]);
    } finally {
      setLoading(false);
    }
  }, [tryAdminEndpoints, fetchPerUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Filter & search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allTx.filter((tx) => {
      const type   = getTxType(tx) ?? "";
      const status = getTxStatus(tx) ?? "";
      const member = (
        tx.userName ?? tx.userFullName ?? tx.fullName ??
        tx.email ?? tx.userEmail ?? ""
      ).toLowerCase();
      const desc = (tx.description ?? "").toLowerCase();
      const q = search.trim().toLowerCase();

      if (typeFilter   !== "ALL" && type   !== typeFilter)   return false;
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (q && !member.includes(q) && !desc.includes(q))    return false;
      return true;
    });
  }, [allTx, typeFilter, statusFilter, search]);

  // reset page khi filter thay đổi
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const success = allTx.filter(
      (tx) => (getTxStatus(tx) ?? "") !== "FAILED",
    );
    const totalIn  = success
      .filter((tx) => isMoneyIn(getTxType(tx)))
      .reduce((s, tx) => s + Math.abs(tx.amount ?? 0), 0);
    const totalOut = success
      .filter((tx) => !isMoneyIn(getTxType(tx)))
      .reduce((s, tx) => s + Math.abs(tx.amount ?? 0), 0);
    const topUpCount    = success.filter((tx) => getTxType(tx) === "TOP_UP").length;
    const depositCount  = success.filter((tx) => getTxType(tx) === "DEPOSIT").length;
    const purchaseCount = success.filter((tx) => getTxType(tx) === "PURCHASE").length;
    const members = new Set(
      allTx.map((tx) => tx.userId ?? tx.accountId ?? tx.userEmail).filter(Boolean),
    ).size;
    return { totalIn, totalOut, topUpCount, depositCount, purchaseCount, members };
  }, [allTx]);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-tx-page">
        <div className="admin-dashboard">
          <div className="admin-content">

            {/* Header */}
            <header className="admin-topbar" style={{ flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 className="admin-page-title" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#0f172a" }}>
                  Member transactions
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                  All transactions: top up · deposit · purchase · refund · posting fee
                </p>
              </div>
            </header>

            {/* Stats */}
            <section className="admin-stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon green"><ArrowDownCircle /></div>
                  <span className="admin-stat-trend up">money in</span>
                </div>
                <div className="admin-stat-title">Total in</div>
                <div className="admin-stat-value">{formatCurrency(stats.totalIn)}</div>
              </div>

              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                    <ArrowUpCircle />
                  </div>
                  <span className="admin-stat-trend" style={{ color: "#d97706" }}>tiền ra</span>
                </div>
                <div className="admin-stat-title">Tổng tiền ra</div>
                <div className="admin-stat-value">{formatCurrency(stats.totalOut)}</div>
              </div>

              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon indigo"><TrendingUp /></div>
                  <span className="admin-stat-trend up">{stats.topUpCount} top up · {stats.depositCount} deposit · {stats.purchaseCount} purchase</span>
                </div>
                <div className="admin-stat-title">Successful transactions</div>
                <div className="admin-stat-value">
                  {allTx.filter((tx) => (getTxStatus(tx) ?? "") !== "FAILED").length}
                </div>
              </div>

              <div className="admin-card admin-stat-card">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon blue"><Users /></div>
                  <span className="admin-stat-trend up">members</span>
                </div>
                <div className="admin-stat-title">Members with transactions</div>
                <div className="admin-stat-value">{stats.members || allTx.length}</div>
              </div>
            </section>

            {/* Filters */}
            <div className="admin-card admin-tx-filters">
              {/* Search */}
              <div className="admin-tx-search">
                <Search size={15} color="#94a3b8" />
                <input
                  placeholder="Search by name / email / description…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Type */}
              <div className="admin-tx-filter-group">
                <span className="admin-tx-filter-label">Loại GD</span>
                <div className="admin-tx-filter-pills">
                  {TYPE_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      className={`admin-tx-pill ${typeFilter === f.value ? "active" : ""}`}
                      onClick={() => setTypeFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="admin-tx-filter-group">
                <span className="admin-tx-filter-label">Status</span>
                <div className="admin-tx-filter-pills">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      className={`admin-tx-pill ${statusFilter === f.value ? "active" : ""}`}
                      onClick={() => setStatusFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <section className="admin-card admin-tx-table-card">
              <div className="admin-tx-table">
                {/* Header */}
                <div className="admin-tx-row admin-tx-header">
                  <div>Member</div>
                  <div>Type</div>
                  <div>Description</div>
                  <div>Date & time</div>
                  <div style={{ textAlign: "right" }}>Amount</div>
                  <div>Status</div>
                </div>

                {loading ? (
                  <div className="admin-tx-empty">Loading…</div>
                ) : pageItems.length === 0 ? (
                  <div className="admin-tx-empty">No matching transactions.</div>
                ) : (
                  pageItems.map((tx, idx) => {
                    const type   = getTxType(tx);
                    const status = getTxStatus(tx);
                    const moneyIn = isMoneyIn(type);
                    const isFailed = status === "FAILED";
                    const amtColor = isFailed ? "#94a3b8" : moneyIn ? "#10b981" : "#ef4444";
                    const amtPrefix = isFailed ? "" : moneyIn ? "+" : "−";
                    const statusCfg = TX_STATUS_CONFIG[status] ?? { label: status ?? "—", bg: "#f1f5f9", color: "#64748b" };
                    const typeColor = TX_TYPE_COLOR[type] ?? "#64748b";
                    const member = tx.userName ?? tx.userFullName ?? tx.fullName ?? tx.email ?? tx.userEmail ?? "—";

                    return (
                      <div
                        className="admin-tx-row"
                        key={tx.transactionId ?? tx.id ?? idx}
                      >
                        {/* Thành viên */}
                        <div className="admin-tx-member">
                          <div className="admin-tx-avatar">
                            {(member[0] ?? "?").toUpperCase()}
                          </div>
                          <span>{member}</span>
                        </div>

                        {/* Loại */}
                        <div>
                          <span
                            className="admin-tx-type-badge"
                            style={{ background: `${typeColor}18`, color: typeColor }}
                          >
                            {TX_TYPE_LABEL[type] ?? type ?? "—"}
                          </span>
                        </div>

                        {/* Mô tả */}
                        <div className="admin-tx-desc">
                          {tx.description || "—"}
                        </div>

                        {/* Ngày */}
                        <div className="admin-tx-date">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString("en-US", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </div>

                        {/* Số tiền */}
                        <div style={{ textAlign: "right", fontWeight: 700, color: amtColor }}>
                          {amtPrefix}{formatCurrency(Math.abs(tx.amount ?? 0))}
                        </div>

                        {/* Trạng thái */}
                        <div>
                          <span
                            className="admin-tx-status-badge"
                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-tx-pagination">
                  <span style={{ color: "#64748b", fontSize: 13 }}>
                    {filtered.length} transactions · Page {page}/{totalPages}
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
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const pg = page <= 4
                        ? i + 1
                        : page >= totalPages - 3
                          ? totalPages - 6 + i
                          : page - 3 + i;
                      if (pg < 1 || pg > totalPages) return null;
                      return (
                        <button
                          key={pg}
                          type="button"
                          className={`admin-tx-page-btn ${pg === page ? "active" : ""}`}
                          onClick={() => setPage(pg)}
                        >
                          {pg}
                        </button>
                      );
                    })}
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
    </AdminLayout>
  );
}

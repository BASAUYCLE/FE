import { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar } from "antd";
import AdminLayout from "../../../components/layout/AdminLayout";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import { Search } from "lucide-react";
import adminService from "../../../services/adminService";
import userService from "../../../services/userService";
import {
  buildAvatarUrlMapFromUsers,
  getAvatarForTransactionRow,
} from "../../../utils/avatar";
import "../dashboard/index.css";
import "./index.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const TX_TYPE_LABEL = {
  TOP_UP: "Top up",
  DEPOSIT: "Deposit",
  PURCHASE: "Purchase",
  REFUND: "Refund",
  POSTING_FEE: "Posting fee",
  WITHDRAW: "Withdrawal",
};

const TX_TYPE_COLOR = {
  TOP_UP: "#10b981",
  REFUND: "#3b82f6",
  DEPOSIT: "#d97706",
  PURCHASE: "#7c3aed",
  POSTING_FEE: "#f43f5e",
  WITHDRAW: "#0d9488",
};

const TX_STATUS_CONFIG = {
  SUCCESS: { label: "Success", bg: "#dcfce7", color: "#16a34a" },
  COMPLETED: { label: "Success", bg: "#dcfce7", color: "#16a34a" },
  PENDING: { label: "Processing", bg: "#fef9c3", color: "#b45309" },
  FAILED: { label: "Failed", bg: "#fee2e2", color: "#dc2626" },
};

const TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "TOP_UP", label: "Top up" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "REFUND", label: "Refund" },
  { value: "POSTING_FEE", label: "Posting fee" },
  { value: "WITHDRAW", label: "Withdrawal" },
];

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "SUCCESS", label: "Success" },
  { value: "PENDING", label: "Processing" },
  { value: "FAILED", label: "Failed" },
];

const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTxType = (tx) =>
  tx.transactionType ?? tx.transaction_type ?? tx.type ?? null;

const getTxStatus = (tx) => tx.status ?? tx.transactionStatus ?? null;

// ─── Component ───────────────────────────────────────────────────────────────

export default function TransactionManagement() {
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarByUserId, setAvatarByUserId] = useState(() => new Map());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  /** Parse bất kỳ dạng response nào về array */
  const parseList = (res) => {
    const raw = res?.result ?? res?.data ?? res;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.transactions)) return raw.transactions;
    if (Array.isArray(raw?.data)) return raw.data;
    return null;
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, usersRes] = await Promise.allSettled([
        adminService.getAllTransactions(),
        userService.getAdminUsers(),
      ]);

      const list =
        txRes.status === "fulfilled" ? (parseList(txRes.value) ?? []) : [];
      list.sort(
        (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
      );
      console.info(`AdminTx: total ${list.length} transactions`);
      setAllTx(list);

      if (usersRes.status === "fulfilled" && usersRes.value) {
        const body = usersRes.value?.data ?? usersRes.value;
        const raw = body?.result ?? body?.data ?? body?.content ?? body;
        const users = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
            ? raw.content
            : [];
        setAvatarByUserId(buildAvatarUrlMapFromUsers(users));
      } else {
        setAvatarByUserId(new Map());
      }
    } catch (err) {
      console.warn("AdminTransactions: fetch failed", err?.message);
      setAllTx([]);
      setAvatarByUserId(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Filter & search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return allTx.filter((tx) => {
      const type = getTxType(tx) ?? "";
      const status = getTxStatus(tx) ?? "";
      const member = (
        tx.userName ??
        tx.userFullName ??
        tx.fullName ??
        tx.email ??
        tx.userEmail ??
        ""
      ).toLowerCase();
      const desc = (tx.description ?? "").toLowerCase();
      const q = search.trim().toLowerCase();

      if (typeFilter !== "ALL" && type !== typeFilter) return false;
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (q && !member.includes(q) && !desc.includes(q)) return false;
      return true;
    });
  }, [allTx, typeFilter, statusFilter, search]);

  // reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-tx-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            {/* Header */}
            <header
              className="admin-topbar"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <h1
                  className="admin-page-title"
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: "0 0 4px",
                    color: "#0f172a",
                  }}
                >
                  Member transactions
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                  All transactions: top up · deposit · purchase · refund ·
                  posting fee
                </p>
              </div>
            </header>

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
                <span className="admin-tx-filter-label">Transaction type</span>
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
                  <div>Status</div>
                </div>

                {loading ? (
                  <div className="admin-tx-empty">Loading…</div>
                ) : pageItems.length === 0 ? (
                  <div className="admin-tx-empty">
                    No matching transactions.
                  </div>
                ) : (
                  pageItems.map((tx, idx) => {
                    const type = getTxType(tx);
                    const status = getTxStatus(tx);
                    const statusCfg = TX_STATUS_CONFIG[status] ?? {
                      label: status ?? "—",
                      bg: "#f1f5f9",
                      color: "#64748b",
                    };
                    const typeColor = TX_TYPE_COLOR[type] ?? "#64748b";
                    const member =
                      tx.userName ??
                      tx.userFullName ??
                      tx.fullName ??
                      tx.email ??
                      tx.userEmail ??
                      "—";
                    const avatarUrl = getAvatarForTransactionRow(
                      tx,
                      avatarByUserId,
                    );

                    return (
                      <div
                        className="admin-tx-row"
                        key={tx.transactionId ?? tx.id ?? idx}
                      >
                        {/* Thành viên */}
                        <div className="admin-tx-member">
                          <Avatar
                            className="admin-tx-avatar"
                            size={30}
                            src={avatarUrl || undefined}
                          >
                            {(member[0] ?? "?").toUpperCase()}
                          </Avatar>
                          <span>{member}</span>
                        </div>

                        {/* Loại */}
                        <div>
                          <span
                            className="admin-tx-type-badge"
                            style={{
                              background: `${typeColor}18`,
                              color: typeColor,
                            }}
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
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </div>

                        {/* Trạng thái */}
                        <div>
                          <span
                            className="admin-tx-status-badge"
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                            }}
                          >
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <AdminPaginationBar
                className="admin-tx-pagination"
                style={{ marginTop: 0 }}
                totalCount={filtered.length}
                page={page}
                totalPages={totalPages}
                setPage={setPage}
                nounPhrase="transactions"
              />
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

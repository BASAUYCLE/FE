import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Avatar,
  Button,
  Table,
  message,
  Spin,
  Tag,
  Tooltip,
  Modal,
  Descriptions,
  Space,
} from "antd";
import { Wallet, RefreshCw, Clock, Banknote, Copy, Eye } from "lucide-react";
import adminService from "../../../services/adminService";
import userService from "../../../services/userService";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import { formatCurrency } from "../../../utils/formatCurrency";
import {
  buildAvatarUrlMapFromUsers,
  getAvatarForTransactionRow,
} from "../../../utils/avatar";
import { confirmCrud } from "../../../utils/confirmCrud";
import "../dashboard/index.css";
import "../transaction/index.css";
import "./index.css";

function getTxType(tx) {
  return (tx.transactionType ?? tx.transaction_type ?? tx.type ?? "")
    .toString()
    .toUpperCase();
}

function getTxStatus(tx) {
  return (tx.status ?? tx.transactionStatus ?? tx.transaction_status ?? "")
    .toString()
    .toUpperCase();
}

function getCreatedAt(tx) {
  const v = tx.createdAt ?? tx.created_at;
  return v ? new Date(v).getTime() : 0;
}

function pickMember(tx) {
  const email =
    tx.userEmail ?? tx.user_email ?? tx.email ?? tx.memberEmail ?? "";
  const name =
    tx.userFullName ??
    tx.user_full_name ??
    tx.userName ??
    tx.user_name ??
    tx.fullName ??
    "";
  return { email: email || "—", name: name || "" };
}

function pickBank(tx) {
  return {
    bankName: tx.bankName ?? tx.bank_name ?? "",
    bankAccountNumber: tx.bankAccountNumber ?? tx.bank_account_number ?? "",
    bankAccountHolder: tx.bankAccountHolder ?? tx.bank_account_holder ?? "",
  };
}

async function copyText(text) {
  const t = String(text ?? "").trim();
  if (!t) return;
  try {
    await navigator.clipboard.writeText(t);
    message.success("Copied to clipboard.");
  } catch {
    message.error("Could not copy.");
  }
}

/** Merge paginated Spring results when needed. */
async function fetchAllTransactionsMerged() {
  const pageSize = 100;
  let page = 0;
  const all = [];
  for (;;) {
    const res = await adminService.getAllTransactions({ page, size: pageSize });
    const raw = res?.result ?? res?.data ?? res;
    const list = Array.isArray(raw?.content)
      ? raw.content
      : Array.isArray(raw)
        ? raw
        : [];
    all.push(...list);
    const totalPages =
      typeof raw?.totalPages === "number" ? raw.totalPages : page + 1;
    page += 1;
    if (page >= totalPages || list.length === 0) break;
    if (page > 40) break;
  }
  return all;
}

const PAGE_SIZE = 10;

export default function AdminWithdrawals() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [avatarByUserId, setAvatarByUserId] = useState(() => new Map());
  const [actionId, setActionId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [all, usersRes] = await Promise.all([
        fetchAllTransactionsMerged(),
        userService.getAdminUsers().catch(() => null),
      ]);

      if (usersRes) {
        const body = usersRes?.data ?? usersRes;
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

      const pending = all.filter((tx) => {
        return getTxType(tx) === "WITHDRAW" && getTxStatus(tx) === "PENDING";
      });
      pending.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
      setRows(pending);
    } catch (e) {
      message.error(e?.message || "Không tải được giao dịch.");
      setRows([]);
      setAvatarByUserId(new Map());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // reset page when list changes (refresh / approve / reject)
  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageItems = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPendingAmount = useMemo(
    () =>
      rows.reduce((sum, r) => {
        const n = Number(r.amount ?? 0);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0),
    [rows],
  );

  const openDetail = (record) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  const handleApprove = async (record) => {
    const id = record.transactionId ?? record.id;
    if (id == null) return;
    const bank = pickBank(record);
    const ok = await confirmCrud({
      title: "Approve withdrawal?",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            Confirm you have transferred{" "}
            <strong>{formatCurrency(record.amount ?? 0)}</strong> to{" "}
            <strong>{bank.bankName || "—"}</strong> — account{" "}
            <strong>{bank.bankAccountNumber || "—"}</strong>?
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Only approve after the bank transfer is complete.
          </p>
        </div>
      ),
      okText: "Approve",
    });
    if (!ok) return;
    setActionId(id);
    try {
      await adminService.approveWithdrawal(id);
      message.success("Withdrawal approved.");
      setDetailOpen(false);
      setDetailRecord(null);
      await load();
    } catch (e) {
      message.error(e?.message || "Approval failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (record) => {
    const id = record.transactionId ?? record.id;
    if (id == null) return;
    const ok = await confirmCrud({
      title: "Reject withdrawal?",
      content: "The amount will be returned to the member’s wallet. Continue?",
      okText: "Reject",
      danger: true,
    });
    if (!ok) return;
    setActionId(id);
    try {
      await adminService.rejectWithdrawal(id);
      message.success("Withdrawal rejected.");
      setDetailOpen(false);
      setDetailRecord(null);
      await load();
    } catch (e) {
      message.error(e?.message || "Rejection failed.");
    } finally {
      setActionId(null);
    }
  };

  const columns = [
    {
      title: "ID",
      key: "id",
      width: 88,
      render: (_, r) => (
        <span className="withdrawals-tx-id">
          {r.transactionId ?? r.id ?? "—"}
        </span>
      ),
    },
    {
      title: "Member",
      key: "member",
      width: 200,
      ellipsis: true,
      render: (_, r) => {
        const { email, name } = pickMember(r);
        const avatarUrl = getAvatarForTransactionRow(r, avatarByUserId);
        const initial = (name || email || "?")[0];
        return (
          <div className="withdrawals-member withdrawals-member--with-avatar">
            <Avatar
              className="withdrawals-member-avatar"
              size={32}
              src={avatarUrl || undefined}
            >
              {String(initial).toUpperCase()}
            </Avatar>
            <div className="withdrawals-member-text">
              {name ? (
                <Tooltip title={`${name} · ${email}`}>
                  <span className="withdrawals-member-name">{name}</span>
                </Tooltip>
              ) : null}
              <Tooltip title={email}>
                <span className="withdrawals-member-sub">{email}</span>
              </Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      title: "Amount",
      key: "amount",
      width: 140,
      render: (_, r) => (
        <span className="withdrawals-amount">
          {formatCurrency(r.amount ?? 0)}
        </span>
      ),
    },
    {
      title: "Bank",
      key: "bank",
      width: 96,
      ellipsis: true,
      render: (_, r) => {
        const { bankName } = pickBank(r);
        return (
          <Tooltip title={bankName || "—"}>
            <span>{bankName || "—"}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Account no.",
      key: "acct",
      width: 130,
      render: (_, r) => {
        const n = pickBank(r).bankAccountNumber || "—";
        return (
          <div className="withdrawals-copy-row">
            <Tooltip title={n}>
              <span>{n}</span>
            </Tooltip>
            {n !== "—" ? (
              <Button
                type="text"
                size="small"
                icon={<Copy size={14} />}
                aria-label="Copy account number"
                onClick={() => copyText(n)}
              />
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Requested",
      key: "createdAt",
      width: 158,
      render: (_, r) => {
        const d = r.createdAt ?? r.created_at;
        return d
          ? new Date(d).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
      },
    },
    {
      title: "Status",
      key: "st",
      width: 110,
      render: () => (
        <Tag color="gold" style={{ margin: 0 }}>
          Pending
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 248,
      align: "right",
      render: (_, record) => {
        const busy = actionId === (record.transactionId ?? record.id);
        return (
          <Space
            size={8}
            wrap={false}
            className="withdrawals-actions"
            align="center"
          >
            <Button
              type="default"
              size="small"
              className="withdrawals-action-btn"
              icon={<Eye size={14} strokeWidth={2} />}
              onClick={() => openDetail(record)}
            >
              Details
            </Button>
            <Button
              type="primary"
              size="small"
              className="withdrawals-action-btn"
              loading={busy}
              disabled={actionId != null && !busy}
              onClick={() => handleApprove(record)}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              className="withdrawals-action-btn"
              loading={busy}
              disabled={actionId != null && !busy}
              onClick={() => handleReject(record)}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  const detailBank = detailRecord ? pickBank(detailRecord) : null;
  const detailMember = detailRecord ? pickMember(detailRecord) : null;
  const detailId = detailRecord
    ? (detailRecord.transactionId ?? detailRecord.id)
    : null;
  const isBusyDetail =
    detailId != null &&
    actionId != null &&
    String(actionId) === String(detailId);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-tx-page admin-withdrawals-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            <header
              className="admin-topbar"
              style={{ flexWrap: "wrap", gap: 16 }}
            >
              <div>
                <h1 className="admin-page-title withdrawals-page-title">
                  <span className="withdrawals-hero-icon" aria-hidden>
                    <Wallet size={20} strokeWidth={2} />
                  </span>
                  Withdrawal approvals
                </h1>
                <p className="admin-page-subtitle withdrawals-page-subtitle">
                  Pending <strong>WITHDRAW</strong> requests. Approve after
                  transfer; reject returns funds to the member’s wallet.
                </p>
              </div>
              <div className="admin-topbar-actions">
                <Button
                  icon={<RefreshCw size={16} />}
                  onClick={() => load()}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            </header>

            <section className="withdrawals-stats-row">
              <div className="admin-card withdrawals-stat-card">
                <div
                  className="withdrawals-stat-icon withdrawals-stat-icon--amber"
                  aria-hidden
                >
                  <Clock size={22} strokeWidth={2} />
                </div>
                <div>
                  <div className="withdrawals-stat-label">Pending requests</div>
                  <div className="withdrawals-stat-value">{rows.length}</div>
                  <div className="withdrawals-stat-hint">
                    WITHDRAW · PENDING
                  </div>
                </div>
              </div>
              <div className="admin-card withdrawals-stat-card">
                <div
                  className="withdrawals-stat-icon withdrawals-stat-icon--teal"
                  aria-hidden
                >
                  <Banknote size={22} strokeWidth={2} />
                </div>
                <div>
                  <div className="withdrawals-stat-label">
                    Total pending amount
                  </div>
                  <div className="withdrawals-stat-value">
                    {formatCurrency(totalPendingAmount)}
                  </div>
                  <div className="withdrawals-stat-hint">From current list</div>
                </div>
              </div>
            </section>

            <section className="admin-card admin-tx-table-card withdrawals-table-card">
              <Spin spinning={loading}>
                <Table
                  rowKey={(r) => String(r.transactionId ?? r.id)}
                  columns={columns}
                  dataSource={pageItems}
                  size="middle"
                  pagination={false}
                  locale={{
                    emptyText: loading
                      ? "Loading…"
                      : "No pending withdrawal requests.",
                  }}
                />
                <AdminPaginationBar
                  totalCount={rows.length}
                  nounPhrase="request(s)"
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              </Spin>
            </section>
          </div>
        </div>
      </div>

      <Modal
        title="Withdrawal details"
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setDetailRecord(null);
        }}
        footer={
          detailRecord ? (
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
              <Button
                danger
                loading={isBusyDetail}
                disabled={actionId != null && !isBusyDetail}
                onClick={() => handleReject(detailRecord)}
              >
                Reject
              </Button>
              <Button
                type="primary"
                loading={isBusyDetail}
                disabled={actionId != null && !isBusyDetail}
                onClick={() => handleApprove(detailRecord)}
              >
                Approve
              </Button>
            </div>
          ) : null
        }
        width={520}
        destroyOnHidden
      >
        {detailRecord && detailBank && detailMember ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Transaction ID">
              <span className="withdrawals-tx-id">{detailId}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Member">
              <div className="withdrawals-detail-member">
                <Avatar
                  size={40}
                  src={
                    getAvatarForTransactionRow(detailRecord, avatarByUserId) ||
                    undefined
                  }
                >
                  {(detailMember.name ||
                    detailMember.email ||
                    "?")[0].toUpperCase()}
                </Avatar>
                <div>
                  {detailMember.name ? (
                    <>
                      <div>{detailMember.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        {detailMember.email}
                      </div>
                    </>
                  ) : (
                    detailMember.email
                  )}
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <strong>{formatCurrency(detailRecord.amount ?? 0)}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Bank">
              {detailBank.bankName || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Account number">
              <div className="withdrawals-copy-row">
                <span>{detailBank.bankAccountNumber || "—"}</span>
                {detailBank.bankAccountNumber ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => copyText(detailBank.bankAccountNumber)}
                  >
                    Copy
                  </Button>
                ) : null}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Account name">
              {detailBank.bankAccountHolder || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Requested at">
              {(detailRecord.createdAt ?? detailRecord.created_at)
                ? new Date(
                    detailRecord.createdAt ?? detailRecord.created_at,
                  ).toLocaleString("en-GB")
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="gold">Pending</Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </AdminLayout>
  );
}

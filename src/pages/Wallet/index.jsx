import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  message,
  Spin,
  Card,
  Divider,
  Table,
  Avatar,
  Modal,
} from "antd";
import {
  Wallet,
  Plus,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { walletService, transactionService } from "../../services";
import { formatCurrency } from "../../utils/formatCurrency";
import { scrollToTopAfterPagination } from "../../utils/scrollPagination";
import { confirmCrud } from "../../utils/confirmCrud";
import { getAvatarSrc } from "../../utils/avatar";
import Header from "../../components/header";
import Footer from "../../components/footer";
import "./index.css";

const MyWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [quickAmount, setQuickAmount] = useState(5000000);
  const [showBalance, setShowBalance] = useState(false);

  const userDisplayName =
    user?.fullName ?? user?.name ?? user?.username ?? user?.email ?? "User";

  /** Họ tên trên hồ sơ — dùng cho rút tiền (không lấy email làm tên chủ TK). */
  const withdrawProfileHolderName = useMemo(() => {
    const raw = user?.fullName ?? user?.name ?? user?.username ?? "";
    return typeof raw === "string" ? raw.trim() : "";
  }, [user]);

  const userInitial =
    userDisplayName && typeof userDisplayName === "string"
      ? userDisplayName.trim().charAt(0).toUpperCase()
      : "U";
  const userAvatarUrl = getAvatarSrc(user) || null;

  // Load wallet balance and transaction history
  const fetchWalletData = async () => {
    if (!user?.id && !user?.userId && !user?.email) {
      message.error("Please sign in to view your wallet");
      return;
    }

    setLoading(true);
    try {
      // Wallet balance
      const walletRes = await walletService.getWallet();
      const walletData = walletRes?.result ?? walletRes?.data ?? walletRes;
      setWallet(walletData);

      // Transactions
      const txRes = await transactionService.getHistory({ limit: 20 });
      const txList = txRes?.result ?? txRes?.data ?? txRes;
      setTransactions(Array.isArray(txList) ? txList : []);
    } catch (error) {
      message.error(error?.message || "Failed to load wallet information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  // Top-up — redirect to VNPay
  const handleTopUp = async (values) => {
    if (!values.amount || values.amount <= 0) {
      message.error("Amount must be greater than 0");
      return;
    }

    const amt = parseInt(values.amount, 10);
    const ok = await confirmCrud({
      title: "Confirm wallet top-up?",
      content: `You will be redirected to VNPay to complete a payment of ${formatCurrency(amt)}. Continue?`,
      okText: "Top up",
    });
    if (!ok) return;

    setTopUpLoading(true);
    try {
      const res = await walletService.topUp(amt);
      const paymentUrl = res?.result ?? res?.data;

      if (paymentUrl && typeof paymentUrl === "string") {
        // Redirect to VNPay
        message.info("Redirecting to VNPay...");
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 500);
      } else {
        message.error("Could not create payment link");
      }
    } catch (error) {
      message.error(error?.message || "Top-up failed");
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleWithdraw = async (values) => {
    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount < 50000) {
      message.error("Minimum withdrawal is 50,000 VND");
      return;
    }
    if (!withdrawProfileHolderName) {
      message.error(
        "Please update your profile full name before requesting a withdrawal.",
      );
      return;
    }
    const ok = await confirmCrud({
      title: "Submit withdrawal request?",
      content: `Request a withdrawal of ${formatCurrency(amount)}? Continue?`,
      okText: "Submit",
    });
    if (!ok) return;
    setWithdrawLoading(true);
    try {
      await transactionService.requestWithdrawal({
        amount,
        bankName: values.bankName?.trim(),
        bankAccountNumber: values.bankAccountNumber?.trim(),
        bankAccountHolder: withdrawProfileHolderName,
      });
      message.success("Withdrawal request submitted.");
      withdrawForm.resetFields();
      setWithdrawModalOpen(false);
      await fetchWalletData();
    } catch (error) {
      const raw = String(error?.message ?? "");
      if (raw.includes("Database constraint violation")) {
        message.error({
          content:
            "Could not submit withdrawal. Please try again later or contact support.",
          duration: 8,
        });
      } else {
        message.error(raw || "Withdrawal request failed.");
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleQuickTopUp = (amount) => {
    // Prefill amount for "Process Deposit"
    setQuickAmount(amount);
    form.setFieldValue("amount", amount);
  };

  /** transactionType (camelCase) or transaction_type (snake_case). */
  const getTxType = (record) =>
    record.transactionType ?? record.transaction_type ?? record.type ?? null;

  const getTransactionDescription = (record) =>
    String(
      record?.description ??
        record?.transactionDescription ??
        record?.note ??
        "",
    ).trim();

  const inferMoneyInFromDescription = (record) => {
    const desc = getTransactionDescription(record).toLowerCase();
    if (!desc) return null;

    const moneyOutHints =
      /trừ|thanh toán|mua|purchase|payment|phí|fee|withdraw|rút|đặt cọc|deposit cho đơn|order|deduct|paid|booking/i;
    const moneyInHints =
      /nạp|top[\s-]?up|refund|hoàn tiền|cộng|bonus|nhận tiền|credit|received|topup|added|bonus/i;

    const isOut = moneyOutHints.test(desc);
    const isIn = moneyInHints.test(desc);

    if (isOut && !isIn) return false;
    if (isIn && !isOut) return true;
    return null;
  };

  // Signed delta for running balance (positive = in, negative = out)
  const getSignedAmount = (record) => {
    const status = record.status ?? record.transactionStatus;
    const statusKey = status ? String(status).toUpperCase() : null;
    const txTypeKey = (() => {
      const t = getTxType(record);
      return t ? String(t).toUpperCase() : null;
    })();

    /** Pending WITHDRAW: treat as balance deducted for running column until settled. */
    if (txTypeKey === "WITHDRAW" && statusKey === "PENDING") {
      const raw = Number(record.amount ?? 0);
      return raw ? -Math.abs(raw) : 0;
    }

    // Other types: count only when SUCCESS.
    if (statusKey !== "SUCCESS") return 0;
    const raw = Number(record.amount ?? 0);
    if (!raw) return 0;

    // Prefer direction hints from description text when present
    const moneyInByDescription = inferMoneyInFromDescription(record);
    if (moneyInByDescription != null) {
      return moneyInByDescription ? Math.abs(raw) : -Math.abs(raw);
    }

    const moneyInTypes = ["TOP_UP", "REFUND"];
    const moneyOutTypes = ["DEPOSIT", "PURCHASE", "POSTING_FEE", "WITHDRAW"];

    const moneyIn =
      txTypeKey && moneyInTypes.includes(txTypeKey)
        ? true
        : txTypeKey && moneyOutTypes.includes(txTypeKey)
          ? false
          : raw > 0;

    return moneyIn ? Math.abs(raw) : -Math.abs(raw);
  };

  const TX_STATUS_MAP = {
    SUCCESS: { color: "#22c55e", text: "Success" },
    PENDING: { color: "#f59e0b", text: "Processing" },
    FAILED: { color: "#ef4444", text: "Failed" },
  };

  // Display labels for transaction types
  const TX_TYPE_LABEL = {
    TOP_UP: "Top up",
    DEPOSIT: "Deposit",
    PURCHASE: "Purchase",
    REFUND: "Refund",
    POSTING_FEE: "Posting fee",
    WITHDRAW: "Withdrawal",
    WITHDRAWAL: "Withdrawal",
  };

  const formatVNDNumber = (value) => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("vi-VN");
  };

  // Table rows with running balance column
  const tableData = useMemo(() => {
    if (!transactions.length) return [];

    if (!wallet) {
      return transactions.map((tx, idx) => ({
        ...tx,
        key: tx.transactionId ?? tx.id ?? idx,
      }));
    }

    // Newest first so the first row is the latest transaction
    const sorted = [...transactions].sort((a, b) => {
      const da = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
      const db = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
      return db - da;
    });

    let running = Number(wallet.balance ?? 0);

    return sorted.map((tx, idx) => {
      const row = {
        ...tx,
        currentBalance: running,
        key: tx.transactionId ?? tx.id ?? idx,
      };
      const delta = getSignedAmount(tx);
      running -= delta;
      return row;
    });
  }, [transactions, wallet]);

  const transactionColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) =>
        date
          ? new Date(date).toLocaleString("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
      width: 112,
    },
    {
      title: "Type",
      key: "type",
      className: "wallet-tx-type-col",
      onHeaderCell: () => ({ className: "wallet-tx-type-col" }),
      render: (_, record) => {
        const txTypeRaw = getTxType(record);
        const txTypeKey = txTypeRaw ? String(txTypeRaw).toUpperCase() : null;
        const mapped = TX_TYPE_LABEL[txTypeKey];
        if (mapped)
          return <span className="wallet-tx-type-text">{mapped}</span>;
        if (!txTypeRaw) return "—";
        const human = String(txTypeRaw)
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return <span className="wallet-tx-type-text">{human}</span>;
      },
      width: 92,
    },
    {
      title: "Description",
      key: "description",
      render: (_, record) => {
        const description = getTransactionDescription(record);
        if (description) {
          return <span style={{ fontWeight: 500 }}>{description}</span>;
        }
        return "—";
      },
      width: 190,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = record.status ?? record.transactionStatus;
        const statusKey = status ? String(status).toUpperCase() : null;
        const info = TX_STATUS_MAP[statusKey] ?? {
          color: "#94a3b8",
          text: status ?? "—",
        };
        return (
          <span style={{ color: info.color, fontWeight: 500 }}>
            {info.text}
          </span>
        );
      },
      width: 92,
    },
    {
      title: "Current balance",
      key: "currentBalance",
      render: (_, record) =>
        record.currentBalance != null
          ? formatCurrency(record.currentBalance)
          : "—",
      width: 138,
    },
  ];

  if (!user) {
    return (
      <div className="wallet-page">
        <Header />
        <div
          className="wallet-container"
          style={{ textAlign: "center", padding: "60px 20px" }}
        >
          <h2>Please sign in to view your wallet</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <Header />
      <div className="wallet-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Spin size="large" tip="Loading wallet..." />
          </div>
        ) : wallet ? (
          <>
            <div className="wallet-grid wallet-top-grid">
              <div className="wallet-left-column">
                {/* Balance banner */}
                <Card className="wallet-banner-card wallet-card">
                  <div className="wallet-banner-content">
                    <div className="wallet-hero-topbar">
                      <div className="wallet-account">
                        <Avatar
                          size={34}
                          className="wallet-account-avatar"
                          src={userAvatarUrl || undefined}
                        >
                          {userInitial}
                        </Avatar>
                        <div className="wallet-account-name">
                          {userDisplayName}
                        </div>
                      </div>
                    </div>
                    <div className="wallet-hero-label">ACCOUNT BALANCE</div>
                    <div className="wallet-hero-balance">
                      <span className="wallet-balance-wrap">
                        <span
                          className={`wallet-balance-value ${
                            showBalance ? "" : "wallet-balance-value--hidden"
                          }`}
                        >
                          {formatVNDNumber(wallet.balance || 0)}
                        </span>
                        <span
                          className={`wallet-balance-mask ${
                            showBalance ? "" : "wallet-balance-mask--shown"
                          }`}
                        >
                          ••••••••
                        </span>
                      </span>
                      <span className="wallet-hero-vnd">VND</span>
                      <button
                        type="button"
                        className="wallet-eye-btn wallet-eye-btn-balance"
                        onClick={() => setShowBalance((v) => !v)}
                        aria-label={
                          showBalance ? "Hide balance" : "Show balance"
                        }
                      >
                        {showBalance ? (
                          <EyeOff size={18} strokeWidth={2.75} />
                        ) : (
                          <Eye size={18} strokeWidth={2.75} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="wallet-banner-bg" />
                </Card>

                <div className="wallet-withdraw-trigger">
                  <Button
                    type="default"
                    size="large"
                    block
                    className="wallet-withdraw-open-btn"
                    onClick={() => {
                      withdrawForm.resetFields();
                      setWithdrawModalOpen(true);
                    }}
                  >
                    Withdraw
                  </Button>
                </div>

                {/* Add funds */}
                <Card className="wallet-topup-card wallet-card">
                  <div className="wallet-topup-header">
                    <h2 className="wallet-topup-title">Add Funds to Wallet</h2>
                    <div className="wallet-topup-hint">
                      PRECISION TRANSACTION
                    </div>

                    <div className="wallet-vnpay-alert">
                      <ShieldCheck size={45} />
                      All top-up transactions are processed securely and
                      exclusively through VN Pay.
                    </div>
                  </div>

                  <Form form={form} onFinish={handleTopUp} layout="vertical">
                    <Form.Item label="AMOUNT (VND)">
                      <div className="wallet-input-wrapper">
                        <Form.Item
                          name="amount"
                          noStyle
                          rules={[
                            { required: true, message: "Please enter amount" },
                            {
                              pattern: /^[0-9]+$/,
                              message: "Amount must be a positive integer",
                            },
                            {
                              validator: (_, value) => {
                                if (value && value < 10000) {
                                  return Promise.reject(
                                    new Error("Minimum amount is 10,000 VND"),
                                  );
                                }
                                if (value && value > 100000000) {
                                  return Promise.reject(
                                    new Error(
                                      "Maximum amount is 100,000,000 VND",
                                    ),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input
                            className="wallet-input"
                            placeholder="Enter amount"
                            type="number"
                            min="10000"
                            step="10000"
                            size="large"
                          />
                        </Form.Item>
                        <span className="wallet-input-suffix">VND</span>
                      </div>
                    </Form.Item>

                    <div className="wallet-quick-amounts wallet-quick-amounts-big">
                      <Button
                        className={`wallet-quick-amount-btn ${quickAmount === 500000 ? "active" : ""}`}
                        onClick={() => handleQuickTopUp(500000)}
                      >
                        500.000
                      </Button>
                      <Button
                        className={`wallet-quick-amount-btn ${quickAmount === 1000000 ? "active" : ""}`}
                        onClick={() => handleQuickTopUp(1000000)}
                      >
                        1.000.000
                      </Button>
                      <Button
                        className={`wallet-quick-amount-btn ${quickAmount === 5000000 ? "active" : ""}`}
                        onClick={() => handleQuickTopUp(5000000)}
                      >
                        5.000.000
                      </Button>
                    </div>

                    <Button
                      className="wallet-btn-primary"
                      htmlType="submit"
                      loading={topUpLoading}
                      block
                      size="large"
                    >
                      {topUpLoading ? "Processing..." : "Process Deposit"}
                      <ArrowRight size={18} style={{ marginLeft: 10 }} />
                    </Button>
                  </Form>
                </Card>
              </div>

              <div className="wallet-right-column">
                {/* Transaction history */}
                <Card className="wallet-history-card wallet-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <h2 style={{ margin: 0 }}>Transaction history</h2>
                  </div>
                  <Divider style={{ margin: "16px 0" }} />
                  {transactions.length > 0 ? (
                    <Table
                      columns={transactionColumns}
                      dataSource={tableData}
                      size="small"
                      pagination={{
                        pageSize: 7,
                        pageSizeOptions: [5, 10, 20],
                        position: ["bottomCenter"],
                        onChange: () => scrollToTopAfterPagination(),
                        onShowSizeChange: () => scrollToTopAfterPagination(),
                      }}
                      scroll={{ x: 620 }}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#999",
                      }}
                    >
                      No transactions yet
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
            Could not load wallet
          </div>
        )}
      </div>
      <Footer />

      <Modal
        title="Withdraw funds"
        open={withdrawModalOpen}
        onCancel={() => {
          setWithdrawModalOpen(false);
          withdrawForm.resetFields();
        }}
        footer={null}
        width={480}
        destroyOnHidden
        centered
      >
        <Form
          form={withdrawForm}
          layout="vertical"
          onFinish={handleWithdraw}
          requiredMark
        >
          <Form.Item label="Account holder name (from profile)">
            <Input
              readOnly
              size="large"
              value={withdrawProfileHolderName || "—"}
              placeholder="No full name found in your profile"
            />
          </Form.Item>
          <Form.Item
            name="bankName"
            label="Bank name"
            rules={[{ required: true, message: "Please enter bank name" }]}
          >
            <Input placeholder="Example: Vietcombank" size="large" />
          </Form.Item>
          <Form.Item
            name="bankAccountNumber"
            label="Bank account / card number"
            rules={[{ required: true, message: "Please enter account number" }]}
          >
            <Input placeholder="Receiving account number" size="large" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Withdrawal amount (VND)"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                validator: (_, v) => {
                  const n = Number(v);
                  if (!Number.isFinite(n) || n < 50000) {
                    return Promise.reject(new Error("Minimum is 50,000 VND"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input type="number" min={50000} step={10000} size="large" />
          </Form.Item>
          <div className="wallet-withdraw-modal-actions">
            <Button
              onClick={() => {
                setWithdrawModalOpen(false);
                withdrawForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="wallet-btn-primary"
              htmlType="submit"
              loading={withdrawLoading}
            >
              {withdrawLoading ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyWallet;

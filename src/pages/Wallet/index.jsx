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
  const [form] = Form.useForm();
  const [quickAmount, setQuickAmount] = useState(5000000);
  const [showBalance, setShowBalance] = useState(false);

  const userDisplayName =
    user?.fullName ?? user?.name ?? user?.username ?? user?.email ?? "User";
  const userInitial =
    userDisplayName && typeof userDisplayName === "string"
      ? userDisplayName.trim().charAt(0).toUpperCase()
      : "U";
  const userAvatarUrl = getAvatarSrc(user) || null;

  // Lấy thông tin ví và lịch sử giao dịch
  const fetchWalletData = async () => {
    if (!user?.id && !user?.userId && !user?.email) {
      message.error("Please sign in to view your wallet");
      return;
    }

    setLoading(true);
    try {
      // Lấy thông tin ví
      const walletRes = await walletService.getWallet();
      const walletData = walletRes?.result ?? walletRes?.data ?? walletRes;
      setWallet(walletData);

      // Lấy lịch sử giao dịch
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

  // Xử lý nạp tiền - redirect sang VNPay
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
        // Redirect sang VNPay Sandbox
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

  const handleQuickTopUp = (amount) => {
    // Chỉ set giá trị để khi bấm "Process Deposit" thì onFinish gọi handleTopUp
    setQuickAmount(amount);
    form.setFieldValue("amount", amount);
  };

  /**
   * BE có thể trả về transactionType (camelCase) hoặc transaction_type (snake_case).
   * DB values: TOP_UP | DEPOSIT | PURCHASE | REFUND | POSTING_FEE, ...
   */
  const getTxType = (record) =>
    record.transactionType ?? record.transaction_type ?? record.type ?? null;

  const getTransactionDescription = (record) =>
    String(record?.description ?? record?.transactionDescription ?? record?.note ?? "")
      .trim();

  const inferMoneyInFromDescription = (record) => {
    const desc = getTransactionDescription(record).toLowerCase();
    if (!desc) return null;

    const moneyOutHints =
      /trừ|thanh toán|mua|purchase|payment|phí|fee|withdraw|rút|đặt cọc|deposit cho đơn|order/i;
    const moneyInHints =
      /nạp|top[\s-]?up|refund|hoàn tiền|cộng|bonus|nhận tiền|credit/i;

    const isOut = moneyOutHints.test(desc);
    const isIn = moneyInHints.test(desc);

    if (isOut && !isIn) return false;
    if (isIn && !isOut) return true;
    return null;
  };

  // Số tiền thay đổi (dương: cộng vào ví, âm: trừ khỏi ví)
  const getSignedAmount = (record) => {
    const status = record.status ?? record.transactionStatus;
    const statusKey = status ? String(status).toUpperCase() : null;
    // Chỉ tính vào currentBalance khi giao dịch đã "settle" (SUCCESS).
    // PENDING/PROCESSING thường chưa được cộng/trừ vào ví thực tế của BE.
    if (statusKey !== "SUCCESS") return 0;
    const raw = Number(record.amount ?? 0);
    if (!raw) return 0;

    // Ưu tiên suy chiều tiền theo cột description từ dto.Transactions
    const moneyInByDescription = inferMoneyInFromDescription(record);
    if (moneyInByDescription != null) {
      return moneyInByDescription ? Math.abs(raw) : -Math.abs(raw);
    }

    const txTypeKey = (() => {
      const t = getTxType(record);
      return t ? String(t).toUpperCase() : null;
    })();

    const moneyInTypes = ["TOP_UP", "REFUND"];
    const moneyOutTypes = ["DEPOSIT", "PURCHASE", "POSTING_FEE"];

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

  // Mapping hiển thị cho Type lấy từ BE (không thay đổi logic dữ liệu)
  const TX_TYPE_LABEL = {
    TOP_UP: "Top up",
    DEPOSIT: "Deposit",
    PURCHASE: "Purchase",
    REFUND: "Refund",
    POSTING_FEE: "Posting fee",
  };

  const formatVNDNumber = (value) => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("vi-VN");
  };

  // Chuẩn hóa dataSource cho bảng, kèm currentBalance
  const tableData = useMemo(() => {
    if (!transactions.length) return [];

    // Nếu chưa có thông tin ví, trả danh sách tối thiểu
    if (!wallet) {
      return transactions.map((tx, idx) => ({
        ...tx,
        key: tx.transactionId ?? tx.id ?? idx,
      }));
    }

    // Sắp xếp mới nhất → cũ nhất để dòng đầu là transaction mới nhất
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

  // Cấu hình bảng giao dịch (code bảng cũ như trước)
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
      render: (_, record) => {
        const txTypeRaw = getTxType(record);
        const txTypeKey = txTypeRaw ? String(txTypeRaw).toUpperCase() : null;
        return TX_TYPE_LABEL[txTypeKey] ?? txTypeRaw ?? "—";
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
                        {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="wallet-banner-bg" />
                </Card>

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
                                    new Error("Maximum amount is 100,000,000 VND"),
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
                        pageSize: 5,
                        pageSizeOptions: [5, 10, 20],
                        position: ["bottomCenter"],
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
    </div>
  );
};

export default MyWallet;

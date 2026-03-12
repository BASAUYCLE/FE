import React, { useState, useEffect, useMemo } from "react";
import { Button, Form, Input, message, Spin, Card, Space, Divider, Table } from "antd";
import { Wallet, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { walletService, transactionService } from "../../services";
import { formatCurrency } from "../../utils/formatCurrency";
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

    setTopUpLoading(true);
    try {
      const res = await walletService.topUp(parseInt(values.amount));
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

  /**
   * BE có thể trả về transactionType (camelCase) hoặc transaction_type (snake_case).
   * DB values: TOP_UP | DEPOSIT | PURCHASE | REFUND | POSTING_FEE, ...
   */
  const getTxType = (record) =>
    record.transactionType ?? record.transaction_type ?? record.type ?? null;

  /**
   * Suy luận hướng tiền (vào/ra) theo description từ dbo.Transactions.
   * Ưu tiên description; nếu không rõ thì fallback sang transactionType/amount.
   */
  const getDirectionFromDescription = (record) => {
    const desc = (record.description ?? "").toString().toLowerCase();
    if (!desc) return null;
    const moneyInKeywords = [
      "nạp tiền",
      "nap tien",
      "top up",
      "top-up",
      "hoàn tiền",
      "hoan tien",
      "refund",
    ];
    const moneyOutKeywords = [
      "đặt cọc",
      "dat coc",
      "thanh toán",
      "thanh toan",
      "mua hàng",
      "mua hang",
      "phí đăng",
      "phi dang",
      "posting fee",
    ];
    if (moneyInKeywords.some((k) => desc.includes(k))) return "IN";
    if (moneyOutKeywords.some((k) => desc.includes(k))) return "OUT";
    return null;
  };

  // Số tiền thay đổi (dương: cộng vào ví, âm: trừ khỏi ví)
  const getSignedAmount = (record) => {
    const status = record.status ?? record.transactionStatus;
    if (status === "FAILED") return 0;
    const raw = Number(record.amount ?? 0);
    if (!raw) return 0;

    const dirFromDesc = getDirectionFromDescription(record);
    const moneyIn =
      dirFromDesc === "IN" ? true : dirFromDesc === "OUT" ? false : raw > 0;

    return moneyIn ? Math.abs(raw) : -Math.abs(raw);
  };

  const TX_TYPE_LABEL = {
    TOP_UP:      "Top up",
    DEPOSIT:     "Deposit",
    PURCHASE:    "Purchase",
    REFUND:      "Refund",
    POSTING_FEE: "Posting fee",
  };

  const TX_STATUS_MAP = {
    SUCCESS: { color: "#22c55e", text: "Success" },
    PENDING: { color: "#f59e0b", text: "Processing" },
    FAILED:  { color: "#ef4444", text: "Failed" },
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

  // Cấu hình bảng giao dịch
  const transactionColumns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) =>
        date ? new Date(date).toLocaleString("en-US") : "—",
      width: 170,
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => {
        const txType = getTxType(record);
        return TX_TYPE_LABEL[txType] ?? txType ?? "—";
      },
      width: 130,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        const status = record.status ?? record.transactionStatus;
        const isFailed = status === "FAILED";
        const raw = Number(amount ?? 0);

        // 1) Thử suy luận theo description
        const dirFromDesc = getDirectionFromDescription(record);

        // 2) Nếu description không rõ, fallback theo amount dương/âm
        const moneyIn  =
          dirFromDesc === "IN"  ? true  :
          dirFromDesc === "OUT" ? false :
          raw > 0;

        const prefix = isFailed || raw === 0 ? "" : moneyIn ? "+" : "−";
        const color  = isFailed
          ? "#94a3b8"
          : moneyIn
            ? "#10b981"
            : "#ef4444";

        return (
          <span style={{ color, fontWeight: 700, fontSize: 14 }}>
            {prefix}{formatCurrency(Math.abs(raw))}
          </span>
        );
      },
      width: 150,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = record.status ?? record.transactionStatus;
        const info = TX_STATUS_MAP[status] ?? { color: "#94a3b8", text: status ?? "—" };
        return (
          <span style={{ color: info.color, fontWeight: 500 }}>
            {info.text}
          </span>
        );
      },
      width: 130,
    },
    {
      title: "Current balance",
      key: "currentBalance",
      render: (_, record) =>
        record.currentBalance != null
          ? formatCurrency(record.currentBalance)
          : "—",
      width: 180,
    },
  ];

  if (!user) {
    return (
      <div className="wallet-page">
        <Header />
        <div className="wallet-container" style={{ textAlign: "center", padding: "60px 20px" }}>
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
        <div className="wallet-title-section">
          <h1 className="wallet-title">
            <Wallet size={20} style={{ marginRight: 8 }} /> My Wallet
          </h1>
          <p className="wallet-subtitle">Manage balance and view transaction history</p>
        </div>

        {/* Thông tin ví */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Spin size="large" tip="Loading wallet..." />
          </div>
        ) : wallet ? (
          <div className="wallet-summary">
            <Card className="wallet-summary-card">
              <div className="wallet-summary-header">
                <div className="wallet-summary-icon">
                  <Wallet size={18} />
                </div>
                <span className="wallet-summary-label">Current balance</span>
              </div>
              <div className="wallet-summary-amount">
                {formatCurrency(wallet.balance || 0)}
              </div>
              <div className="wallet-summary-meta">Updated: {wallet.updatedAt ? new Date(wallet.updatedAt).toLocaleDateString("en-US") : "—"}</div>
            </Card>
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
            Could not load wallet
          </div>
        )}

        {/* Form nạp tiền */}
        <Card className="wallet-topup-card wallet-card">
          <h2 style={{ marginBottom: "24px", display: "flex", alignItems: "center" }}>
            <Plus size={18} style={{ marginRight: 8 }} />
            Add Money to Wallet
          </h2>

          <Form form={form} onFinish={handleTopUp} layout="vertical">
            <Form.Item
              label="Amount (VND)"
              name="amount"
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
                        new Error("Minimum amount is 10,000 VND")
                      );
                    }
                    if (value && value > 100000000) {
                      return Promise.reject(
                        new Error("Maximum amount is 100,000,000 VND")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter amount"
                type="number"
                min="10000"
                step="10000"
                size="large"
              />
            </Form.Item>

            {/* Nút nhanh */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Quick amount:
              </label>
              <Space wrap>
                <Button onClick={() => form.setFieldValue("amount", 100000)}>
                  100K
                </Button>
                <Button onClick={() => form.setFieldValue("amount", 500000)}>
                  500K
                </Button>
                <Button onClick={() => form.setFieldValue("amount", 1000000)}>
                  1M
                </Button>
                <Button onClick={() => form.setFieldValue("amount", 5000000)}>
                  5M
                </Button>
              </Space>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={topUpLoading}
              block
              size="large"
            >
              {topUpLoading ? "Processing..." : "Add Money "}
            </Button>
          </Form>
        </Card>

        {/* Transaction history */}
        <Card className="wallet-history-card wallet-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Transaction history</h2>
          </div>
          <Divider style={{ margin: "16px 0" }} />
          {transactions.length > 0 ? (
            <Table
              columns={transactionColumns}
              dataSource={tableData}
              pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 20] }}
              scroll={{ x: 800 }}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
              No transactions yet
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default MyWallet;


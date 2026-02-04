import { useState } from "react";
import "./index.css";
import Header from "../../components/header";
import Footer from "../../components/footer";

const MyWallet = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [amount, setAmount] = useState("1000000");
  const [paymentMethod, setPaymentMethod] = useState("bank");

  const quickAmounts = [500000, 1000000, 5000000];

  const addAmount = (value) => {
    setAmount((prev) => {
      const current = parseInt(prev) || 0;
      return (current + value).toString();
    });
  };

  const transactions = [
    {
      date: "Oct 24, 2025",
      type: "Deposit",
      typeIcon: "",
      transactionId: "TXN-892918",
      amount: "+5,000,000 VND",
      status: "SUCCESS",
      statusColor: "success",
    },
    {
      date: "Oct 21, 2025",
      type: "Bike Purchase",
      typeIcon: "",
      transactionId: "TXN-773128",
      amount: "-12,400,000 VND",
      status: "SUCCESS",
      statusColor: "success",
    },
    {
      date: "Oct 18, 2025",
      type: "Refund",
      typeIcon: "",
      transactionId: "TXN-661903",
      amount: "+850,000 VND",
      status: "SUCCESS",
      statusColor: "success",
    },
    {
      date: "Oct 15, 2025",
      type: "Deposit",
      typeIcon: "",
      transactionId: "TXN-536102",
      amount: "+30,000,000 VND",
      status: "PROCESSING",
      statusColor: "processing",
    },
  ];

  return (
    <div className="wallet-page">
      <Header />
      {/* Main Content */}
      <div className="wallet-container">
        <div className="wallet-title-section">
          <h1 className="wallet-title">My Wallet</h1>
          <p className="wallet-subtitle">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="wallet-summary">
          <div className="wallet-summary-card">
            <div className="wallet-summary-header">
              <svg
                className="wallet-summary-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="2"
                  strokeWidth="2"
                />
                <path d="M2 10h20" strokeWidth="2" />
              </svg>
              <span className="wallet-summary-label">Available Balance</span>
            </div>
            <div className="wallet-summary-amount">25,450,000 VND</div>
            <div className="wallet-summary-change positive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="m5 12 7-7 7 7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19V5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              +5.2% this month
            </div>
          </div>

          <div className="wallet-summary-card">
            <div className="wallet-summary-header">
              <svg
                className="wallet-summary-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M3 3h18v18H3z" strokeWidth="2" />
                <path d="M9 3v18M3 9h18M3 15h18" strokeWidth="2" />
              </svg>
              <span className="wallet-summary-label">Total Spent</span>
            </div>
            <div className="wallet-summary-amount">12,400,000 VND</div>
            <div className="wallet-summary-meta">Across 14 purchases</div>
          </div>

          <div className="wallet-summary-card">
            <div className="wallet-summary-header">
              <svg
                className="wallet-summary-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="wallet-summary-label">Pending</span>
            </div>
            <div className="wallet-summary-amount">0 VND</div>
            <div className="wallet-summary-meta">No active disputes</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="wallet-grid">
          {/* Left Column - Top Up Funds */}
          <div className="wallet-card wallet-topup-card">
            <div className="wallet-card-header">
              <h2 className="wallet-card-title">Top Up Funds</h2>
              <span className="wallet-badge">FAST DEPOSIT</span>
            </div>

            {/* Tabs */}
            <div className="wallet-tabs">
              <button
                className={`wallet-tab ${activeTab === "deposit" ? "active" : ""}`}
                onClick={() => setActiveTab("deposit")}
              >
                Deposit
              </button>
              <button
                className={`wallet-tab ${activeTab === "withdraw" ? "active" : ""}`}
                onClick={() => setActiveTab("withdraw")}
              >
                Withdraw
              </button>
            </div>

            {/* Amount Input */}
            <div className="wallet-input-group">
              <label className="wallet-label">Enter Amount (VND)</label>
              <div className="wallet-input-wrapper">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="wallet-input"
                />
                <span className="wallet-input-suffix">VND</span>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div className="wallet-quick-amounts">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  className="wallet-chip"
                  onClick={() => addAmount(amt)}
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Payment Method */}
            <div className="wallet-payment-section">
              <label className="wallet-label">Payment Method</label>
              <div className="wallet-payment-methods">
                <button
                  className={`wallet-payment-method ${paymentMethod === "bank" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("bank")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                      strokeWidth="2"
                    />
                    <path d="M9 22V12h6v10" strokeWidth="2" />
                  </svg>
                  <span>Bank Transfer</span>
                </button>
                <button
                  className={`wallet-payment-method ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      strokeWidth="2"
                    />
                    <path d="M2 10h20" strokeWidth="2" />
                  </svg>
                  <span>Credit Card</span>
                </button>
                <button
                  className={`wallet-payment-method ${paymentMethod === "qr" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("qr")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="8" height="8" strokeWidth="2" />
                    <rect x="3" y="13" width="8" height="8" strokeWidth="2" />
                    <rect x="13" y="3" width="8" height="8" strokeWidth="2" />
                    <path
                      d="M13 13h2v2h-2v-2zM17 13h2v2h-2v-2zM13 17h2v2h-2v-2zM17 17h2v2h-2v-2zM15 15h2v2h-2v-2z"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>VN Pay QR</span>
                </button>
              </div>
            </div>

            {/* Proceed Button */}
            <button className="wallet-btn-primary">
              Proceed to Deposit
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Right Column */}
          <div className="wallet-right-column">
            {/* Secure Transactions Card */}
            <div className="wallet-card wallet-secure-card">
              <div className="wallet-secure-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="wallet-secure-title">Secure Transactions</h3>
              <p className="wallet-secure-text">
                Funds are held in escrow for buyer protection
              </p>
              <p className="wallet-secure-description">
                By depositing funds, you agree to our terms of service. Deposits
                are usually processed instantly, though bank transfers might
                take up to 2-4 hours depending on your bank's processing time.
              </p>
            </div>

            {/* Sell Banner */}
            <div className="wallet-card wallet-banner-card">
              <div className="wallet-banner-content">
                <h3 className="wallet-banner-title">Sell your bike today</h3>
                <p className="wallet-banner-text">
                  Turn your extra gear into wallet balance instantly
                </p>
                <button className="wallet-btn-banner">Create Listing</button>
              </div>
              <div className="wallet-banner-bg"></div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="wallet-card wallet-history-card">
          <div className="wallet-history-header">
            <h2 className="wallet-card-title">Transaction History</h2>
            <div className="wallet-history-actions">
              <button className="wallet-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Filter
              </button>
              <button className="wallet-btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="wallet-table-wrapper">
            <table className="wallet-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>TRANSACTION ID</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td>{tx.date}</td>
                    <td>
                      <div className="wallet-type-cell">
                        <span className="wallet-type-icon">{tx.typeIcon}</span>
                        <span>{tx.type}</span>
                      </div>
                    </td>
                    <td className="wallet-tx-id">{tx.transactionId}</td>
                    <td
                      className={`wallet-amount ${tx.amount.startsWith("+") ? "positive" : "negative"}`}
                    >
                      {tx.amount}
                    </td>
                    <td>
                      <span className={`wallet-status-badge ${tx.statusColor}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="wallet-pagination">
            <div className="wallet-pagination-info">
              Showing 4 of 48 transactions
            </div>
            <div className="wallet-pagination-controls">
              <button className="wallet-pagination-btn" disabled>
                Previous
              </button>
              <button className="wallet-pagination-btn">Next</button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyWallet;

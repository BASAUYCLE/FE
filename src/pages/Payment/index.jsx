import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./index.css";
import bikeImage from "../../assets/bike-tarmac-sl7.png";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";

const BANKS = [
  "VIETCOMBANK",
  "TECHCOMBANK",
  "BIDV",
  "AGRIBANK",
  "VPBANK",
  "SACOMBANK",
  "MB BANK",
  "ACB",
  "TPBANK",
  "VIB",
];

const ORDER_DATA = {
  orderId: "VN882910",
  bikeName: "Specialized S-Works Tarmac SL7",
  seller: "Ho Chi Minh City Premium Bikes",
  price: 125000000,
};

function formatCurrencyVND(amount) {
  if (typeof amount !== "number") return "";
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function VNPayPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdFromUrl = searchParams.get("orderId");
  const { markOrderAsPaid, getOrderByOrderId } = useOrders();
  const { addNotification } = useNotifications();

  const orderFromContext = orderIdFromUrl
    ? getOrderByOrderId(orderIdFromUrl)
    : null;
  const displayOrder = orderFromContext
    ? {
        orderId: orderFromContext.orderId,
        bikeName: orderFromContext.bikeName,
        seller: "BASAUYCLE Seller",
        price: orderFromContext.amountDue,
        image: orderFromContext.image,
      }
    : ORDER_DATA;

  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [remaining, setRemaining] = useState(9 * 60 + 59); // 09:59

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const formattedTotal = useMemo(
    () => formatCurrencyVND(displayOrder.price),
    [displayOrder.price],
  );

  const handlePaid = () => {
    if (orderIdFromUrl) {
      markOrderAsPaid(orderIdFromUrl);
      addNotification({
        title: "Payment successful",
        message: `Order #${orderIdFromUrl} has been paid.`,
        type: "success",
      });
      navigate("/orders");
    } else {
      window.alert("Payment submitted");
    }
  };

  const handleCancel = () => {
    const ok = window.confirm(
      "Are you sure you want to cancel this transaction?",
    );
    if (ok) {
      if (orderIdFromUrl) navigate("/orders");
      else window.alert("Transaction cancelled");
    }
  };

  return (
    <div className="vnpay-page">
      <Header />
      <main className="vnpay-shell vnpay-main">
        <div className="vnpay-breadcrumb">
          Home <span>&gt;</span> Checkout <span>&gt;</span>{" "}
          <span className="vnpay-breadcrumb-current">VN Pay Payment</span>
        </div>

        <h1 className="vnpay-title">VN Pay Payment Gateway</h1>
        <p className="vnpay-subtitle">
          Complete your transaction securely using Vietnam&apos;s leading
          payment network.
        </p>

        <section className="vnpay-layout">
          <div>
            {/* Transaction Summary */}
            <section className="vnpay-section">
              <div className="vnpay-section-header">
                <div className="vnpay-section-title">
                  <div className="vnpay-section-icon">💳</div>
                  <span>Transaction Summary</span>
                </div>
              </div>

              <div className="vnpay-card">
                <div className="vnpay-transaction-header">
                  <span className="vnpay-order-badge">
                    ORDER #{displayOrder.orderId}
                  </span>
                  <span className="vnpay-transaction-time">2 mins ago</span>
                </div>

                <div className="vnpay-transaction-body">
                  <img
                    className="vnpay-bike-image"
                    src={displayOrder.image || bikeImage}
                    alt={displayOrder.bikeName}
                  />
                  <div>
                    <div className="vnpay-transaction-info-title">
                      {displayOrder.bikeName}
                    </div>
                    <div className="vnpay-transaction-info-sub">
                      Seller: {displayOrder.seller}
                    </div>
                    <div className="vnpay-transaction-row">
                      <span className="vnpay-transaction-label">Subtotal</span>
                      <span className="vnpay-transaction-amount">
                        {formattedTotal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Select Local Bank */}
            <section className="vnpay-section">
              <div className="vnpay-section-header">
                <div className="vnpay-section-title">
                  <div className="vnpay-section-icon">🏦</div>
                  <span>Select Local Bank</span>
                </div>
              </div>

              <div className="vnpay-card">
                <div className="vnpay-bank-search">
                  <input
                    className="vnpay-bank-search-input"
                    placeholder="Find your bank..."
                  />
                </div>
                <div className="vnpay-bank-grid">
                  {BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={
                        "vnpay-bank-button" +
                        (selectedBank === bank
                          ? " vnpay-bank-button-active"
                          : "")
                      }
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* How to pay */}
            <section className="vnpay-section">
              <div className="vnpay-section-header">
                <div className="vnpay-section-title">
                  <div className="vnpay-section-icon">📱</div>
                  <span>How to pay</span>
                </div>
              </div>

              <div className="vnpay-card">
                <div className="vnpay-steps">
                  <div className="vnpay-step">
                    <div className="vnpay-step-index">1</div>
                    <div>
                      <div className="vnpay-step-content-title">
                        Open your Mobile Banking app
                      </div>
                      <div className="vnpay-step-content-text">
                        Open your Mobile Banking app or e-wallet on your
                        smartphone.
                      </div>
                    </div>
                  </div>

                  <div className="vnpay-step">
                    <div className="vnpay-step-index">2</div>
                    <div>
                      <div className="vnpay-step-content-title">
                        Choose QR Pay and scan
                      </div>
                      <div className="vnpay-step-content-text">
                        Choose the QR Pay function and scan the QR code
                        displayed on the right.
                      </div>
                    </div>
                  </div>

                  <div className="vnpay-step">
                    <div className="vnpay-step-index">3</div>
                    <div>
                      <div className="vnpay-step-content-title">
                        Confirm transaction details
                      </div>
                      <div className="vnpay-step-content-text">
                        Check the details and confirm the transaction. Your
                        order will be updated automatically.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="vnpay-payment-panel">
            <div className="vnpay-payment-header">
              <div className="vnpay-vnpay-logo">VNPay</div>
            </div>

            <div className="vnpay-session-pill">
              <div className="vnpay-session-pill-inner">
                <span className="vnpay-session-dot" />
                <span>Session expires in {formatTime(remaining)}</span>
              </div>
            </div>

            <div className="vnpay-payment-title">Scan QR code to pay</div>

            <div className="vnpay-qr-wrapper">
              <div className="vnpay-qr-inner">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=BASAUYCLE-VNPay-Demo"
                  alt="VNPay QR code"
                />
              </div>
            </div>

            <div className="vnpay-total-row">
              <span className="vnpay-total-label">Total Amount</span>
              <span className="vnpay-total-amount">{formattedTotal}</span>
            </div>

            <button
              type="button"
              className="vnpay-primary-button"
              onClick={handlePaid}
            >
              <span className="vnpay-primary-button-icon">✓</span>
              <span>I Have Paid</span>
            </button>

            <button
              type="button"
              className="vnpay-secondary-button"
              onClick={handleCancel}
            >
              Cancel Transaction
            </button>

            <div className="vnpay-badges-row">
              <div className="vnpay-badge">
                <span className="vnpay-badge-dot" />
                <span>SSL Encrypted</span>
              </div>
              <div className="vnpay-badge">
                <span className="vnpay-badge-dot" />
                <span>Verified Merchant</span>
              </div>
            </div>

            <div className="vnpay-support">
              Having trouble?{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Contact Support ↗
              </a>
            </div>
          </aside>
        </section>

        <Footer />
      </main>
    </div>
  );
}

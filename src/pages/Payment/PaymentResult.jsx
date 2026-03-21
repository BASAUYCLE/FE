import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Card, Spin, Divider } from "antd";
import { Loader2, Check, X, CheckCircle2, XCircle } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { formatCurrency } from "../../utils/formatCurrency";
import { walletService } from "../../services";
import { useNotifications } from "../../contexts/useNotifications";
import "./PaymentResult.css";

/**
 * Payment Result Page
 * Handles VNPay callback for wallet top-ups
 * URL params: vnp_Amount, vnp_BankCode, vnp_BankTmnCode, vnp_ResponseCode, vnp_TransactionNo, vnp_TransactionStatus, etc.
 */
const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [walletRefreshed, setWalletRefreshed] = useState(false);
  const { addNotification } = useNotifications();

  // Get payment result params from backend redirect
  // Backend redirects to: /payment/result?status=success&amount=...&transactionId=...
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");
  const bankCode = searchParams.get("bankCode") || searchParams.get("vnp_BankCode");
  const payDate = searchParams.get("payDate") || searchParams.get("vnp_PayDate");
  const responseCode = searchParams.get("responseCode") || searchParams.get("vnp_ResponseCode");

  // Support both backend-style (status=success) and VNPay-style (vnp_ResponseCode=00)
  const amountInVND = amount ? Math.floor(parseFloat(amount)) : 0;
  const isSuccess = status === "success" || responseCode === "00";
  const transactionNo = transactionId || searchParams.get("vnp_TransactionNo");

  // Refresh wallet data on success and show notification
  useEffect(() => {
    const refreshWallet = async () => {
      if (isSuccess) {
        try {
          // Wait a moment for backend to process callback
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await walletService.getWallet();
          setWalletRefreshed(true);
          addNotification?.({
            title: "Wallet top-up successful",
            message: `Transaction #${transactionNo} added ${formatCurrency(
              amountInVND,
            )} to your wallet.`,
            type: "success",
          });
        } catch (error) {
          console.error("Error refreshing wallet:", error);
        }
      } else if (responseCode || status) {
        addNotification?.({
          title: "Wallet top-up failed",
          message: `Transaction #${transactionNo || "N/A"} was declined. Error code: ${
            responseCode || status
          }.`,
          type: "error",
        });
      }
      setLoading(false);
    };

    refreshWallet();
  }, [isSuccess, transactionNo, amountInVND, responseCode, status, addNotification]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Spin
          indicator={<Loader2 className="payment-result-spin" size={48} aria-hidden />}
          tip="Processing transaction..."
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <div className="payment-result-content">
        {isSuccess ? (
          <>
            <div className="payment-result-centered">
              <Result
                status="success"
                icon={
                  <div className="payment-result-hero payment-result-hero--success" aria-hidden>
                    <Check className="payment-result-hero-check" size={30} strokeWidth={3} />
                  </div>
                }
                title="Wallet top-up successful!"
                subTitle={`Transaction #${transactionNo} has been processed successfully.`}
                extra={[
                  <Button type="primary" key="wallet" onClick={() => navigate("/wallet")}>
                    Back to Wallet
                  </Button>,
                  <Button key="home" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>,
                ]}
              />
            </div>

            <Card className="payment-result-detail-card">
              <h3 style={{ marginBottom: "20px", color: "#333" }}>Transaction details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>TRANSACTION ID</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>{transactionNo}</div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>BANK CODE</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>{bankCode || "N/A"}</div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>AMOUNT</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#10b981" }}>
                    +{formatCurrency(amountInVND)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>TIME</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {payDate ? formatPayDate(payDate) : "N/A"}
                  </div>
                </div>
              </div>

              <Divider />

              <div className="payment-result-status success">
                <CheckCircle2 className="payment-result-inline-icon payment-result-inline-icon--success" size={20} aria-hidden />
                <span style={{ fontWeight: "500" }}>
                  {walletRefreshed ? "Your wallet has been updated" : "Transaction is being processed..."}
                </span>
              </div>
            </Card>
          </>
        ) : (
          <>
            <div className="payment-result-centered">
              <Result
                status="error"
                icon={
                  <div className="payment-result-hero payment-result-hero--error" aria-hidden>
                    <X className="payment-result-hero-x" size={32} strokeWidth={3} />
                  </div>
                }
                title="Transaction failed"
                subTitle={`Transaction #${transactionNo} was declined. Please try again or contact support.`}
                extra={[
                  <Button type="primary" key="retry" onClick={() => navigate("/wallet")}>
                    Back & Retry
                  </Button>,
                  <Button key="home" onClick={() => navigate("/")}>
                    Home
                  </Button>,
                ]}
              />
            </div>

            <Card className="payment-result-detail-card">
              <h3 style={{ marginBottom: "20px", color: "#333" }}>Error details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>TRANSACTION ID</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>{transactionNo || "N/A"}</div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>ERROR CODE</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#dc2626" }}>{responseCode || "UNKNOWN"}</div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>REQUESTED AMOUNT</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {amountInVND > 0 ? formatCurrency(amountInVND) : "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>BANK</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>{bankCode || "N/A"}</div>
                </div>
              </div>

              <Divider />

              <div className="payment-result-status error">
                <XCircle className="payment-result-inline-icon payment-result-inline-icon--error" size={20} aria-hidden />
                <span style={{ fontWeight: "500" }}>
                  Transaction was cancelled by the bank or user.
                </span>
              </div>
            </Card>

            {/* Troubleshooting */}
            <div style={{ marginTop: "30px" }}>
              <Card title="Troubleshooting" size="small">
                <ul style={{ marginBottom: "0", paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "8px" }}>Check your bank account balance</li>
                  <li style={{ marginBottom: "8px" }}>Ensure you entered the correct OTP</li>
                  <li style={{ marginBottom: "8px" }}>Try again with a different bank</li>
                  <li style={{ marginBottom: "8px" }}>Contact BASAUYCLE support if the issue persists</li>
                </ul>
              </Card>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

/**
 * Format payment date from VNPay format (YYYYMMDDHHmmss)
 */
function formatPayDate(dateStr) {
  if (!dateStr || dateStr.length !== 14) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

export default PaymentResult;

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Card, Spin, Divider } from "antd";
import { Loader2, Check, X, XCircle } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { formatCurrency } from "../../utils/formatCurrency";
import { walletService, transactionService } from "../../services";
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
  const [txDetail, setTxDetail] = useState(null);
  const { addNotification } = useNotifications();

  const getParam = (...keys) => {
    for (const key of keys) {
      const value = searchParams.get(key);
      if (value != null && String(value).trim() !== "") return value;
    }
    return null;
  };

  // Get payment result params from backend redirect
  // Backend redirects to: /payment/result?status=success&amount=...&transactionId=...
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transactionId");
  const amount = searchParams.get("amount");
  const bankCode = getParam("vnp_bank_code", "vnp_BankCode", "bankCode");
  const payDate = getParam("payDate", "vnp_PayDate");
  const responseCode = getParam("vnp_response_code", "vnp_ResponseCode", "responseCode");
  const vnpTxnRef = getParam("vnp_txn_ref", "vnp_TxnRef", "txnRef");
  const vnpTransactionNo = getParam(
    "vnp_transaction_no",
    "vnp_TransactionNo",
    "transactionNo",
  );

  const readTxField = (...keys) => {
    if (!txDetail || typeof txDetail !== "object") return null;
    for (const key of keys) {
      const value = txDetail[key];
      if (value != null && String(value).trim() !== "") return value;
    }
    return null;
  };

  const vnpTxnRefDisplay =
    readTxField("vnpTxnRef", "vnp_txn_ref", "txnRef", "vnpTxnref") ?? vnpTxnRef;
  const vnpTransactionNoDisplay =
    readTxField("vnpTransactionNo", "vnp_transaction_no", "transactionNo") ??
    vnpTransactionNo;
  const vnpBankCodeDisplay =
    readTxField("vnpBankCode", "vnp_bank_code", "bankCode") ?? bankCode;
  const timeDisplay =
    readTxField("createdAt", "created_at") ??
    (payDate ? formatPayDate(payDate) : null);

  // Support both backend-style (status=success) and VNPay-style (vnp_ResponseCode=00)
  const amountInVND = amount ? Math.floor(parseFloat(amount)) : 0;
  const isSuccess = status === "success" || responseCode === "00";
  const transactionNo = transactionId || vnpTransactionNo;

  // Refresh wallet data on success and show notification
  useEffect(() => {
    const refreshWallet = async () => {
      const hasRequiredVnpMeta = (tx) => {
        if (!tx || typeof tx !== "object") return false;
        const ref = tx?.vnpTxnRef ?? tx?.vnp_txn_ref ?? tx?.txnRef;
        const no = tx?.vnpTransactionNo ?? tx?.vnp_transaction_no ?? tx?.transactionNo;
        const code = tx?.vnpResponseCode ?? tx?.vnp_response_code ?? tx?.responseCode;
        const hasRef = ref != null && String(ref).trim() !== "";
        const hasNo = no != null && String(no).trim() !== "";
        const hasCode = code != null && String(code).trim() !== "";
        return hasRef && hasNo && hasCode;
      };

      // Load transaction detail from DB (preferred over URL params)
      let txFromDb = null;
      if (transactionId) {
        try {
          const txRes = await transactionService.getById(transactionId);
          const txData = txRes?.result ?? txRes?.data ?? txRes;
          if (txData && typeof txData === "object") {
            txFromDb = txData;
          }
        } catch (error) {
          console.warn("Could not fetch transaction details from DB:", error?.message);
        }
      }

      // Fallback: query transaction history and find the matching VNPay row
      if (!txFromDb || !hasRequiredVnpMeta(txFromDb)) {
        try {
          const listRes = await transactionService.getHistory({ limit: 50 });
          const listRaw = listRes?.result ?? listRes?.data ?? listRes;
          const list = Array.isArray(listRaw)
            ? listRaw
            : Array.isArray(listRaw?.content)
              ? listRaw.content
              : [];

          const byNo = (tx) =>
            String(
              tx?.vnpTransactionNo ??
                tx?.vnp_transaction_no ??
                tx?.transactionNo ??
                "",
            ) === String(vnpTransactionNo ?? "");
          const byRef = (tx) =>
            String(tx?.vnpTxnRef ?? tx?.vnp_txn_ref ?? tx?.txnRef ?? "") ===
            String(vnpTxnRef ?? "");

          const txFromHistory =
            list.find((tx) => vnpTransactionNo && byNo(tx)) ||
            list.find((tx) => vnpTxnRef && byRef(tx)) ||
            list.find((tx) => {
              const txType = String(
                tx?.transactionType ?? tx?.transaction_type ?? tx?.type ?? "",
              ).toUpperCase();
              const txStatus = String(
                tx?.status ?? tx?.transactionStatus ?? "",
              ).toUpperCase();
              const txAmount = Number(tx?.amount ?? 0);
              return (
                txType === "TOP_UP" &&
                txStatus === "SUCCESS" &&
                txAmount === amountInVND &&
                hasRequiredVnpMeta(tx)
              );
            }) ||
            null;

          if (txFromHistory) {
            txFromDb = txFromHistory;
          }
        } catch (error) {
          console.warn("Could not fetch transaction history from DB:", error?.message);
        }
      }

      if (txFromDb) setTxDetail(txFromDb);

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
  }, [
    isSuccess,
    transactionNo,
    amountInVND,
    responseCode,
    status,
    addNotification,
    transactionId,
  ]);

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
                subTitle={
                  <div className="payment-result-amount-highlight">
                    +{formatCurrency(amountInVND)}
                  </div>
                }
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

            <Card className="payment-result-detail-card payment-result-detail-card--success">
              <h3 style={{ marginBottom: "20px", color: "#333" }}>Transaction details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>VNP_TXN_REF</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {vnpTxnRefDisplay || "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>VNP_TRANSACTION_NO</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {vnpTransactionNoDisplay || "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>VNP_BANK_CODE</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {vnpBankCodeDisplay || "N/A"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "12px", color: "#999", marginBottom: "4px" }}>TIME</div>
                  <div style={{ fontSize: "16px", fontWeight: "500", color: "#333" }}>
                    {timeDisplay || "N/A"}
                  </div>
                </div>
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

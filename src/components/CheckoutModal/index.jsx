import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Select, Radio, Divider, Spin, Tag, message } from "antd";
import { WalletOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";
import addressService from "../../services/addressService";
import walletService from "../../services/walletService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useDepositRate } from "../../hooks/useDepositRate";

/**
 * Shared checkout popup.
 *
 * Props:
 *  - open        : boolean
 *  - onClose     : () => void
 *  - product     : { id, name, image, brand, price (display string) }
 *  - numericPrice: number  (raw price for calculations)
 *  - onSuccess   : (order) => void   (optional, called after order created)
 */
export default function CheckoutModal({ open, onClose, product, numericPrice: priceProp, onSuccess }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { depositRate, depositPercent } = useDepositRate();
  const { addNotification } = useNotifications();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("deposit");
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.userId ?? user?.user_id ?? user?.id ?? null;

  const numericPrice = (() => {
    if (typeof priceProp === "number" && priceProp > 0) return priceProp;
    const raw = product?.rawPrice ?? product?.numericPrice;
    if (typeof raw === "number" && raw > 0) return raw;
    const str = String(product?.price ?? "0");
    const digitsOnly = str.replace(/[^\d]/g, "");
    return Number(digitsOnly) || 0;
  })();

  const depositAmount = Math.ceil(numericPrice * depositRate);
  const amountToPay = paymentMethod === "full" ? numericPrice : depositAmount;

  const loadData = useCallback(async () => {
    if (!userId) return;
    setAddressLoading(true);
    setWalletLoading(true);

    try {
      const res = await addressService.getAddresses(userId);
      const list = res?.result ?? res?.data ?? res;
      const arr = Array.isArray(list) ? list : [];
      setAddresses(arr);
      if (arr.length > 0) {
        const def = arr.find((a) => a.isDefault) ?? arr[0];
        setSelectedAddressId(def?.addressId ?? def?.id ?? null);
      }
    } catch {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }

    try {
      const res = await walletService.getWallet();
      const w = res?.result ?? res?.data ?? res;
      setWalletBalance(Number(w?.balance ?? w?.amount ?? 0));
    } catch {
      setWalletBalance(null);
    } finally {
      setWalletLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) {
      setPaymentMethod("deposit");
      setSelectedAddressId(null);
      loadData();
    }
  }, [open, loadData]);

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      message.warning("Please select a shipping address");
      return;
    }
    if (walletBalance != null && amountToPay > walletBalance) {
      message.error("Insufficient wallet balance. Please top up.");
      return;
    }
    setSubmitting(true);
    try {
      const order = await addOrder(product, {
        payFull: paymentMethod === "full",
        addressId: selectedAddressId,
      });
      if (order?.orderId) {
        message.success("Order placed successfully!");
        const isFull = paymentMethod === "full";
        addNotification?.({
          title: isFull ? "Full payment successful" : "Deposit successful",
          message: isFull
            ? `Order #${order.orderId} has been fully paid.`
            : `Deposit placed for order #${order.orderId}. Please pay the remaining amount when requested.`,
          type: "success",
        });
        onClose?.();
        if (onSuccess) {
          onSuccess(order);
        } else {
          navigate("/orders");
        }
      }
    } catch (err) {
      message.error(
        err?.message || "Could not create order. Please check your wallet balance.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const insufficientBalance = walletBalance != null && amountToPay > walletBalance;
  const confirmDisabled = submitting || insufficientBalance;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={() => !submitting && onClose?.()}
      footer={null}
      centered
      width={440}
      destroyOnClose
      styles={{
        body: { padding: 0, maxHeight: "calc(100vh - 120px)", overflowY: "auto" },
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px 0" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
          Confirm order
        </h3>
      </div>

      <Divider style={{ margin: "10px 0 0" }} />

      <div style={{ padding: "12px 18px" }}>
        {/* Product info */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {product?.image && (
            <img
              src={product.image}
              alt={product?.name}
              referrerPolicy="no-referrer"
              style={{
                width: 56, height: 44, objectFit: "cover", borderRadius: 6,
                border: "1px solid #e5e7eb", flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {product?.name}
            </div>
            {product?.brand && (
              <Tag color="default" style={{ fontSize: 11, lineHeight: "18px", padding: "0 5px", marginBottom: 1 }}>{product.brand}</Tag>
            )}
            <div style={{ fontWeight: 700, fontSize: 14, color: "#00ccad" }}>
              {typeof product?.price === "string" ? product.price : formatCurrency(numericPrice)}
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 5 }}>
            <EnvironmentOutlined style={{ fontSize: 13 }} /> Shipping address
          </label>
          {addressLoading ? (
            <Spin size="small" />
          ) : addresses.length > 0 ? (
            <Select
              size="small"
              style={{ width: "100%", fontSize: 12 }}
              placeholder="Select address"
              value={selectedAddressId}
              onChange={setSelectedAddressId}
              options={addresses.map((a) => {
                const aid = a.addressId ?? a.id;
                const raw =
                  a.fullAddress ||
                  [a.streetAddress, a.communeName, a.provinceName]
                    .filter(Boolean)
                    .join(", ") ||
                  "No address details";
                const label = a.isDefault ? `${raw} (Default)` : raw;
                return { value: aid, label };
              })}
            />
          ) : (
            <div style={{ color: "#ef4444", fontSize: 12 }}>
              You have no addresses.{" "}
              <Link to="/account" style={{ color: "#00ccad", fontWeight: 600 }}>Add address</Link>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 5 }}>
            <WalletOutlined style={{ fontSize: 13 }} /> Payment method
          </label>
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <Radio
              value="full"
              style={{
                padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8,
                margin: 0, background: paymentMethod === "full" ? "rgba(0,204,173,0.06)" : "#fff",
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 12 }}>Pay in full</span>
              <span style={{ display: "block", fontSize: 11, color: "#6b7280" }}>
                Pay {formatCurrency(numericPrice)} in full
              </span>
            </Radio>
            <Radio
              value="deposit"
              style={{
                padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8,
                margin: 0, background: paymentMethod === "deposit" ? "rgba(0,204,173,0.06)" : "#fff",
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 12 }}>Deposit {depositPercent}%</span>
              <span style={{ display: "block", fontSize: 11, color: "#6b7280" }}>
                Pay {formatCurrency(depositAmount)} now, {formatCurrency(numericPrice - depositAmount)} later
              </span>
            </Radio>
          </Radio.Group>
        </div>

        <Divider style={{ margin: "0 0 10px" }} />

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
            <span>Product price</span>
            <span>{formatCurrency(numericPrice)}</span>
          </div>
          {paymentMethod === "deposit" && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
              <span>Deposit ({depositPercent}%)</span>
              <span>{formatCurrency(depositAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
            <span>Amount to pay</span>
            <span style={{ color: "#00ccad" }}>{formatCurrency(amountToPay)}</span>
          </div>
        </div>

        {/* Wallet balance */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 10px", background: "#f0fdf4", borderRadius: 8, marginBottom: 10, border: "1px solid #bbf7d0",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#166534" }}>
            <WalletOutlined style={{ fontSize: 13 }} /> Wallet balance
          </span>
          {walletLoading ? (
            <Spin size="small" />
          ) : walletBalance != null ? (
            <span style={{ fontWeight: 700, fontSize: 13, color: walletBalance >= amountToPay ? "#166534" : "#dc2626" }}>
              {formatCurrency(walletBalance)}
            </span>
          ) : (
            <span style={{ color: "#6b7280", fontSize: 11 }}>Unable to load</span>
          )}
        </div>

        {insufficientBalance && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6,
            padding: "6px 10px", marginBottom: 8, color: "#dc2626", fontSize: 11, fontWeight: 500,
          }}>
            Insufficient balance. Top up {formatCurrency(amountToPay - walletBalance)}.{" "}
            <Link to="/wallet" style={{ color: "#00ccad", fontWeight: 600 }}>Top up</Link>
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div style={{ display: "flex", gap: 10, padding: "0 18px 14px" }}>
        <button
          type="button"
          onClick={() => onClose?.()}
          disabled={submitting}
          style={{
            flex: 1, padding: "9px 0", border: "1px solid #d1d5db", borderRadius: 8,
            background: "#fff", fontWeight: 600, fontSize: 13, color: "#475569", cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          style={{
            flex: 2, padding: "9px 0", border: "none", borderRadius: 8,
            background: confirmDisabled ? "#94a3b8" : "#00ccad",
            fontWeight: 700, fontSize: 13, color: "#fff",
            cursor: submitting ? "wait" : "pointer", transition: "background 0.2s",
          }}
        >
          {submitting ? "Processing..." : `Confirm ${paymentMethod === "deposit" ? "deposit" : "payment"}`}
        </button>
      </div>
    </Modal>
  );
}

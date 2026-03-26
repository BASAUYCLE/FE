import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Modal, Select, Divider, Spin, Tag, message } from "antd";
import { WalletOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";
import addressService from "../../services/addressService";
import walletService from "../../services/walletService";
import { formatCurrency } from "../../utils/formatCurrency";
import { confirmCrud } from "../../utils/confirmCrud";
import { useDepositRate } from "../../hooks/useDepositRate";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../constants/orderStatus";

/**
 * Payment modal for an existing order (replaces /payment?orderId=X page).
 *
 * Props:
 *  - open     : boolean
 *  - onClose  : () => void
 *  - order    : { orderId, bikeName, image, amountDue, status }
 */
export default function PayNowModal({ open, onClose, order }) {
  const { user } = useAuth();
  const { payRemaining } = useOrders();
  const { depositPercent } = useDepositRate();
  const { addNotification } = useNotifications();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userId = user?.userId ?? user?.user_id ?? user?.id ?? null;
  const amountDue = order?.amountDue ?? 0;
  // DEPOSITED = deposit paid, remaining amount due
  const isFullPayment = order?.status === ORDER_STATUS.DEPOSITED;
  const remainPercent = 100 - depositPercent;

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
      setSelectedAddressId(null);
      loadData();
    }
  }, [open, loadData]);

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      message.warning("Please select a shipping address");
      return;
    }
    if (walletBalance != null && amountDue > walletBalance) {
      message.error("Insufficient wallet balance. Please top up.");
      return;
    }
    const ok = await confirmCrud({
      title: "Confirm payment?",
      content: `Deduct ${formatCurrency(amountDue)} from your wallet for order #${order.orderId} (${order?.bikeName ?? ""}).`,
      okText: "Pay now",
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      await payRemaining(order.orderId);
      message.success("Payment successful!");
      addNotification?.({
        title: "Payment successful",
        message: `You have paid the remaining amount for order #${order.orderId}.`,
        type: "success",
      });
      onClose?.();
    } catch (err) {
      message.error(
        err?.message || "Payment failed. Please check your wallet balance.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const insufficientBalance =
    walletBalance != null && amountDue > walletBalance;
  const confirmDisabled = submitting || insufficientBalance;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={() => !submitting && onClose?.()}
      footer={null}
      centered
      width={440}
      destroyOnHidden
      styles={{
        body: {
          padding: 0,
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
        },
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px 0" }}>
        <h3
          style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}
        >
          Confirm payment
        </h3>
      </div>

      <Divider style={{ margin: "10px 0 0" }} />

      <div style={{ padding: "12px 18px" }}>
        {/* Product info */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {order?.image ? (
            <img
              src={order.image}
              alt={order?.bikeName}
              referrerPolicy="no-referrer"
              style={{
                width: 56,
                height: 44,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 44,
                borderRadius: 6,
                background: "#f1f5f9",
                border: "1px solid #e5e7eb",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#94a3b8",
              }}
            >
              No image
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#1a1a1a",
                marginBottom: 3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {order?.bikeName ?? "—"}
            </div>
            <Tag
              color={ORDER_STATUS_TAG_COLOR[order?.status]}
              style={{
                fontSize: 11,
                lineHeight: "18px",
                padding: "0 5px",
                marginBottom: 2,
              }}
            >
              {ORDER_STATUS_LABEL[order?.status] ?? order?.status}
            </Tag>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {order?.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-US")
                : ""}
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 600,
              fontSize: 12,
              color: "#374151",
              marginBottom: 5,
            }}
          >
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
              <Link to="/account" style={{ color: "#00ccad", fontWeight: 600 }}>
                Add address
              </Link>
            </div>
          )}
        </div>

        {/* Payment type info */}
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontWeight: 600,
              fontSize: 12,
              color: "#374151",
              marginBottom: 5,
            }}
          >
            <WalletOutlined style={{ fontSize: 13 }} /> Payment method
          </label>
          <div
            style={{
              padding: "7px 10px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "rgba(0,204,173,0.06)",
              fontSize: 12,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 12 }}>
              {isFullPayment ? "Pay remaining amount" : "Pay deposit"}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 11,
                color: "#6b7280",
                marginTop: 2,
              }}
            >
              {isFullPayment
                ? `Deposit ${depositPercent}% paid, pay remaining ${remainPercent}%`
                : `Deposit ${depositPercent}% of order value`}
            </span>
          </div>
        </div>

        <Divider style={{ margin: "0 0 10px" }} />

        {/* Summary */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            <span>Amount to pay</span>
            <span style={{ color: "#00ccad" }}>
              {formatCurrency(amountDue)}
            </span>
          </div>
        </div>

        {/* Wallet balance */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "7px 10px",
            background: "#f0fdf4",
            borderRadius: 8,
            marginBottom: 10,
            border: "1px solid #bbf7d0",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: "#166534",
            }}
          >
            <WalletOutlined style={{ fontSize: 13 }} /> Wallet balance
          </span>
          {walletLoading ? (
            <Spin size="small" />
          ) : walletBalance != null ? (
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: walletBalance >= amountDue ? "#166534" : "#dc2626",
              }}
            >
              {formatCurrency(walletBalance)}
            </span>
          ) : (
            <span style={{ color: "#6b7280", fontSize: 11 }}>
              Unable to load
            </span>
          )}
        </div>

        {insufficientBalance && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 6,
              padding: "6px 10px",
              marginBottom: 8,
              color: "#dc2626",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            Insufficient balance. Top up{" "}
            {formatCurrency(amountDue - walletBalance)}.{" "}
            <Link to="/wallet" style={{ color: "#00ccad", fontWeight: 600 }}>
              Top up
            </Link>
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
            flex: 1,
            padding: "9px 0",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            background: "#fff",
            fontWeight: 600,
            fontSize: 13,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirmDisabled}
          style={{
            flex: 2,
            padding: "9px 0",
            border: "none",
            borderRadius: 8,
            background: confirmDisabled ? "#94a3b8" : "#00ccad",
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            cursor: submitting ? "wait" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {submitting ? "Processing..." : "Confirm payment"}
        </button>
      </div>
    </Modal>
  );
}

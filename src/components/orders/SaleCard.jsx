import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Tag,
  Button,
  Typography,
  Popconfirm,
  App,
  Tooltip,
} from "antd";
import ProductPreviewModal from "../ProductPreviewModal";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../constants/orderStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";
import ConfirmShippingModal from "./ConfirmShippingModal";
import disputeService from "../../services/disputeService";
import { DISPUTE_STATUS } from "../../constants/disputeStatus";
import "./PendingOrderCard.css";

export default function SaleCard({ order }) {
  const { message } = App.useApp();
  const { cancelOrder, refreshSales } = useOrders();
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState(null);
  const { addNotification } = useNotifications();

  const status = order.status ?? ORDER_STATUS.PAID;

  useEffect(() => {
    if (status !== ORDER_STATUS.DISPUTED) {
      setActiveDispute(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await disputeService.getMyDisputes();
        const raw = res?.result ?? res?.data ?? res;
        const arr = Array.isArray(raw) ? raw : [];
        const matches = arr.filter((x) => {
          const oid = x?.orderId ?? x?.order_id;
          return String(oid) === String(order.orderId);
        });
        const d = matches.sort(
          (a, b) => Number(b?.disputeId ?? 0) - Number(a?.disputeId ?? 0),
        )[0];
        if (!cancelled) setActiveDispute(d ?? null);
      } catch {
        if (!cancelled) setActiveDispute(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, order.orderId]);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelOrder(order.orderId, { isSeller: true });
      message.success("Order cancelled");
      addNotification?.({
        title: "Sale order cancelled",
        message: `You cancelled order #${order.orderId}. The buyer will be refunded if applicable.`,
        type: "warning",
      });
    } catch {
      message.error("Could not cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderActions = () => {
    switch (status) {
      case ORDER_STATUS.PAID:
        return (
          <div className="poc-actions">
            <Button
              type="primary"
              size="small"
              onClick={() => setShipModalOpen(true)}
              style={{
                backgroundColor: "#3b82f6",
                border: "none",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              <TruckOutlined /> Ship
            </Button>
            <Popconfirm
              title="Cancel order?"
              description="The buyer will be refunded."
              onConfirm={handleCancel}
              okText="Cancel order"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                loading={loading}
                style={{ marginTop: 4 }}
              >
                <CloseCircleOutlined /> Cancel
              </Button>
            </Popconfirm>
          </div>
        );

      case ORDER_STATUS.DEPOSITED:
        return (
          <div className="poc-actions">
            <Tooltip title="Waiting for buyer to pay in full">
              <Button size="small" disabled style={{ color: "#f59e0b" }}>
                Awaiting payment
              </Button>
            </Tooltip>
          </div>
        );

      case ORDER_STATUS.SHIPPING:
        return (
          <div className="poc-actions">
            <Button size="small" disabled style={{ color: "#3b82f6" }}>
              <TruckOutlined /> Shipping
            </Button>
            {order.shippingTrackingNumber && (
              <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 3 }}>
                {order.shippingTrackingNumber}
              </div>
            )}
          </div>
        );

      case ORDER_STATUS.DELIVERED:
        return (
          <div className="poc-actions">
            <Button
              size="small"
              disabled
              style={{ color: "#0891b2", fontWeight: 600 }}
            >
              Delivered to buyer
            </Button>
          </div>
        );

      case ORDER_STATUS.DISPUTED:
        return (
          <div className="poc-actions poc-actions-stack">
            <Link
              to={`/my-disputes?orderId=${encodeURIComponent(order.orderId)}`}
            >
              <Button size="small" type="primary" style={{ fontWeight: 600 }}>
                Dispute details
              </Button>
            </Link>
            {activeDispute?.status === DISPUTE_STATUS.RETURN_SHIPPED && (
              <Button
                size="small"
                style={{ marginTop: 6 }}
                onClick={async () => {
                  try {
                    await disputeService.confirmReturnReceipt(
                      activeDispute.disputeId,
                    );
                    message.success("Return receipt confirmed.");
                    refreshSales?.();
                  } catch (e) {
                    message.error(e?.message || "Could not confirm.");
                  }
                }}
              >
                Confirm return received
              </Button>
            )}
          </div>
        );

      case ORDER_STATUS.COMPLETED:
        return (
          <div className="poc-actions">
            <Button
              size="small"
              disabled
              style={{ color: "#16a34a", fontWeight: 600 }}
            >
              <CheckCircleOutlined /> Completed
            </Button>
          </div>
        );

      case ORDER_STATUS.CANCELLED:
        return (
          <div className="poc-actions">
            <Button size="small" disabled>
              <CloseCircleOutlined /> Cancelled
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const isCompleted = status === ORDER_STATUS.COMPLETED;
  const isCancelled = status === ORDER_STATUS.CANCELLED;

  return (
    <>
      <ConfirmShippingModal
        open={shipModalOpen}
        onClose={() => setShipModalOpen(false)}
        order={order}
      />
      <Card
        className={`pending-order-card ${isCompleted ? "poc-completed" : ""} ${isCancelled ? "poc-cancelled" : ""}`}
      >
        <div className="pending-order-card-inner">
          {/* Image */}
          <div
            className="pending-order-card-image"
            onClick={() => order.bikeId && setPreviewOpen(true)}
            style={{ cursor: order.bikeId ? "pointer" : "default" }}
            title={order.bikeId ? "View product" : undefined}
          >
            {order.image ? (
              <img
                src={order.image}
                alt={order.bikeName}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="pending-order-card-image-placeholder">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="pending-order-card-details">
            <Tag color={ORDER_STATUS_TAG_COLOR[status]}>
              {ORDER_STATUS_LABEL[status] ?? status}
            </Tag>
            <Typography.Title
              level={5}
              className="pending-order-card-title"
              onClick={() => order.bikeId && setPreviewOpen(true)}
              style={{
                cursor: order.bikeId ? "pointer" : "default",
                margin: 0,
              }}
            >
              {order.bikeName}
            </Typography.Title>
            <Typography.Text type="secondary" className="pending-order-card-id">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-US")
                : ""}
            </Typography.Text>
          </div>

          {/* Right */}
          <div className="poc-right">
            <div className="poc-amount-label">Total</div>
            <div
              className={`poc-amount ${isCompleted ? "poc-amount-done" : ""} ${isCancelled ? "poc-amount-cancelled" : ""}`}
            >
              {formatCurrency(order.totalPrice ?? 0)}
            </div>
            {renderActions()}
          </div>
        </div>
      </Card>
      <ProductPreviewModal
        postId={order.bikeId}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

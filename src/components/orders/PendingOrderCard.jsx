import { useState } from "react";
import { Card, Tag, Button, Typography, Tooltip, message, Popconfirm } from "antd";
import ProductPreviewModal from "../ProductPreviewModal";
import { CheckCircleOutlined, CloseCircleOutlined, TruckOutlined } from "@ant-design/icons";
import { ArrowRight } from "lucide-react";
import {
  ORDER_STATUS,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../constants/orderStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";
import PayNowModal from "./PayNowModal";
import "./PendingOrderCard.css";

export default function PendingOrderCard({ order }) {
  const { cancelOrder, confirmDelivery } = useOrders();
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { addNotification } = useNotifications();

  const status = order.status ?? ORDER_STATUS.DEPOSITED;

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      await cancelOrder(order.orderId);
      message.success("Order cancelled");
      addNotification?.({
        title: "Order cancelled",
        message: `You cancelled order #${order.orderId}.`,
        type: "warning",
      });
    } catch {
      message.error("Could not cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setLoading(true);
    try {
      await confirmDelivery(order.orderId);
      message.success("Delivery confirmed successfully!");
      addNotification?.({
        title: "Delivery confirmed",
        message: `You confirmed delivery for order #${order.orderId}.`,
        type: "success",
      });
    } catch {
      message.error("Could not confirm delivery. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRightPanel = () => {
    switch (status) {
      case ORDER_STATUS.DEPOSITED:
        return (
          <div className="poc-right">
            <div className="poc-amount-label">Remaining</div>
            <div className="poc-amount">{formatCurrency(order.amountDue ?? 0)}</div>
            <div className="poc-actions">
              <Button
                type="primary"
                size="small"
                onClick={() => setPayModalOpen(true)}
                loading={loading}
                style={{ backgroundColor: "#00ccad", border: "none", fontWeight: 600, color: "#fff" }}
              >
                Pay Now <ArrowRight size={12} style={{ marginLeft: 2, verticalAlign: "middle" }} />
              </Button>
              <Popconfirm
                title="Cancel order?"
                description="You will lose your deposit if you cancel."
                onConfirm={handleCancelOrder}
                okText="Cancel order"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button size="small" danger loading={loading} style={{ marginTop: 4 }}>
                  <CloseCircleOutlined /> Cancel
                </Button>
              </Popconfirm>
            </div>
          </div>
        );

      case ORDER_STATUS.PAID:
        return (
          <div className="poc-right">
            <div className="poc-amount-label">Total</div>
            <div className="poc-amount">{formatCurrency(order.totalPrice ?? 0)}</div>
            <div className="poc-actions">
              <Tooltip title="Waiting for seller to ship">
                <Button size="small" disabled style={{ color: "#2563eb", fontWeight: 600 }}>
                  <TruckOutlined /> Awaiting shipment
                </Button>
              </Tooltip>
            </div>
          </div>
        );

      case ORDER_STATUS.SHIPPING:
        return (
          <div className="poc-right">
            <div className="poc-amount-label">Total</div>
            <div className="poc-amount">{formatCurrency(order.totalPrice ?? 0)}</div>
            {order.shippingTrackingNumber && (
              <div className="poc-tracking">
                <TruckOutlined style={{ fontSize: 11, marginRight: 3, color: "#3b82f6" }} />
                <span>{order.shippingTrackingNumber}</span>
              </div>
            )}
            <div className="poc-actions">
              <Popconfirm
                title="Confirm delivery received?"
                description="This action cannot be undone."
                onConfirm={handleConfirmDelivery}
                okText="Received"
                cancelText="No"
              >
                <Button
                  type="primary"
                  size="small"
                  loading={loading}
                  style={{ backgroundColor: "#16a34a", border: "none", fontWeight: 600, color: "#fff" }}
                >
                  <CheckCircleOutlined /> Confirm received
                </Button>
              </Popconfirm>
            </div>
          </div>
        );

      case ORDER_STATUS.COMPLETED:
        return (
          <div className="poc-right">
            <div className="poc-amount-label">Total</div>
            <div className="poc-amount poc-amount-done">{formatCurrency(order.totalPrice ?? 0)}</div>
            <div className="poc-actions">
              <Button size="small" disabled style={{ color: "#16a34a", fontWeight: 600 }}>
                <CheckCircleOutlined /> Completed
              </Button>
            </div>
          </div>
        );

      case ORDER_STATUS.CANCELLED:
        return (
          <div className="poc-right">
            <div className="poc-amount-label">Total</div>
            <div className="poc-amount poc-amount-cancelled">{formatCurrency(order.totalPrice ?? 0)}</div>
            <div className="poc-actions">
              <Button size="small" disabled>
                <CloseCircleOutlined /> Cancelled
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCompleted  = status === ORDER_STATUS.COMPLETED;
  const isCancelled  = status === ORDER_STATUS.CANCELLED;

  return (
    <>
      <PayNowModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
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
              <img src={order.image} alt={order.bikeName} referrerPolicy="no-referrer" />
            ) : (
              <div className="pending-order-card-image-placeholder">No image</div>
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
              style={{ cursor: order.bikeId ? "pointer" : "default", margin: 0 }}
            >
              {order.bikeName}
            </Typography.Title>
            <Typography.Text type="secondary" className="pending-order-card-id">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
            </Typography.Text>
            {/* Shipping tracking info */}
            {status === ORDER_STATUS.SHIPPING && order.shippingMethod && (
              <div className="poc-ship-info">
                <TruckOutlined style={{ fontSize: 11, color: "#3b82f6" }} />
                <span>{order.shippingMethod}</span>
              </div>
            )}
          </div>

          {/* Right panel — status-specific */}
          {renderRightPanel()}
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

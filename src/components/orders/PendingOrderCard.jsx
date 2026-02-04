import { useNavigate } from "react-router-dom";
import { Card, Tag, Button, Typography } from "antd";
import { Clock, ArrowRight } from "lucide-react";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../constants/orderStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  getEffectiveStatus,
  getExpirationLabel,
} from "../../utils/orderHelpers";
import { ORDER_STATUS } from "../../constants/orderStatus";
import "./PendingOrderCard.css";

/**
 * Single pending payment card. Reusable; compact spacing.
 */
export default function PendingOrderCard({ order }) {
  const navigate = useNavigate();
  const status = getEffectiveStatus(order);
  const expired = status === ORDER_STATUS.EXPIRED;
  const paid = status === ORDER_STATUS.PAID;
  const expirationLabel = getExpirationLabel(order.expiresAt);

  const handlePayNow = () => {
    if (expired || paid) return;
    navigate(`/payment?orderId=${encodeURIComponent(order.orderId)}`);
  };

  return (
    <Card
      className={`pending-order-card ${expired ? "pending-order-card-expired" : ""}`}
    >
      <div className="pending-order-card-inner">
        <div className="pending-order-card-image">
          {order.image ? (
            <img src={order.image} alt={order.bikeName} />
          ) : (
            <div className="pending-order-card-image-placeholder">No image</div>
          )}
        </div>

        <div className="pending-order-card-details">
          <Tag color={ORDER_STATUS_TAG_COLOR[status]}>
            {ORDER_STATUS_LABEL[status]}
          </Tag>
          <Typography.Title level={5} className="pending-order-card-title">
            {order.bikeName}
          </Typography.Title>
          <Typography.Text type="secondary" className="pending-order-card-id">
            ID: {order.orderId}
          </Typography.Text>
          <div className="pending-order-card-expiry">
            <Clock size={12} color="#64748b" />
            <span>{expirationLabel}</span>
          </div>
        </div>

        <div className="pending-order-card-right">
          <div className="pending-order-card-amount-label">Amount Due</div>
          <div className="pending-order-card-amount">
            {formatCurrency(order.amountDue)}
          </div>
          <div className="pending-order-card-actions">
            {paid ? (
              <Button disabled size="small" style={{ color: "#16a34a" }}>
                ✓ Paid
              </Button>
            ) : expired ? (
              <Button disabled size="small">
                Expired
              </Button>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={handlePayNow}
                style={{
                  backgroundColor: "#00ccad",
                  color: "#0f172a",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                Pay Now{" "}
                <ArrowRight
                  size={12}
                  style={{ marginLeft: 2, verticalAlign: "middle" }}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

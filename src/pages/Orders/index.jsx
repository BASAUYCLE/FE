import { useMemo, useState } from "react";
import { Tabs, Typography, Empty } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import PendingOrderCard from "../../components/orders/PendingOrderCard";
import { useOrders } from "../../contexts/OrderContext";
import { ORDER_STATUS } from "../../constants/orderStatus";
import "./index.css";

const STATUS_TABS = [
  { key: "all",                        label: "All" },
  { key: ORDER_STATUS.DEPOSITED,       label: "Awaiting payment" },
  { key: ORDER_STATUS.PAID,            label: "Awaiting shipment" },
  { key: ORDER_STATUS.SHIPPING,        label: "Shipping" },
  { key: ORDER_STATUS.COMPLETED,       label: "Completed" },
  { key: ORDER_STATUS.CANCELLED,       label: "Cancelled" },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { orders } = useOrders();

  const displayOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const tabs = STATUS_TABS.map((t) => {
    const count = t.key === "all"
      ? orders.length
      : orders.filter((o) => o.status === t.key).length;
    return {
      key: t.key,
      label: (
        <span>
          {t.label}
          {count > 0 && (
            <span className="orders-tab-badge">{count}</span>
          )}
        </span>
      ),
      children: (
        <div className="orders-list">
          {displayOrders.length === 0 ? (
            <Empty
              description={`No orders${t.key === "all" ? "" : ` "${t.label}"`}`}
              style={{ padding: "40px 0" }}
            />
          ) : (
            displayOrders.map((order) => (
              <PendingOrderCard key={order.orderId ?? order.id} order={order} />
            ))
          )}
        </div>
      ),
    };
  });

  return (
    <div className="orders-page">
      <Header />
      <main className="orders-main">
        <div className="orders-container">
          <Typography.Title level={2} className="title">
            My Orders
          </Typography.Title>
          <Typography.Text type="secondary" className="orders-subtitle">
            Track and manage all your orders
          </Typography.Text>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            className="orders-tabs"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useMemo, useState } from "react";
import { Row, Col, Card, Typography } from "antd";
import { CheckCircle, HelpCircle, Headphones } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import OrderFilters from "../../components/orders/OrderFilters";
import PendingOrderCard from "../../components/orders/PendingOrderCard";
import { useOrders } from "../../contexts/OrderContext";
import "./index.css";

const BREADCRUMB_ITEMS = [
  { label: "Account", path: "/account" },
  { label: "Transactions", path: "/wallet" },
  { label: "Pending Payments" },
];

const INFO_CARDS = [
  {
    key: "secure",
    icon: <CheckCircle size={32} color="#16a34a" />,
    title: "Secure Transactions",
    description:
      "Payments are held in escrow until you confirm delivery. Your data is protected with industry-standard encryption.",
  },
  {
    key: "time",
    icon: <HelpCircle size={32} color="#0ea5e9" />,
    title: "Need more time?",
    description:
      "Contact the seller to request an extension if you need more time to complete your payment.",
  },
  {
    key: "support",
    icon: <Headphones size={32} color="#0d9488" />,
    title: "Payment Support",
    description:
      "24/7 support for payment issues. Reach out if you have questions or discrepancies.",
  },
];

/** Filter orders by date range and amount (client-side; replace with API params when ready) */
function filterOrders(orders, dateRange, amountFilter) {
  const now = new Date();
  let start = new Date(now);
  const days = parseInt(dateRange, 10) || 30;
  start.setDate(start.getDate() - days);

  return orders.filter((order) => {
    const created = order.createdAt ? new Date(order.createdAt) : new Date(0);
    if (created < start) return false;

    if (amountFilter === "all") return true;
    const due = order.amountDue || 0;
    if (amountFilter === "0-1m") return due < 1_000_000;
    if (amountFilter === "1m-5m") return due >= 1_000_000 && due <= 5_000_000;
    if (amountFilter === "5m+") return due > 5_000_000;
    return true;
  });
}

export default function OrdersPage() {
  const [dateRange, setDateRange] = useState("30");
  const [amountFilter, setAmountFilter] = useState("all");
  const { orders } = useOrders();

  const filteredOrders = useMemo(
    () => filterOrders(orders, dateRange, amountFilter),
    [orders, dateRange, amountFilter],
  );

  return (
    <div className="orders-page">
      <Header />
      <main className="orders-main">
        <div className="orders-container">
          <PageBreadcrumb items={BREADCRUMB_ITEMS} />
          <Typography.Title level={2} className="title">
            Pending Payments Management
          </Typography.Title>
          <Typography.Text
            type="secondary"
            className="orders-subtitle"
            style={{ display: "block" }}
          >
            Manage your active orders awaiting deposit or final payment
          </Typography.Text>

          <OrderFilters
            dateRange={dateRange}
            amount={amountFilter}
            onDateRangeChange={setDateRange}
            onAmountChange={setAmountFilter}
            onMoreFilters={() => {}}
          />

          <div className="orders-list">
            {filteredOrders.length === 0 ? (
              <Typography.Text type="secondary">
                No pending payments match your filters.
              </Typography.Text>
            ) : (
              filteredOrders.map((order) => (
                <PendingOrderCard key={order.id} order={order} />
              ))
            )}
          </div>

          <Row
            gutter={[16, 16]}
            className="orders-info-cards"
            style={{ marginTop: 32 }}
          >
            {INFO_CARDS.map((item) => (
              <Col xs={24} md={8} key={item.key}>
                <Card
                  style={{
                    borderRadius: 10,
                    height: "100%",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="orders-info-card-icon">{item.icon}</div>
                  <Typography.Title
                    level={5}
                    style={{ marginBottom: 6, fontSize: 15 }}
                  >
                    {item.title}
                  </Typography.Title>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: 13, lineHeight: 1.45 }}
                  >
                    {item.description}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </main>
      <Footer />
    </div>
  );
}

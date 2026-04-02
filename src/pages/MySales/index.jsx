import { useMemo, useState } from "react";
import { Tabs, Typography, Empty } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import SaleCard from "../../components/orders/SaleCard";
import { useOrders } from "../../contexts/OrderContext";
import { ORDER_STATUS } from "../../constants/orderStatus";
import "../Orders/index.css";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: ORDER_STATUS.DEPOSITED, label: "Awaiting payment" },
  { key: ORDER_STATUS.PAID, label: "Awaiting shipment" },
  { key: ORDER_STATUS.SHIPPING, label: "Shipping" },
  { key: ORDER_STATUS.DELIVERED, label: "Delivered" },
  { key: ORDER_STATUS.DISPUTED, label: "Disputed" },
  { key: ORDER_STATUS.COMPLETED, label: "Completed" },
  { key: ORDER_STATUS.CANCELLED, label: "Cancelled" },
];

export default function MySalesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const { sales } = useOrders();

  const displaySales = useMemo(() => {
    if (activeTab === "all") return sales;
    return sales.filter((o) => o.status === activeTab);
  }, [sales, activeTab]);

  const tabs = STATUS_TABS.map((t) => {
    const count =
      t.key === "all"
        ? sales.length
        : sales.filter((o) => o.status === t.key).length;
    return {
      key: t.key,
      label: (
        <span>
          {t.label}
          {count > 0 && <span className="orders-tab-badge">{count}</span>}
        </span>
      ),
      children: (
        <div className="orders-list">
          {displaySales.length === 0 ? (
            <Empty
              description={`No sales${t.key === "all" ? "" : ` "${t.label}"`} found`}
              style={{ padding: "40px 0" }}
            />
          ) : (
            displaySales.map((order) => (
              <SaleCard key={order.orderId ?? order.id} order={order} />
            ))
          )}
        </div>
      ),
    };
  });

  return (
    <div className="orders-page">
      {/* <MySalesHeader /> */}
      <Header />
      <main className="orders-main">
        <div className="orders-container">
          {/* <MySalesPageHeading /> */}
          <Typography.Title level={2} className="title">
            My Sales
          </Typography.Title>
          <Typography.Text type="secondary" className="orders-subtitle">
            Manage orders from your listings
          </Typography.Text>

          {/* <MySalesTabsAndList /> */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            className="orders-tabs"
          />
        </div>
      </main>
      {/* <MySalesFooter /> */}
      <Footer />
    </div>
  );
}

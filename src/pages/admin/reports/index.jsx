import "./index.css";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useLocation } from "react-router-dom";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import {
  Bike,
  DollarSign,
  ShoppingCart,
  UserRound,
  ArrowDownToLine,
  ChevronDown,
} from "lucide-react";

const statCards = [
  { label: "Total Revenue", value: "$128,430", change: "+12.5%", tone: "green", icon: <DollarSign /> },
  { label: "Completed Sales", value: "1,240", change: "+8.2%", tone: "green", icon: <ShoppingCart /> },
  { label: "New Users", value: "856", change: "-2.4%", tone: "red", icon: <UserRound /> },
  { label: "Active Listings", value: "3,492", change: "+15.1%", tone: "green", icon: <Bike /> },
];

const categories = [
  { label: "Mountain Bikes", value: 45, color: "green" },
  { label: "Road Bikes", value: 28, color: "purple" },
  { label: "Electric Bikes", value: 18, color: "teal" },
  { label: "Others", value: 9, color: "gray" },
];

const transactions = [
  {
    id: "#TX-84920",
    customer: "Alex Johnson",
    item: "Carbon Trek Domane",
    amount: "$1,250.00",
    status: "Completed",
    date: "Oct 12, 2023",
  },
  {
    id: "#TX-84918",
    customer: "Sarah Miller",
    item: "Specialized Rockhopper",
    amount: "$740.00",
    status: "Pending",
    date: "Oct 11, 2023",
  },
  {
    id: "#TX-84915",
    customer: "Michael Chen",
    item: "Cannondale Synapse Neo",
    amount: "$2,100.00",
    status: "Completed",
    date: "Oct 11, 2023",
  },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function ReportsAnalytics() {
  const { pathname } = useLocation();

  return (
    <div className="reports-page">
      <Header
        navLinks={ADMIN_NAV_LINKS}
        activeLink={getAdminActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />

      <div className="reports-body">
        <main className="reports-main">
          <div className="reports-header"></div>

          <section className="reports-stats">
            {statCards.map((card) => (
              <div className="reports-stat-card" key={card.label}>
                <div className={`reports-stat-icon ${card.tone}`}>{card.icon}</div>
                <span className={`reports-stat-change ${card.tone}`}>{card.change}</span>
                <div className="reports-stat-label">{card.label}</div>
                <div className="reports-stat-value">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="reports-grid">
            <div className="reports-card reports-chart-card">
              <div className="reports-card-header">
                <div className="reports-card-title">Sales Overview</div>
                <div className="reports-legend">
                  <span className="reports-legend-item">
                    <i className="dot income" /> Income
                  </span>
                  <span className="reports-legend-item">
                    <i className="dot expense" /> Expenses
                  </span>
                </div>
              </div>
              <div className="reports-chart">
                {months.map((month, index) => (
                  <div className="reports-bar" key={month}>
                    <div className="bar-expense" style={{ height: `${35 + index * 6}%` }} />
                    <div className="bar-income" style={{ height: `${55 + index * 4}%` }} />
                    <span>{month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reports-card reports-categories-card">
              <div className="reports-card-title">Popular Categories</div>
              <div className="reports-category-list">
                {categories.map((cat) => (
                  <div className="reports-category" key={cat.label}>
                    <div className="reports-category-row">
                      <span>{cat.label}</span>
                      <span>{cat.value}%</span>
                    </div>
                    <div className="reports-progress">
                      <div className={`reports-progress-bar ${cat.color}`} style={{ width: `${cat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="reports-card reports-table-card">
            <div className="reports-card-header">
              <div className="reports-card-title">Recent Transactions</div>
              <div className="reports-table-actions">
                <button className="reports-outline">Filter</button>
                <button className="reports-outline">View All</button>
              </div>
            </div>
            <div className="reports-table">
              <div className="reports-table-row header">
                <div>Transaction ID</div>
                <div>Customer</div>
                <div>Item</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Date</div>
              </div>
              {transactions.map((tx) => (
                <div className="reports-table-row" key={tx.id}>
                  <div className="tx-id">{tx.id}</div>
                  <div>{tx.customer}</div>
                  <div className="tx-item">{tx.item}</div>
                  <div className="tx-amount">{tx.amount}</div>
                  <div>
                    <span className={`tx-status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                  </div>
                  <div className="tx-date">{tx.date}</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

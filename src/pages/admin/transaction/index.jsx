import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import "./index.css";

const STATS = [
  { label: "Period revenue", value: "142.480.000 ₫", note: "↑12% vs last period", tone: "green" },
  { label: "Platform fee", value: "8.548.800 ₫", note: "6% average", tone: "green" },
  { label: "Pending payment", value: "3.240.500 ₫", note: "12 orders", tone: "orange" },
  { label: "Success rate", value: "99.2%", note: "Completed transactions", tone: "green" },
];

const TRANSACTIONS = [
  {
    id: "#TXN-88219",
    datetime: "Oct 24, 2023 · 14:22",
    buyer: "John Doe (B)",
    seller: "Mike Smith (S)",
    amount: "$1,250.00",
    fee: "$75.00",
    status: "Completed",
  },
  {
    id: "#TXN-88218",
    datetime: "Oct 24, 2023 · 12:05",
    buyer: "Sarah Wilson (B)",
    seller: "ProBike Shop (S)",
    amount: "$3,400.00",
    fee: "$204.00",
    status: "Pending",
  },
  {
    id: "#TXN-88217",
    datetime: "Oct 23, 2023 · 18:45",
    buyer: "Alice Johnson (B)",
    seller: "David G. (S)",
    amount: "$850.00",
    fee: "$51.00",
    status: "Completed",
  },
];

export default function TransactionManagement() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("30");
  const { pathname } = useLocation();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TRANSACTIONS.filter((row) => {
      const matchesQuery =
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.buyer.toLowerCase().includes(q) ||
        row.seller.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" || row.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="admin-transactions-page">
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

      <div className="admin-transactions-shell">
        <section className="admin-transactions-main">

          <div className="admin-transactions-stats">
            {STATS.map((card) => (
              <div key={card.label} className="stats-card">
                <div className="stats-label">{card.label}</div>
                <div className="stats-value">{card.value}</div>
                <div className={`stats-note ${card.tone}`}>{card.note}</div>
              </div>
            ))}
          </div>

          <div className="admin-transactions-filters">
            <div className="filter-block">
              <div className="filter-label">Search</div>
              <div className="filter-input">
                <Search />
                <input
                  type="text"
                  placeholder="ID, Buyer, or Seller..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-block">
              <div className="filter-label">Status</div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="filter-block">
              <div className="filter-label">Date Range</div>
              <select value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="30">Last 30 days</option>
                <option value="14">Last 14 days</option>
                <option value="7">Last 7 days</option>
              </select>
            </div>
            <button type="button" className="reset-btn">
              Reset Filters
            </button>
          </div>

          <div className="admin-transactions-table">
            <div className="table-row header">
              <div>Transaction ID</div>
              <div>Date & Time</div>
              <div>Buyer & Seller</div>
              <div>Amount</div>
              <div>Fee (6%)</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            {filtered.map((row) => (
              <div key={row.id} className="table-row">
                <div className="tx-id">{row.id}</div>
                <div>{row.datetime}</div>
                <div className="buyer-seller">
                  <div>{row.buyer}</div>
                  <span>{row.seller}</span>
                </div>
                <div className="amount">{row.amount}</div>
                <div className="fee">{row.fee}</div>
                <div>
                  <span className={`status ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </div>
                <div>
                  <button type="button" className="view-btn">
                    <Eye />
                  </button>
                </div>
              </div>
            ))}
            <div className="table-footer">
              <span>Showing 1 to 5 of 1,248 results</span>
              <div className="pagination">
                <button type="button">‹</button>
                <button type="button" className="active">
                  1
                </button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">…</button>
                <button type="button">12</button>
                <button type="button">›</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

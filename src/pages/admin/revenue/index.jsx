import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import "../dashboard/index.css";
import "./index.css";

const PERIODS = [
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
  { value: "quarter", label: "Quý này" },
];

const MOCK_REVENUE_BY_PERIOD = {
  week: { total: "142.480.000", fee: "8.548.800", orders: 48, trend: "+12%" },
  month: {
    total: "518.200.000",
    fee: "31.092.000",
    orders: 186,
    trend: "+8.5%",
  },
  quarter: {
    total: "1.524.000.000",
    fee: "91.440.000",
    orders: 542,
    trend: "+15.2%",
  },
};

const MOCK_CHART_WEEK = [
  { label: "T2", value: 18, amount: "22.100k" },
  { label: "T3", value: 42, amount: "18.500k" },
  { label: "T4", value: 35, amount: "20.200k" },
  { label: "T5", value: 65, amount: "25.800k" },
  { label: "T6", value: 55, amount: "28.400k" },
  { label: "T7", value: 80, amount: "27.480k" },
  { label: "CN", value: 95, amount: "—" },
];

export default function AdminRevenue() {
  const { pathname } = useLocation();
  const [period, setPeriod] = useState("week");

  const data = MOCK_REVENUE_BY_PERIOD[period] || MOCK_REVENUE_BY_PERIOD.week;
  const chartData = period === "week" ? MOCK_CHART_WEEK : MOCK_CHART_WEEK;

  const stats = useMemo(
    () => [
      {
        label: "Doanh thu hàng kỳ",
        value: `${data.total} ₫`,
        note: data.trend,
        tone: "green",
        icon: <DollarSign />,
      },
      {
        label: "Phí nền tảng (6%)",
        value: `${data.fee} ₫`,
        note: "ước tính",
        tone: "blue",
        icon: <CreditCard />,
      },
      {
        label: "Số đơn hàng",
        value: data.orders,
        note: "giao dịch",
        tone: "indigo",
        icon: <TrendingUp />,
      },
    ],
    [data],
  );

  return (
    <div className="admin-dashboard-page admin-revenue-page">
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
      <div className="admin-dashboard">
        <div className="admin-content">
          <header className="admin-topbar admin-revenue-topbar">
            <div>
              <h1 className="admin-page-title">Doanh thu hàng kỳ</h1>
              <p className="admin-page-subtitle">
                Theo dõi doanh thu và phí nền tảng theo tuần, tháng, quý.
              </p>
            </div>
            <div className="admin-period-tabs">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`admin-period-tab ${period === p.value ? "active" : ""}`}
                  onClick={() => setPeriod(p.value)}
                >
                  <Calendar size={14} />
                  {p.label}
                </button>
              ))}
            </div>
          </header>

          <section className="admin-stats admin-revenue-stats">
            {stats.map((card) => (
              <div className="admin-card admin-stat-card" key={card.label}>
                <div className="admin-stat-top">
                  <div className={`admin-stat-icon ${card.tone}`}>
                    {card.icon}
                  </div>
                  <span className={`admin-stat-trend up`}>{card.note}</span>
                </div>
                <div className="admin-stat-title">{card.label}</div>
                <div className="admin-stat-value">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </div>
              </div>
            ))}
          </section>

          <section className="admin-card">
            <div className="admin-card-header">
              <div>
                <div className="admin-card-title">Biểu đồ doanh thu</div>
                <div className="admin-card-subtitle">
                  {PERIODS.find((p) => p.value === period)?.label}
                </div>
              </div>
            </div>
            <div className="admin-chart">
              {chartData.map((day, index) => (
                <div className="admin-chart-bar" key={day.label}>
                  <div
                    className={`admin-chart-fill ${index === chartData.length - 1 ? "highlight" : ""}`}
                    style={{ height: `${day.value}%` }}
                  >
                    <span
                      className={`admin-chart-tooltip ${index === chartData.length - 1 ? "show" : ""}`}
                    >
                      {day.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-chart-labels">
              {chartData.map((day) => (
                <span key={day.label}>{day.label}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

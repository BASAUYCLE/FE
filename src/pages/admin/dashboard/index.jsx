import "./index.css";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useLocation } from "react-router-dom";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import {
  Users,
  DollarSign,
  Wrench,
  UserPlus,
  ShoppingCart,
  AlertTriangle,
  Bike,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "12,543",
    trend: "+12%",
    trendType: "up",
    icon: <Users />,
    tone: "blue",
  },
  {
    label: "New Listings",
    value: "842",
    trend: "+5.2%",
    trendType: "up",
    icon: <Bike />,
    tone: "indigo",
  },
  {
    label: "Total Revenue",
    value: "$18,450",
    trend: "+18.4%",
    trendType: "up",
    icon: <DollarSign />,
    tone: "green",
  },
  {
    label: "Pending Inspection",
    value: "48",
    trend: "12 Pending",
    trendType: "warn",
    icon: <Wrench />,
    tone: "orange",
  },
];

const activities = [
  { title: "Minh Tran just registered", time: "2 minutes ago", type: "user", icon: <UserPlus /> },
  { title: "Transaction #8492 successful", time: "15 minutes ago", type: "success", icon: <ShoppingCart /> },
  { title: "New inspection report: ID-120", time: "1 hour ago", type: "alert", icon: <AlertTriangle /> },
];

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "Seller",
    joined: "12 Oct, 2023",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCi_kmv_l_V0lRpVf4Pb2O6F8noT2bPXANF4NiD5nm4fdfWqbYphhBgs-Ibu5_2QFTPWNNwYmo3RHQNbaLN9dLgHAzil6dV0-DkXiATYspLjLn1ZzIUfZIGUNSP42WhYXrwMiQ61_lHcsQ7GuD7vxliG9Ths61SHumr1Lg_rYBlk2i4GTb-qcnaOpW6PDXCTza2KPKjr120gjy6BADwuU_n5QND_mbveRG4UQl1mNKIyZIo_pD_xnJwjhzBv2kYGj_29p6Ac9HrDU",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Buyer",
    joined: "10 Oct, 2023",
    status: "Offline",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDWC_GUAMiz4KHxCoD5DUavuFHmDt6Mf_b3yRP7vSGkR-XbpacBun19lhX6hyJ-qtg8oEN4Dlmao6jtzdLVMA61N7zLDQh1f5uYmMeK-Osyr2hqYHLTwr1ZV0ggVSnyPqGrDHVBdswy-B_CayEY3x3XP9f_-s4MPtJx7Z9AdnIGfaL-GQorA89TSxi2Ehh0-rYyebjX3HEpnbSIfI6uaMQRPs-uSKRIBD6vQFv0Nm37i4fpAIzAZl_-1ne9yQ-Rh8ExiyWjIbNQZmE",
  },
];

const days = [
  { label: "Mon", value: "5.2k", height: 40 },
  { label: "Tue", value: "7.8k", height: 65 },
  { label: "Wed", value: "6.1k", height: 45 },
  { label: "Thu", value: "9.4k", height: 80 },
  { label: "Fri", value: "7.2k", height: 60 },
  { label: "Sat", value: "11.2k", height: 95 },
  { label: "Sun", value: "8.9k", height: 75 },
];

export default function AdminDashboard() {
  const { pathname } = useLocation();

  return (
    <div className="admin-dashboard-page">
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
          <header className="admin-topbar">
            <div className="admin-topbar-actions"></div>
          </header>

          <section className="admin-stats">
            {stats.map((card) => (
              <div className="admin-card admin-stat-card" key={card.label}>
                <div className="admin-stat-top">
                  <div className={`admin-stat-icon ${card.tone}`}>{card.icon}</div>
                  <span className={`admin-stat-trend ${card.trendType}`}>
                    {card.trend}
                  </span>
                </div>
                <div className="admin-stat-title">{card.label}</div>
                <div className="admin-stat-value">{card.value}</div>
              </div>
            ))}
          </section>

          <section className="admin-grid">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <div className="admin-card-title">Transaction Trends</div>
                  <div className="admin-card-subtitle">Data for the last 7 days</div>
                </div>
                <select className="admin-pill" defaultValue="Weekly">
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
              <div className="admin-chart">
                {days.map((day, index) => (
                  <div className="admin-chart-bar" key={day.label}>
                    <div
                      className={`admin-chart-fill ${index === 6 ? "highlight" : ""}`}
                      style={{ height: `${day.height}%` }}
                    >
                      <span className={`admin-chart-tooltip ${index === 6 ? "show" : ""}`}>
                        ${day.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-chart-labels">
                {days.map((day) => (
                  <span key={day.label}>{day.label}</span>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-card-title">Recent Activity</div>
              </div>
              <div className="admin-activity">
                {activities.map((item, index) => (
                  <div className="admin-activity-row" key={`${item.title}-${index}`}>
                    <div className="admin-activity-icon">
                      <span className={`admin-activity-dot ${item.type}`}>
                        {item.icon}
                      </span>
                      {index < activities.length - 1 && (
                        <span className="admin-activity-line" />
                      )}
                    </div>
                    <div>
                      <div className="admin-activity-title">{item.title}</div>
                      <div className="admin-activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
                <button className="admin-outline-button">View All Activities</button>
              </div>
            </div>
          </section>

          <section className="admin-card admin-table-card">
            <div className="admin-card-header">
              <div className="admin-card-title">New User Management</div>
              <div className="admin-table-actions">
                <button className="admin-outline-button">Export Excel</button>
                <button className="admin-primary-button">Add User</button>
              </div>
            </div>
            <div className="admin-table">
              <div className="admin-table-row admin-table-header">
                <div>User</div>
                <div>Role</div>
                <div>Join Date</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {users.map((user) => (
                <div className="admin-table-row" key={user.email}>
                  <div>
                    <div className="admin-user-cell">
                      <img className="admin-user-avatar small" src={user.avatar} alt={user.name} />
                      <div>
                        <div className="admin-user-name">{user.name}</div>
                        <div className="admin-user-email">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div>{user.role}</div>
                  <div>{user.joined}</div>
                  <div>
                    <span className={`admin-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button className="admin-actions-button" aria-label="More actions">
                      ⋮
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

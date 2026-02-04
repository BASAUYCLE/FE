import "./index.css";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useLocation } from "react-router-dom";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import {
  Bell,
  ChevronDown,
  Download,
  Filter,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserSquare2,
} from "lucide-react";

const stats = [
  {
    label: "Total Users",
    value: "1,284",
    change: "+12%",
    tone: "green",
    icon: <Users />,
  },
  {
    label: "Verified Inspectors",
    value: "42",
    change: "+5%",
    tone: "green",
    icon: <ShieldCheck />,
  },
  {
    label: "Pending Verifications",
    value: "18",
    change: "-2%",
    tone: "red",
    icon: <UserCheck />,
  },
];

const users = [
  {
    id: "#USR-90231",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    role: "Inspector",
    joined: "Oct 24, 2023",
    status: "Active",
  },
  {
    id: "#USR-88122",
    name: "Sarah Miller",
    email: "sarah.m@bicycle-pro.com",
    role: "Seller",
    joined: "Nov 12, 2023",
    status: "Pending",
  },
  {
    id: "#USR-77211",
    name: "Liam Wilson",
    email: "l.wilson@webmail.com",
    role: "Buyer",
    joined: "Dec 01, 2023",
    status: "Active",
  },
];

const requests = [
  {
    name: "Marco Rossi",
    meta: "Italy • Professional Shop",
  },
  {
    name: "Helena Berg",
    meta: "Sweden • Individual",
  },
];

const activities = [
  {
    title: "Admin Jane verified Tom Cruise as Inspector",
    time: "2 minutes ago",
    tone: "green",
  },
  {
    title: "System suspended user ID #8821",
    time: "14 minutes ago",
    tone: "red",
  },
  {
    title: "Manager Sam updated category pricing",
    time: "1 hour ago",
    tone: "blue",
  },
];

const roles = [
  { label: "Buyers", value: 842, percent: 65, tone: "green" },
  { label: "Sellers", value: 400, percent: 31, tone: "purple" },
  { label: "Inspectors", value: 42, percent: 4, tone: "blue" },
];

export default function UserManagement() {
  const { pathname } = useLocation();

  return (
    <div className="user-management-page">
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

      <main className="user-content">
        <section className="user-header">
          <div className="user-header-spacer" />
          <div className="user-header-actions">
            <button className="outline-btn" type="button">
              <Download />
              Export CSV
            </button>
            <button className="primary-btn" type="button">
              <UserPlus />
              Invite User
            </button>
          </div>
        </section>

        <section className="user-stats">
          {stats.map((item) => (
            <div className="stat-card" key={item.label}>
              <div className="stat-icon">{item.icon}</div>
              <div className="stat-meta">
                <div className="stat-label">{item.label}</div>
                <div className="stat-row">
                  <span className="stat-value">{item.value}</span>
                  <span className={`stat-change ${item.tone}`}>{item.change}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="user-table-card">
          <div className="user-table-toolbar">
            <div className="search-input">
              <Search />
              <input type="text" placeholder="Search by name, email or ID..." />
            </div>
            <div className="table-actions">
              <button className="select-btn" type="button">
                Role: All <ChevronDown />
              </button>
              <button className="select-btn" type="button">
                Status: All <ChevronDown />
              </button>
              <button className="outline-btn" type="button">
                <Filter />
                Filters
              </button>
            </div>
          </div>
          <div className="user-table">
            <div className="user-table-row header">
              <div>User</div>
              <div>Email Address</div>
              <div>Role</div>
              <div>Joined</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {users.map((user) => (
              <div className="user-table-row" key={user.id}>
                <div className="user-cell">
                  <div className="user-avatar">{user.name[0]}</div>
                  <div>
                    <div className="user-name">{user.name}</div>
                    <div className="user-id">{user.id}</div>
                  </div>
                </div>
                <div className="user-email">{user.email}</div>
                <div>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </div>
                <div>{user.joined}</div>
                <div>
                  <span className={`status-pill ${user.status.toLowerCase()}`}>{user.status}</span>
                </div>
                <div className="user-actions">
                  <button type="button" className="ghost-btn">
                    ⋯
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="user-table-footer">
            <span>Showing 1-10 of 1,284 users</span>
            <div className="pagination">
              <button type="button" className="page-btn">
                ‹
              </button>
              <button type="button" className="page-btn active">
                1
              </button>
              <button type="button" className="page-btn">
                2
              </button>
              <button type="button" className="page-btn">
                3
              </button>
              <span className="page-ellipsis">…</span>
              <button type="button" className="page-btn">
                129
              </button>
              <button type="button" className="page-btn">
                ›
              </button>
            </div>
          </div>
        </section>

        <section className="user-bottom-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <h3>New Seller Requests</h3>
                <span className="badge-warning">3 pending</span>
              </div>
            </div>
            <div className="request-list">
              {requests.map((req) => (
                <div className="request-item" key={req.name}>
                  <div className="request-avatar">{req.name[0]}</div>
                  <div className="request-info">
                    <div className="request-name">{req.name}</div>
                    <div className="request-meta">{req.meta}</div>
                  </div>
                  <div className="request-actions">
                    <button className="approve-btn" type="button">
                      Approve
                    </button>
                    <button className="reject-btn" type="button">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="link-btn" type="button">
              View All Requests
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Recent Admin Activity</h3>
            </div>
            <div className="activity-list">
              {activities.map((activity) => (
                <div className="activity-item" key={activity.title}>
                  <span className={`activity-dot ${activity.tone}`} />
                  <div>
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="link-btn" type="button">
              Full Audit Log
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>System Role Distribution</h3>
            </div>
            <div className="role-list">
              {roles.map((role) => (
                <div className="role-row" key={role.label}>
                  <div className="role-label">
                    {role.label}
                    <span>{role.value} ({role.percent}%)</span>
                  </div>
                  <div className="role-bar">
                    <span className={`role-fill ${role.tone}`} style={{ width: `${role.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="role-summary">
              <div>
                <div className="role-summary-label">Active</div>
                <div className="role-summary-value green">1.2k</div>
              </div>
              <div>
                <div className="role-summary-label">Banned</div>
                <div className="role-summary-value red">24</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

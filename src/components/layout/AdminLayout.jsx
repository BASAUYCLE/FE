import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  CheckCircle2,
  LineChart,
  ClipboardList,
  Tags,
  Receipt,
  FileBarChart2,
  Settings,
  ChevronRight,
} from "lucide-react";
import { ADMIN_NAV_LINKS } from "../../config/adminNav";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./SidebarLayout.css";

const ADMIN_ICON_MAP = {
  Dashboard: <LayoutDashboard size={18} />,
  Users: <Users size={18} />,
  Listings: <ListChecks size={18} />,
  Approved: <CheckCircle2 size={18} />,
  Revenue: <LineChart size={18} />,
  Inspections: <ClipboardList size={18} />,
  Categories: <Tags size={18} />,
  Transactions: <Receipt size={18} />,
  Reports: <FileBarChart2 size={18} />,
  Config: <Settings size={18} />,
};

function getInitials(name) {
  if (!name || typeof name !== "string") return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0][0] || "A").toUpperCase();
}

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = user?.fullName ?? user?.name ?? user?.email ?? "Admin";

  return (
    <div className="app-sidebar-layout">
      <aside className="app-sidebar app-sidebar-admin" aria-label="Admin menu">
        <div className="app-sidebar-brand">
          <Link to="/admin-dashboard" className="app-sidebar-logo">
            <img src={bikeLogo} alt="" />
            <span>BASAUYCLE</span>
          </Link>
        </div>
        <div className="app-sidebar-nav-group">
          <div className="app-sidebar-nav-group-title">Pages</div>
        </div>
        <nav className="app-sidebar-nav">
          {ADMIN_NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end
              className={({ isActive }) =>
                `app-sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="app-sidebar-link-icon">
                {ADMIN_ICON_MAP[link.label]}
              </span>
              <span className="app-sidebar-link-label">{link.label}</span>
              <ChevronRight size={16} className="app-sidebar-link-arrow" />
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-account">
          <div className="app-sidebar-account-avatar">
            {getInitials(displayName)}
          </div>
          <div className="app-sidebar-account-name">{displayName}</div>
          <div className="app-sidebar-account-role">
            {user?.role ?? "ADMIN"}
          </div>
          {isAuthenticated?.() ? (
            <button
              type="button"
              className="app-sidebar-auth-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="app-sidebar-auth-btn app-sidebar-auth-link"
            >
              Log in
            </Link>
          )}
        </div>
      </aside>
      <div className="app-sidebar-main">
        <div className="app-sidebar-body">{children}</div>
      </div>
    </div>
  );
}

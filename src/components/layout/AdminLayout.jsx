import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ListChecks,
  CheckCircle2,
  LineChart,
  ClipboardList,
  Tags,
  Receipt,
  Gavel,
  FileBarChart2,
  Settings,
  ChevronRight,
} from "lucide-react";
import { ADMIN_NAV_LINKS } from "../../config/adminNav";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { getAvatarSrc } from "../../utils/avatar";
import { onSameRouteScrollToTop } from "../../utils/sameRouteScroll";
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
  Disputes: <Gavel size={18} />,
  Reports: <FileBarChart2 size={18} />,
  Config: <Settings size={18} />,
};

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName = user?.fullName ?? user?.name ?? user?.email ?? "Admin";
  const avatarUrl = getAvatarSrc(user);

  return (
    <div className="app-sidebar-layout">
      <aside className="app-sidebar app-sidebar-admin" aria-label="Admin menu">
        <div className="app-sidebar-brand">
          <Link
            to="/admin-dashboard"
            className="app-sidebar-logo"
            onClick={(e) =>
              onSameRouteScrollToTop(e, "/admin-dashboard", pathname)
            }
          >
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
              onClick={(e) => onSameRouteScrollToTop(e, link.href, pathname)}
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
          <div className="app-sidebar-account-profile">
            <div
              className="app-sidebar-account-avatar"
              style={
                avatarUrl
                  ? {
                      backgroundImage: `url(${avatarUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      color: "transparent",
                    }
                  : undefined
              }
            >
              A
            </div>
            <div className="app-sidebar-account-meta">
              <div className="app-sidebar-account-name">{displayName}</div>
              <div className="app-sidebar-account-role">
                {user?.role ?? "ADMIN"}
              </div>
            </div>
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

import { NavLink, Link, useNavigate } from "react-router-dom";
import { INSPECTOR_NAV_LINKS } from "../../config/inspectorNav";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./SidebarLayout.css";

export default function InspectorLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-sidebar-layout">
      <aside className="app-sidebar app-sidebar-inspector" aria-label="Inspector menu">
        <div className="app-sidebar-brand">
          <Link to="/inspector" className="app-sidebar-logo">
            <img src={bikeLogo} alt="" />
            <span>BASAUYCLE</span>
          </Link>
        </div>
        <nav className="app-sidebar-nav">
          {INSPECTOR_NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end
              className={({ isActive }) => `app-sidebar-link ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-account">
          <div className="app-sidebar-account-name">{user?.fullName ?? user?.name ?? user?.email ?? "Inspector"}</div>
          <div className="app-sidebar-account-role">{user?.role ?? "INSPECTOR"}</div>
          {isAuthenticated?.() ? (
            <button type="button" className="app-sidebar-auth-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="app-sidebar-auth-btn app-sidebar-auth-link">
              Log in
            </Link>
          )}
        </div>
      </aside>
      <div className="app-sidebar-main">{children}</div>
    </div>
  );
}

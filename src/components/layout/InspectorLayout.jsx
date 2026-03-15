import { NavLink, Link, useNavigate } from "react-router-dom";
import { INSPECTOR_NAV_LINKS } from "../../config/inspectorNav";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import "./SidebarLayout.css";

<<<<<<< HEAD
function getInitials(name) {
  if (!name || typeof name !== "string") return "I";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0][0] || "I").toUpperCase();
}

=======
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
export default function InspectorLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

<<<<<<< HEAD
  const displayName =
    user?.fullName ?? user?.name ?? user?.email ?? "Inspector";

  return (
    <div className="app-sidebar-layout">
      <aside
        className="app-sidebar app-sidebar-inspector"
        aria-label="Inspector menu"
      >
=======
  return (
    <div className="app-sidebar-layout">
      <aside className="app-sidebar app-sidebar-inspector" aria-label="Inspector menu">
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
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
<<<<<<< HEAD
              className={({ isActive }) =>
                `app-sidebar-link ${isActive ? "active" : ""}`
              }
=======
              className={({ isActive }) => `app-sidebar-link ${isActive ? "active" : ""}`}
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-account">
<<<<<<< HEAD
          <div className="app-sidebar-account-avatar">
            {getInitials(displayName)}
          </div>
          <div className="app-sidebar-account-name">{displayName}</div>
          <div className="app-sidebar-account-role">
            {user?.role ?? "INSPECTOR"}
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
=======
          <div className="app-sidebar-account-name">{user?.fullName ?? user?.name ?? user?.email ?? "Inspector"}</div>
          <div className="app-sidebar-account-role">{user?.role ?? "INSPECTOR"}</div>
          {isAuthenticated?.() ? (
            <button type="button" className="app-sidebar-auth-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="app-sidebar-auth-btn app-sidebar-auth-link">
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
              Log in
            </Link>
          )}
        </div>
      </aside>
<<<<<<< HEAD
      <div className="app-sidebar-main">
        <div className="app-sidebar-body">{children}</div>
      </div>
=======
      <div className="app-sidebar-main">{children}</div>
>>>>>>> 0f4ae3c012d14e94779d74fd8aa67dae4df7d70b
    </div>
  );
}

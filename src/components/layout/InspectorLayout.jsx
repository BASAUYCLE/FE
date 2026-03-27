import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { INSPECTOR_NAV_LINKS } from "../../config/inspectorNav";
import bikeLogo from "../../assets/bike-logo.png";
import { useAuth } from "../../contexts/AuthContext";
import { getAvatarSrc } from "../../utils/avatar";
import { onSameRouteScrollToTop } from "../../utils/sameRouteScroll";
import "./SidebarLayout.css";

export default function InspectorLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const displayName =
    user?.fullName ?? user?.name ?? user?.email ?? "Inspector";
  const avatarUrl = getAvatarSrc(user);

  return (
    <div className="app-sidebar-layout">
      <aside
        className="app-sidebar app-sidebar-inspector"
        aria-label="Inspector menu"
      >
        <div className="app-sidebar-brand">
          <Link
            to="/inspector"
            className="app-sidebar-logo"
            onClick={(e) => onSameRouteScrollToTop(e, "/inspector", pathname)}
          >
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
              className={({ isActive }) =>
                `app-sidebar-link ${isActive ? "active" : ""}`
              }
              onClick={(e) => onSameRouteScrollToTop(e, link.href, pathname)}
            >
              {link.label}
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
              I
            </div>
            <div className="app-sidebar-account-meta">
              <div className="app-sidebar-account-name">{displayName}</div>
              <div className="app-sidebar-account-role">
                {user?.role ?? "INSPECTOR"}
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

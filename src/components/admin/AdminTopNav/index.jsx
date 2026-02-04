import { NavLink } from "react-router-dom";
import "./index.css";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/admin-dashboard" },
  { id: "users", label: "User Management", to: "/admin-users" },
  { id: "listings", label: "Listings", to: "/admin-listings" },
  { id: "categories", label: "Categories", to: "/admin-categories" },
  { id: "transactions", label: "Transactions", to: "/admin-transactions" },
  { id: "reports", label: "Reports", to: "/admin-reports" },
];

export default function AdminTopNav() {
  return (
    <div className="admin-top-nav">
      <div className="admin-top-nav-inner">
        <nav className="admin-top-nav-list" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `admin-top-nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

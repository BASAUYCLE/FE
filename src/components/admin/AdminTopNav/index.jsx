import { NavLink } from "react-router-dom";
import "./index.css";

// Liên kết menu admin – thêm hoặc sửa tại đây để cập nhật nav
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", to: "/admin-dashboard" },
  { id: "users", label: "User Management", to: "/admin-users" },
  { id: "listings", label: "Listings", to: "/admin-listings" },
  { id: "categories", label: "Categories", to: "/admin-categories" },
  { id: "transactions", label: "Transactions", to: "/admin-transactions" },
];

export default function AdminTopNav() {
  return (
    <div className="admin-top-nav">
      <div className="admin-top-nav-inner">
        <nav className="admin-top-nav-list" aria-label="Admin navigation">
          {NAV_ITEMS.map((navItem) => (
            <NavLink
              key={navItem.id}
              to={navItem.to}
              className={({ isActive }) =>
                isActive ? "admin-top-nav-link active" : "admin-top-nav-link"
              }
            >
              {navItem.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

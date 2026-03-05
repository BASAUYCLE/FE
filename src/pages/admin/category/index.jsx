import AdminLayout from "../../../components/layout/AdminLayout";
import { AlertTriangle } from "lucide-react";
import "./index.css";

export default function CategoryManagement() {
  return (
    <AdminLayout>
      <main className="category-management-page">
        <div className="category-management-shell">
          <section className="category-management-content">
            <div className="admin-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={20} color="#f59e0b" />
                <h2 style={{ margin: 0 }}>Category admin page unavailable</h2>
              </div>
              <p style={{ marginTop: 8, color: "#64748b" }}>
                Backend does not provide a category management endpoint for admin in this module. This page has no sample data.
              </p>
            </div>
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}

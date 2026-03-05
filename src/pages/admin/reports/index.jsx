import AdminLayout from "../../../components/layout/AdminLayout";
import { AlertTriangle } from "lucide-react";
import "./index.css";

export default function ReportsAnalytics() {
  return (
    <AdminLayout>
      <div className="reports-page">
        <div className="reports-body">
          <main className="reports-main">
            <div className="admin-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={20} color="#f59e0b" />
                <h2 style={{ margin: 0 }}>Reports page unavailable</h2>
              </div>
              <p style={{ marginTop: 8, color: "#64748b" }}>
                Backend does not provide an aggregate reports API for admin yet. This page has no sample data.
              </p>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

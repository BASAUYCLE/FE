import InspectorLayout from "../../../components/layout/InspectorLayout";
import { AlertTriangle } from "lucide-react";
import "./index.css";

export default function InspectorDisputes() {
  return (
    <InspectorLayout>
      <div className="inspector-page">
        <div className="inspector-dashboard">
          <div className="inspector-content disputes-support-content">
            <div className="admin-card" style={{ padding: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <AlertTriangle size={20} color="#f59e0b" />
                <h2 style={{ margin: 0 }}>Disputes feature unavailable</h2>
              </div>
              <p style={{ margin: 0, color: "#64748b" }}>
                Backend does not support this endpoint yet
                <strong> /inspection/disputes</strong>, nên trang này đã bỏ toàn
                bộ luồng giả để tránh dữ liệu sai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}

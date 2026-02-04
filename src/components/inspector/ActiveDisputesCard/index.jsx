import { Zap } from "lucide-react";

/**
 * Card "Active Disputes" dùng chung cho Dashboard và trang Disputes.
 * Data từ mockDisputes hoặc API, không hardcode.
 */
export default function ActiveDisputesCard({ disputes = [], onResolve, onViewAll }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div className="admin-card-title">
          <Zap size={18} style={{ marginRight: 8, verticalAlign: "middle", color: "#ef4444" }} />
          Active Disputes
        </div>
      </div>
      <div className="inspector-card-body">
        {disputes.length === 0 ? (
          <p className="inspector-card-empty">No active disputes.</p>
        ) : (
          disputes.map((d) => (
            <div key={d.id} className="inspector-list-item">
              <div>
                <div className="inspector-bike-name">{d.reportId}</div>
                <div className="admin-card-subtitle">{d.description}</div>
              </div>
              <button
                type="button"
                className="admin-outline-button"
                onClick={() => onResolve?.(d)}
              >
                Resolve
              </button>
            </div>
          ))
        )}
        {onViewAll && (
          <button
            type="button"
            className="admin-outline-button inspector-card-footer-btn"
            onClick={onViewAll}
          >
            View All Support Tickets
          </button>
        )}
      </div>
    </div>
  );
}

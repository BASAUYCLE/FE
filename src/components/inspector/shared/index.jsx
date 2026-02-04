/**
 * Thẻ thống kê dùng chung cho Admin Dashboard và Inspector Dashboard.
 * @param {{ label: string, value: string, trend?: string, trendType?: 'up' | 'warn', icon: React.ReactNode, tone: 'blue' | 'indigo' | 'green' | 'orange' | 'purple' }} props
 */
export default function StatCard({ label, value, trend, trendType, icon, tone = "blue" }) {
  return (
    <div className="admin-card admin-stat-card">
      <div className="admin-stat-top">
        <div className={`admin-stat-icon ${tone}`}>{icon}</div>
        {trend != null && (
          <span className={`admin-stat-trend ${trendType ?? "up"}`}>{trend}</span>
        )}
      </div>
      <div className="admin-stat-title">{label}</div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}

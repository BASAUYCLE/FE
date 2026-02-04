import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import StatCard from "../../../components/inspector/shared";
import InspectionQueueTable from "../../../components/inspector/InspectionQueueTable";
import {
  INSPECTOR_NAV_LINKS,
  getInspectorActiveLink,
} from "../../../config/inspectorNav";
import { mockInspections, mockDisputes } from "../../../data/inspections";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import "./index.css";

export default function InspectorDashboard() {
  const { pathname } = useLocation();

  const pendingCount = useMemo(
    () => mockInspections.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length,
    []
  );
  const completedTodayCount = 8;
  const disputesCount = mockDisputes.length;

  const stats = [
    {
      label: "Pending Inspections",
      value: String(pendingCount),
      trend: "+2 from yesterday",
      trendType: "up",
      icon: <FileCheck />,
      tone: "blue",
    },
    {
      label: "Completed Today",
      value: String(completedTodayCount),
      trend: "85% Complete",
      trendType: "up",
      icon: <CheckCircle2 />,
      tone: "green",
    },
    {
      label: "Active Disputes",
      value: String(disputesCount),
      trend: "Action Required",
      trendType: "warn",
      icon: <AlertTriangle />,
      tone: "orange",
    },
  ];

  return (
    <div className="inspector-page">
      <Header
        navLinks={INSPECTOR_NAV_LINKS}
        activeLink={getInspectorActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="inspector-dashboard">
        <div className="inspector-content">
          <header className="inspector-welcome">
            <p>Welcome back! You have {pendingCount} new inspections scheduled for today.</p>
          </header>

          <section className="admin-stats">
            {stats.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </section>

          <InspectionQueueTable inspections={mockInspections} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

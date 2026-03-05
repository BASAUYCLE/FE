import { useMemo, useState, useEffect, useCallback } from "react";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import StatCard from "../../../components/inspector/shared";
import InspectionQueueTable from "../../../components/inspector/InspectionQueueTable";
import { inspectionService } from "../../../services";
import {
  FileCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import "./index.css";

/** Map API /inspection/pending item to table row shape */
function mapPendingToInspection(item) {
  return {
    id: String(item.postId),
    postId: item.postId,
    bicycleName: item.bicycleName ?? "—",
    bicycleImage: item.thumbnailUrl ?? "",
    bicycleType: item.categoryName ?? "—",
    sellerName: item.sellerFullName ?? "—",
    sellerLocation: "",
    requestedDate: item.createdAt ?? "",
    status: "PENDING",
  };
}

export default function InspectorDashboard() {
  const [pendingList, setPendingList] = useState([]);
  const [disputesCount, setDisputesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inspectionService.getPendingInspections();
      const list = Array.isArray(res?.result) ? res.result : [];
      setPendingList(list.map(mapPendingToInspection));
    } catch {
      setPendingList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDisputes = useCallback(async () => {
    try {
      const res = await inspectionService.getDisputes();
      const list = Array.isArray(res?.result) ? res.result : [];
      setDisputesCount(list.length);
    } catch {
      setDisputesCount(0);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchDisputes();
  }, [fetchPending, fetchDisputes]);

  const pendingCount = useMemo(() => pendingList.length, [pendingList]);
  const completedTodayCount = 8;

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
    <InspectorLayout>
      <div className="inspector-page">
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

            <InspectionQueueTable
              inspections={pendingList}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}
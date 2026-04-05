import { useState, useEffect } from "react";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import InspectionQueueTable from "../../../components/inspector/InspectionQueueTable";
import { inspectionService } from "../../../services";
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

export default function InspectorDetailsList() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await inspectionService.getPendingInspections();
        const list = Array.isArray(res?.result) ? res.result : [];
        if (!cancelled) setInspections(list.map(mapPendingToInspection));
      } catch {
        if (!cancelled) setInspections([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <InspectorLayout>
      <div className="inspector-dashboard">
        <div className="inspector-content">
          <InspectionQueueTable inspections={inspections} loading={loading} />
        </div>
      </div>
    </InspectorLayout>
  );
}

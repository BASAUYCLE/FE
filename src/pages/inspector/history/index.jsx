import { useState, useEffect } from "react";
import { Alert } from "antd";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import InspectionQueueTable from "../../../components/inspector/InspectionQueueTable";
import { inspectionService } from "../../../services";
import "./index.css";

function normalizeHistoryList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.content)) return raw.content;
  return [];
}

/** BE LocalDateTime: chuỗi ISO hoặc mảng [y,m,d,h,mi,s,nano] (Jackson). */
function coerceDateValue(v) {
  if (v == null || v === "") return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = v;
    const ms = Number(nano) ? Math.floor(Number(nano) / 1e6) : 0;
    const date = new Date(y, mo - 1, d, h, mi, s, ms);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  return "";
}

/**
 * Map một phần tử API → hàng bảng (history).
 * Ưu tiên BE `InspectionReportResponse`: postTitle, result, createdAt, postStatus, overallCondition, conditionPercent.
 * Fallback: shape giống GET /inspection/pending (bicycleName, thumbnailUrl, categoryName, …).
 */
function mapHistoryRow(item) {
  const postId = item.postId ?? item.id;
  const rawResult = (
    item.result ??
    item.inspectionResult ??
    item.inspection?.result ??
    ""
  )
    .toString()
    .toUpperCase();
  const inspectionResult =
    rawResult === "FAIL" ? "FAIL" : rawResult === "PASS" ? "PASS" : rawResult;

  const reportCreated = coerceDateValue(item.createdAt);
  const inspectedAt =
    coerceDateValue(item.inspectedAt) ||
    coerceDateValue(item.inspectionCompletedAt) ||
    coerceDateValue(item.completedAt) ||
    coerceDateValue(item.updatedAt) ||
    reportCreated;

  const sellerFromApi =
    item.sellerFullName ?? item.sellerName ?? item.seller?.fullName ?? "";
  const hasSeller = String(sellerFromApi).trim().length > 0;
  const condBits = [];
  if (item.overallCondition)
    condBits.push(String(item.overallCondition).replace(/_/g, " "));
  if (item.conditionPercent != null && item.conditionPercent !== "")
    condBits.push(`${Number(item.conditionPercent).toFixed(0)}%`);
  const condLine = condBits.join(" · ");

  return {
    id: String(postId ?? ""),
    postId,
    bicycleName: item.postTitle ?? item.bicycleName ?? "—",
    bicycleImage: item.thumbnailUrl ?? item.bicycleImage ?? "",
    bicycleType:
      item.postStatus ?? item.categoryName ?? item.bicycleType ?? "—",
    sellerName: hasSeller ? sellerFromApi : condLine || "—",
    sellerLocation: hasSeller
      ? condLine || item.sellerLocation || ""
      : item.sellerLocation || "",
    requestedDate:
      coerceDateValue(item.requestedAt) || reportCreated || inspectedAt || "",
    inspectedAt: inspectedAt || reportCreated,
    inspectionResult:
      inspectionResult === "PASS" || inspectionResult === "FAIL"
        ? inspectionResult
        : inspectionResult || "",
  };
}

/**
 * Lịch sử kiểm định: GET `API_ENDPOINTS.INSPECTION.HISTORY` (mặc định /inspection/history).
 */
export default function InspectorHistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await inspectionService.getMyInspectionHistory();
        const list = normalizeHistoryList(res);
        if (!cancelled) setRows(list.map(mapHistoryRow));
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setLoadError(
            e?.message ??
              "Could not load inspection history. Confirm the backend exposes the inspector history route and that `INSPECTION.HISTORY` in api.js matches it.",
          );
        }
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
          <header className="inspector-history-intro">
            <h1 className="inspector-history-title">Inspection history</h1>
            <p className="inspector-history-desc">
              Listings you have already inspected (submitted scores). Open a row
              to review details.
            </p>
          </header>
          {loadError ? (
            <Alert type="warning" showIcon message={loadError} role="status" />
          ) : null}
          <InspectionQueueTable
            variant="history"
            inspections={rows}
            loading={loading}
          />
        </div>
      </div>
    </InspectorLayout>
  );
}

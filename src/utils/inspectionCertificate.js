import { INSPECTION_CRITERIA_ROWS } from "../constants/inspectionRubric";
import { OVERALL_CONDITION_LABEL_VI } from "../constants/postingStatus";

/**
 * @param {unknown} apiResponse — axios wrapper trả `response.data` (vd. `{ code, result }`)
 */
export function parseInspectionSubmitApiResult(apiResponse) {
  const r = apiResponse?.result ?? apiResponse?.data ?? apiResponse;
  if (!r || typeof r !== "object") return {};

  const num = (v) => {
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const rawResult =
    r.inspectionResult ??
    r.inspection_result ??
    r.passFail ??
    r.pass_fail ??
    r.result;
  let result = null;
  if (rawResult != null) {
    const u = String(rawResult).toUpperCase();
    if (u === "PASS" || u === "FAIL") result = u;
    else if (u.includes("PASS")) result = "PASS";
    else if (u.includes("FAIL")) result = "FAIL";
  }

  return {
    conditionPercent: num(r.conditionPercent ?? r.condition_percent),
    overallCondition: r.overallCondition ?? r.overall_condition ?? null,
    result,
    inspectedAt:
      r.inspectedAt ??
      r.inspected_at ??
      r.createdAt ??
      r.created_at ??
      null,
  };
}

function formatInspectedAtVi(isoOrDate) {
  if (!isoOrDate) {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
  }
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
  }
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

function inspectionMetaLine(report) {
  if (!report) return "—";
  const parts = [
    report.brandName,
    report.categoryName,
    report.modelYear,
    report.size !== "—" ? `Size ${report.size}` : null,
  ].filter((p) => p != null && p !== "" && p !== "—");
  return parts.length ? parts.join(" · ") : "—";
}

/**
 * Snapshot cho modal biên bản sau khi submit thành công.
 */
export function buildCertificateSnapshot({
  apiResponse,
  preview,
  scores,
  notes,
  report,
  inspectorDisplayName,
  inspectorEmail,
}) {
  const server = parseInspectionSubmitApiResult(apiResponse);
  const pct =
    server.conditionPercent != null && !Number.isNaN(server.conditionPercent)
      ? server.conditionPercent
      : preview?.conditionPercent ?? null;

  const rawOverall = server.overallCondition ?? preview?.overallCondition;
  const overallKey =
    typeof rawOverall === "string" ? rawOverall.toUpperCase() : rawOverall;
  const overallLabelVi =
    (overallKey && OVERALL_CONDITION_LABEL_VI[overallKey]) ??
    (typeof rawOverall === "string" && rawOverall.trim() !== ""
      ? rawOverall
      : "—");

  const result =
    server.result === "PASS" || server.result === "FAIL"
      ? server.result
      : preview?.result ?? "—";

  const passFailVi =
    result === "PASS" ? "ĐẠT" : result === "FAIL" ? "KHÔNG ĐẠT" : "—";

  const scoreRows = INSPECTION_CRITERIA_ROWS.map((row) => ({
    labelVi: row.labelVi,
    score: scores[row.key],
  }));

  return {
    reportId: report?.reportId ?? "—",
    postId: report?.id ?? "—",
    bicycleName: report?.bicycleName ?? "—",
    listingMetaLine: inspectionMetaLine(report),
    posterName: report?.owner ?? "—",
    inspectorName: inspectorDisplayName ?? "—",
    inspectorEmail: inspectorEmail ?? null,
    inspectedAtFormatted: formatInspectedAtVi(server.inspectedAt),
    conditionPercent: pct,
    overallLabelVi,
    result,
    passFailVi,
    notes: (notes ?? "").trim() || "—",
    scoreRows,
  };
}

/**
 * Chuẩn hóa payload báo cáo kiểm định từ API (dùng ProductPreviewModal, ProductDetail, …).
 * BE: conditionPercent + 6 điểm (0/3/7/10); legacy: result / overallCondition / checklist.
 */

import {
  calculateConditionPercent,
  validateInspectionScores,
  INSPECTION_SCORE_KEYS,
} from "./inspectionScoring";

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s !== "") return s;
  }
  return null;
}

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
/** Gỡ enum JSON (Java) thành primitive hiển thị được */
function unwrapEnumish(v) {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
    return v;
  }
  if (typeof v === "object" && v.name != null) return String(v.name);
  return null;
}

export function normalizeInspection(row) {
  if (!row || typeof row !== "object") return null;

  const cpRaw =
    row.conditionPercent ?? row.condition_percent ?? row.condition_pct ?? null;
  let conditionPercent = null;
  if (typeof cpRaw === "number" && Number.isFinite(cpRaw)) {
    conditionPercent = cpRaw;
  } else if (cpRaw != null && String(cpRaw).trim() !== "") {
    const n = Number(cpRaw);
    if (Number.isFinite(n)) conditionPercent = n;
  }

  const nested =
    row.scores && typeof row.scores === "object" && !Array.isArray(row.scores)
      ? row.scores
      : {};
  const scores = {};
  for (const key of INSPECTION_SCORE_KEYS) {
    const snakeKey = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    const v = row[key] ?? nested[key] ?? row[snakeKey] ?? nested[snakeKey];
    if (v == null || v === "") continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) scores[key] = n;
  }

  const inspObj =
    row.inspector && typeof row.inspector === "object" && !Array.isArray(row.inspector)
      ? row.inspector
      : null;
  const sellerObj =
    row.seller && typeof row.seller === "object" && !Array.isArray(row.seller)
      ? row.seller
      : null;
  const postObj =
    row.post && typeof row.post === "object" && !Array.isArray(row.post)
      ? row.post
      : null;
  const postSellerObj =
    postObj?.seller &&
    typeof postObj.seller === "object" &&
    !Array.isArray(postObj.seller)
      ? postObj.seller
      : null;
  const postOwnerObj =
    postObj?.owner &&
    typeof postObj.owner === "object" &&
    !Array.isArray(postObj.owner)
      ? postObj.owner
      : null;

  return {
    reportId:
      row.reportId ??
      row.report_id ??
      row.inspectionReportId ??
      row.inspection_report_id ??
      null,
    posterName: firstNonEmpty(
      row.posterName,
      row.poster_name,
      row.sellerFullName,
      row.seller_full_name,
      row.sellerName,
      row.seller_name,
      row.memberName,
      row.member_name,
      row.ownerName,
      row.owner_name,
      typeof row.seller === "string" ? row.seller : null,
      sellerObj?.fullName,
      sellerObj?.full_name,
      sellerObj?.name,
      sellerObj?.email,
      postObj?.sellerFullName,
      postObj?.seller_full_name,
      postObj?.sellerName,
      postObj?.seller_name,
      typeof postObj?.seller === "string" ? postObj.seller : null,
      postSellerObj?.fullName,
      postSellerObj?.full_name,
      postSellerObj?.name,
      postSellerObj?.email,
      postObj?.ownerFullName,
      postObj?.owner_full_name,
      postObj?.ownerName,
      typeof postObj?.owner === "string" ? postObj.owner : null,
      postOwnerObj?.fullName,
      postOwnerObj?.full_name,
      postOwnerObj?.name,
      postObj?.member?.fullName,
      postObj?.member?.name,
      postObj?.user?.fullName,
      postObj?.user?.name,
    ),
    inspectorName: firstNonEmpty(
      row.inspectorName,
      row.inspector_name,
      row.inspectorFullName,
      row.inspector_full_name,
      inspObj?.fullName,
      inspObj?.name,
      typeof row.inspector === "string" ? row.inspector : null,
      row.inspectedByName,
      row.inspected_by_name,
      row.inspectedBy,
      row.inspected_by,
      row.reviewerName,
      row.reviewer_name,
      row.reviewer,
    ),
    inspectorEmail: firstNonEmpty(
      row.inspectorEmail,
      row.inspector_email,
      inspObj?.email,
      row.reviewerEmail,
      row.reviewer_email,
      row.inspectedByEmail,
      row.inspected_by_email,
    ),
    notes:
      row.notes ??
      row.inspectorNotes ??
      row.inspector_notes ??
      row.inspectionNotes ??
      row.inspection_notes ??
      row.note ??
      row.remark ??
      row.comment ??
      null,
    inspectedAt:
      row.inspectedAt ??
      row.inspected_at ??
      row.completedAt ??
      row.completed_at ??
      row.updatedAt ??
      row.updated_at ??
      row.createdAt ??
      row.created_at ??
      null,
    result: unwrapEnumish(
      row.result ?? row.inspectionResult ?? row.inspection_result ?? null,
    ),
    condition: unwrapEnumish(
      row.overallCondition ??
        row.overall_condition ??
        row.condition ??
        null,
    ),
    conditionPercent,
    scores: Object.keys(scores).length > 0 ? scores : null,
    checklist: row.checklist ?? null,
  };
}

/**
 * @param {ReturnType<typeof normalizeInspection>} ins
 */
export function inspectionResponseHasUsableData(ins) {
  if (!ins) return false;
  if (ins.result != null && ins.result !== "") return true;
  if (ins.condition != null && ins.condition !== "") return true;
  if (typeof ins.conditionPercent === "number") return true;
  if (ins.scores && Object.keys(ins.scores).length > 0) return true;
  if (Array.isArray(ins.checklist) && ins.checklist.length > 0) return true;
  return false;
}

/**
 * % hiển thị: 1) conditionPercent BE 2) tính từ 6 điểm 3) checklist legacy 4) ước lượng PASS/FAIL + band
 * @param {ReturnType<typeof normalizeInspection>} ins
 */
export function calcScore(ins) {
  if (!ins) return null;
  const { result, condition, checklist, conditionPercent, scores } = ins;

  if (
    typeof conditionPercent === "number" &&
    Number.isFinite(conditionPercent)
  ) {
    return Math.round(conditionPercent * 10) / 10;
  }

  if (scores && validateInspectionScores(scores).valid) {
    const pct = calculateConditionPercent(scores);
    return Number.isNaN(pct) ? null : Math.round(pct * 10) / 10;
  }

  if (Array.isArray(checklist) && checklist.length > 0) {
    const items = checklist.flatMap((g) => g.items ?? []);
    const valid = items.filter((i) => i?.status && i.status !== "n/a");
    if (valid.length > 0) {
      const score = valid.reduce((s, i) => {
        if (i.status === "good") return s + 1;
        if (i.status === "fair") return s + 0.6;
        return s;
      }, 0);
      return Math.round((score / valid.length) * 100);
    }
  }

  if (result === "FAIL") return 0;
  const c = (condition ?? "").toLowerCase();
  if (c === "excellent") return 95;
  if (c === "good") return 90;
  if (c === "fair") return 70;
  if (c === "poor") return 50;
  if (result === "PASS") return 80;
  return null;
}

const POST_INSPECTION_NESTED_KEYS = [
  "inspectionReport",
  "inspection_report",
  "inspectionReportResponse",
  "inspection_report_response",
  "latestInspection",
  "latest_inspection",
  "lastInspection",
  "last_inspection",
  "inspection",
  "inspectionData",
  "inspection_data",
  "bicycleInspection",
  "bicycle_inspection",
];

/**
 * BE có thể nhúng báo cáo trong GET /posts/{id} (buyer không gọi được /inspection/...).
 * @param {Record<string, unknown> | null | undefined} row
 */
export function extractInspectionFromPostPayload(row) {
  if (!row || typeof row !== "object") return null;

  for (const key of POST_INSPECTION_NESTED_KEYS) {
    const v = row[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const ins = normalizeInspection(v);
      if (inspectionResponseHasUsableData(ins)) return ins;
    }
  }

  const nestedPost = row.post ?? row.bicyclePost ?? row.bicycle_post;
  if (
    nestedPost &&
    typeof nestedPost === "object" &&
    nestedPost !== row
  ) {
    for (const key of POST_INSPECTION_NESTED_KEYS) {
      const v = nestedPost[key];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        const ins = normalizeInspection(v);
        if (inspectionResponseHasUsableData(ins)) return ins;
      }
    }
  }

  const flat = normalizeInspection(row);
  if (inspectionResponseHasUsableData(flat)) return flat;

  return null;
}

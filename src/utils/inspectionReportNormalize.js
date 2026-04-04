/**
 * Chuẩn hóa payload báo cáo kiểm định từ API (dùng ProductPreviewModal, ProductDetail, …).
 * BE: conditionPercent + 6 điểm (0/3/7/10); legacy: result / overallCondition / checklist.
 */

import {
  calculateConditionPercent,
  validateInspectionScores,
  INSPECTION_SCORE_KEYS,
} from "./inspectionScoring";

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
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
    const v = row[key] ?? nested[key];
    if (v == null || v === "") continue;
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) scores[key] = n;
  }

  return {
    reportId:
      row.reportId ??
      row.report_id ??
      row.inspectionReportId ??
      row.inspection_report_id ??
      null,
    inspectedAt:
      row.inspectedAt ??
      row.inspected_at ??
      row.completedAt ??
      row.completed_at ??
      row.updatedAt ??
      row.updated_at ??
      null,
    result: row.result ?? row.inspectionResult ?? null,
    condition: row.overallCondition ?? row.condition ?? null,
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

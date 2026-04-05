/**
 * Tải báo cáo kiểm định cho một post: thử endpoint theo postId, rồi fallback list admin
 * (BE bike_platform thường chỉ có GET /admin/inspection/reports).
 */

import axiosInstance from "../services/axiosConfig";
import adminService from "../services/adminService";
import {
  inspectionResponseHasUsableData,
  normalizeInspection,
} from "./inspectionReportNormalize";

function perPostInspectionUrls(postId) {
  const id = encodeURIComponent(String(postId));
  return [
    `/inspection/${id}/report`,
    `/admin/inspection/${id}`,
    `/inspection/${id}`,
  ];
}

/** BE trả list trong result / data / content / reports. */
export function parseInspectionReportsList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.reports)) return raw.reports;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export function reportRowPostId(row) {
  return (
    row?.postId ??
    row?.bicyclePostId ??
    row?.post?.postId ??
    row?.post?.id ??
    null
  );
}

function reportRowTimestamp(row) {
  const v = row?.createdAt ?? row?.inspectedAt ?? row?.completedAt;
  if (v == null || v === "") return 0;
  if (Array.isArray(v) && v.length >= 3) {
    const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = v;
    const ms = Number(nano) ? Math.floor(Number(nano) / 1e6) : 0;
    const date = new Date(y, mo - 1, d, h, mi, s, ms);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Bản ghi mới nhất cho post (theo createdAt / inspectedAt). */
export function pickLatestReportRowForPost(rows, targetPostId) {
  if (!Array.isArray(rows) || targetPostId == null) return null;
  const key = String(targetPostId);
  let best = null;
  let bestTs = -Infinity;
  for (const row of rows) {
    const pid = reportRowPostId(row);
    if (pid == null || String(pid) !== key) continue;
    const ts = reportRowTimestamp(row);
    if (!best || ts >= bestTs) {
      best = row;
      bestTs = ts;
    }
  }
  return best;
}

/** @param {string|number} postId */
export async function fetchInspectionReportForPost(postId) {
  if (postId == null || postId === "") return null;

  for (const url of perPostInspectionUrls(postId)) {
    try {
      const res = await axiosInstance.get(url);
      const raw = res?.result ?? res?.data ?? res;
      const ins = normalizeInspection(raw);
      if (inspectionResponseHasUsableData(ins)) return ins;
    } catch {
      /* thử URL tiếp */
    }
  }

  try {
    const res = await adminService.getInspectionReports();
    const rows = parseInspectionReportsList(res);
    const row = pickLatestReportRowForPost(rows, postId);
    if (row) {
      const ins = normalizeInspection(row);
      if (inspectionResponseHasUsableData(ins)) return ins;
    }
  } catch {
    /* 403 nếu không phải admin — bình thường */
  }

  return null;
}

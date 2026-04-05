/**
 * Tải báo cáo kiểm định cho một post:
 * 1) GET theo postId: /inspection/:id/report, /inspection/:id; ADMIN thêm /admin/inspection/:id
 * 2) Chỉ khi user là INSPECTOR: GET /inspection/reports (lọc theo post)
 * 3) Chỉ khi user là ADMIN: GET /admin/inspection/reports
 */

import axiosInstance from "../services/axiosConfig";
import { API_ENDPOINTS } from "../config/api";
import { STORAGE_KEYS } from "../constants/storageKeys";
import {
  inspectionResponseHasUsableData,
  normalizeInspection,
} from "./inspectionReportNormalize";

/** Không gồm /admin/inspection/:id — endpoint đó chỉ dành cho ADMIN, seller/buyer sẽ luôn 403. */
function perPostInspectionUrls(postId, { isAdmin } = { isAdmin: false }) {
  const id = encodeURIComponent(String(postId));
  if (isAdmin) {
    return [
      `/inspection/${id}/report`,
      `/admin/inspection/${id}`,
      `/inspection/${id}`,
    ];
  }
  return [`/inspection/${id}/report`, `/inspection/${id}`];
}

/**
 * Tránh gọi GET /inspection/reports và GET /admin/inspection/reports khi user không
 * có quyền — mỗi lần mở modal/detail sẽ tạo hàng loạt 403 và đầy console/Network.
 */
function inspectionListFetchRoles() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return { isAdmin: false, isInspector: false };
    const u = JSON.parse(raw);
    const r = String(
      u?.role ?? u?.userRole ?? u?.user_role ?? "",
    ).toUpperCase();
    return { isAdmin: r === "ADMIN", isInspector: r === "INSPECTOR" };
  } catch {
    return { isAdmin: false, isInspector: false };
  }
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
  const v =
    row?.createdAt ??
    row?.inspectedAt ??
    row?.completedAt ??
    row?.updatedAt;
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

/**
 * Lấy báo cáo từ GET /admin/inspection/reports — thử filter theo post + page size lớn
 * để không chỉ dính trang đầu (mất bản ghi mới).
 */
async function fetchInspectionFromAdminList(postId) {
  const url = API_ENDPOINTS.ADMIN.INSPECTION_REPORTS;
  const bust = { _: Date.now() };
  const paramSets = [
    { ...bust, postId },
    { ...bust, bicyclePostId: postId },
    { ...bust, post_id: postId },
    { ...bust, page: 0, size: 500 },
    { ...bust, page: 0, size: 200 },
    { ...bust, page: 0, size: 100 },
    { ...bust },
  ];

  for (const params of paramSets) {
    try {
      const res = await axiosInstance.get(url, { params });
      const rows = parseInspectionReportsList(res);
      const row = pickLatestReportRowForPost(rows, postId);
      if (row) {
        const ins = normalizeInspection(row);
        if (inspectionResponseHasUsableData(ins)) return ins;
      }
    } catch {
      /* thử bộ param tiếp */
    }
  }
  return null;
}

/**
 * Inspector: GET /inspection/reports — lọc bản ghi theo postId (không cần quyền admin).
 */
async function fetchInspectionFromInspectorReportsList(postId) {
  const url = API_ENDPOINTS.INSPECTION.HISTORY;
  const bust = { _: Date.now() };
  const paramSets = [
    { ...bust, postId },
    { ...bust, bicyclePostId: postId },
    { ...bust, post_id: postId },
    { ...bust },
  ];

  for (const params of paramSets) {
    try {
      const res = await axiosInstance.get(url, { params });
      const rows = parseInspectionReportsList(res);
      const row = pickLatestReportRowForPost(rows, postId);
      if (row) {
        const ins = normalizeInspection(row);
        if (inspectionResponseHasUsableData(ins)) return ins;
      }
    } catch {
      /* thử param tiếp hoặc 403 nếu không phải inspector */
    }
  }
  return null;
}

/** @param {string|number} postId */
export async function fetchInspectionReportForPost(postId) {
  if (postId == null || postId === "") return null;

  const { isAdmin, isInspector } = inspectionListFetchRoles();

  for (const url of perPostInspectionUrls(postId, { isAdmin })) {
    try {
      const res = await axiosInstance.get(url);
      const raw = res?.result ?? res?.data ?? res;
      const ins = normalizeInspection(raw);
      if (inspectionResponseHasUsableData(ins)) return ins;
    } catch {
      /* thử URL tiếp */
    }
  }

  if (isInspector) {
    try {
      const fromInspector =
        await fetchInspectionFromInspectorReportsList(postId);
      if (fromInspector) return fromInspector;
    } catch {
      /* ignore */
    }
  }

  if (isAdmin) {
    try {
      const fromList = await fetchInspectionFromAdminList(postId);
      if (fromList) return fromList;
    } catch {
      /* ignore */
    }
  }

  return null;
}

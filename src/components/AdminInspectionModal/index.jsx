import { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import { ClipboardList } from "lucide-react";
import axiosInstance from "../../services/axiosConfig";
import adminService from "../../services/adminService";
import {
  calcScore,
  inspectionResponseHasUsableData,
  normalizeInspection,
} from "../../utils/inspectionReportNormalize";
import { OVERALL_CONDITION_LABEL } from "../../constants/postingStatus";
import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_CRITICAL_CRITERIA_KEYS,
  INSPECTION_SCORE_OPTIONS,
} from "../../constants/inspectionRubric";
import "./index.css";

function inspectionScoreOption(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return INSPECTION_SCORE_OPTIONS.find((o) => o.value === n) ?? null;
}

/** 0 | 3 | 7 | 10 — dùng data-score / BEM modifier */
function scoreTierClass(n) {
  if (n === 10) return "admin-inspection-modal__score-pill--10";
  if (n === 7) return "admin-inspection-modal__score-pill--7";
  if (n === 3) return "admin-inspection-modal__score-pill--3";
  if (n === 0) return "admin-inspection-modal__score-pill--0";
  return "admin-inspection-modal__score-pill--na";
}

function formatInspectedAt(raw) {
  if (raw == null || raw === "") return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof raw === "string" ? raw : null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Màu cung vòng condition: %% thấp → nhạt, %% cao → đậm (hue ~ teal brand #00ccad).
 * @param {number} pct 0–100
 */
function conditionGaugeArcColor(pct) {
  const t = Math.min(100, Math.max(0, pct)) / 100;
  const eased = t * t;
  const hue = 172;
  const sat = 18 + 82 * eased;
  const light = 92 - 52 * eased;
  return `hsl(${hue} ${sat}% ${light}%)`;
}

/** Giống trang admin Inspection history — BE trả list trong result/data/content. */
function parseInspectionReportsList(res) {
  const raw = res?.result ?? res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.reports)) return raw.reports;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

function reportRowPostId(row) {
  return (
    row?.postId ??
    row?.bicyclePostId ??
    row?.post?.postId ??
    row?.post?.id ??
    null
  );
}

/** Bản ghi mới nhất cho post (theo createdAt / inspectedAt). */
function pickLatestReportRowForPost(rows, targetPostId) {
  const key = String(targetPostId);
  let best = null;
  let bestTs = -Infinity;
  for (const row of rows) {
    const pid = reportRowPostId(row);
    if (pid == null || String(pid) !== key) continue;
    const ts = new Date(row?.createdAt ?? row?.inspectedAt ?? 0).getTime();
    if (!best || ts >= bestTs) {
      best = row;
      bestTs = ts;
    }
  }
  return best;
}

/**
 * Admin: xem Score Rubric (6 tiêu chí) inspector đã nộp — cùng API với ProductPreviewModal.
 */
export default function AdminInspectionModal({
  postId,
  listingTitle,
  open,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    if (!open || postId == null) {
      queueMicrotask(() => setInspection(null));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setInspection(null);
    });
    (async () => {
      let found = null;
      try {
        for (const url of [
          `/inspection/${postId}/report`,
          `/admin/inspection/${postId}`,
          `/inspection/${postId}`,
        ]) {
          if (cancelled) return;
          try {
            const res = await axiosInstance.get(url);
            const raw = res?.result ?? res?.data ?? res;
            const ins = normalizeInspection(raw);
            if (inspectionResponseHasUsableData(ins)) {
              found = ins;
              break;
            }
          } catch {
            /* try next */
          }
        }
        /* BE thường chỉ trả báo cáo admin qua GET /admin/inspection/reports (list). */
        if (!found && !cancelled) {
          try {
            const res = await adminService.getInspectionReports();
            const rows = parseInspectionReportsList(res);
            const row = pickLatestReportRowForPost(rows, postId);
            if (row) {
              const ins = normalizeInspection(row);
              if (inspectionResponseHasUsableData(ins)) found = ins;
            }
          } catch {
            /* ignore */
          }
        }
        if (!cancelled) setInspection(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  const scorePct = inspection ? calcScore(inspection) : null;
  const notesText =
    inspection?.notes != null && String(inspection.notes).trim() !== ""
      ? String(inspection.notes).trim()
      : null;

  const condKey = String(inspection?.condition ?? "").toUpperCase();
  const condLabel =
    inspection &&
    (OVERALL_CONDITION_LABEL[condKey] ?? inspection.condition ?? null);

  const resultUpper =
    inspection?.result != null && String(inspection.result).trim() !== ""
      ? String(inspection.result).toUpperCase()
      : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(720px, 94vw)"
      centered
      destroyOnHidden
      className="admin-inspection-modal"
      title={
        <div className="admin-inspection-modal__title">
          <span className="admin-inspection-modal__title-kicker">
            Inspection report
          </span>
          <span className="admin-inspection-modal__title-main">
            Score rubric
          </span>
          {listingTitle ? (
            <span className="admin-inspection-modal__title-sub">
              {listingTitle}
            </span>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <div className="admin-inspection-modal__loading">
          <Spin size="large" />
        </div>
      ) : !inspection || !inspectionResponseHasUsableData(inspection) ? (
        <div className="admin-inspection-modal__empty-state">
          <div className="admin-inspection-modal__empty-icon" aria-hidden>
            <ClipboardList strokeWidth={1.5} />
          </div>
          <p className="admin-inspection-modal__empty-title">
            No rubric submitted yet
          </p>
          <p className="admin-inspection-modal__empty-desc">
            Results appear here after an inspector submits all six criteria
            (scores 0, 3, 7, or 10) and notes for this listing.
          </p>
        </div>
      ) : (
        <div className="admin-inspection-modal__body">
          <div className="admin-inspection-modal__hero">
            {resultUpper || typeof scorePct === "number" ? (
              <div className="admin-inspection-modal__hero-top">
                {resultUpper ? (
                  <span
                    className={`admin-inspection-modal__badge ${(() => {
                      if (resultUpper === "PASS")
                        return "admin-inspection-modal__badge--pass";
                      if (resultUpper === "FAIL")
                        return "admin-inspection-modal__badge--fail";
                      return "admin-inspection-modal__badge--neutral";
                    })()}`}
                  >
                    {resultUpper}
                  </span>
                ) : null}
                {typeof scorePct === "number" ? (
                  <div
                    className="admin-inspection-modal__hero-gauge"
                    style={{
                      "--aim-pct": `${Math.min(100, Math.max(0, scorePct))}`,
                      "--aim-gauge-fill": conditionGaugeArcColor(scorePct),
                    }}
                    aria-label={`Condition score ${scorePct} percent`}
                  >
                    <div className="admin-inspection-modal__hero-gauge-inner">
                      <span className="admin-inspection-modal__hero-gauge-value">
                        {scorePct}
                        <span className="admin-inspection-modal__hero-gauge-unit">
                          %
                        </span>
                      </span>
                      <span className="admin-inspection-modal__hero-gauge-label">
                        Condition
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="admin-inspection-modal__hero-chips">
              <span className="admin-inspection-modal__chip">
                {inspection.reportId != null
                  ? `Report #${inspection.reportId}`
                  : `Post #${postId}`}
              </span>
              {formatInspectedAt(inspection.inspectedAt) ? (
                <span className="admin-inspection-modal__chip admin-inspection-modal__chip--muted">
                  {formatInspectedAt(inspection.inspectedAt)}
                </span>
              ) : null}
              {condLabel ? (
                <span className="admin-inspection-modal__chip admin-inspection-modal__chip--accent">
                  {condLabel}
                </span>
              ) : null}
            </div>
          </div>

          {inspection.scores ? (
            <section
              className="admin-inspection-modal__section"
              aria-labelledby="admin-inspection-rubric-heading"
            >
              <div className="admin-inspection-modal__section-head">
                <h3
                  id="admin-inspection-rubric-heading"
                  className="admin-inspection-modal__section-title"
                >
                  Six criteria
                </h3>
                <p className="admin-inspection-modal__section-desc">
                  Same scale as the inspector form. Server derives pass/fail and
                  overall % from these scores.
                </p>
              </div>
              <ul className="admin-inspection-modal__rubric-list">
                {INSPECTION_CRITERIA_ROWS.map((row) => {
                  const s = inspection.scores[row.key];
                  if (s == null) return null;
                  const n = Number(s);
                  const opt = inspectionScoreOption(s);
                  const tier =
                    Number.isFinite(n) && [0, 3, 7, 10].includes(n)
                      ? n
                      : "na";
                  return (
                    <li
                      key={row.key}
                      className="admin-inspection-modal__rubric-card"
                      data-score={tier}
                    >
                      <div className="admin-inspection-modal__rubric-card-top">
                        <div className="admin-inspection-modal__rubric-card-title-block">
                          <span className="admin-inspection-modal__criterion-name">
                            {row.labelEn}
                          </span>
                          {INSPECTION_CRITICAL_CRITERIA_KEYS.has(row.key) ? (
                            <span className="admin-inspection-modal__critical-chip">
                              Critical
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={`admin-inspection-modal__score-pill ${scoreTierClass(n)}`}
                        >
                          {Number.isFinite(n) ? n : "—"}
                        </span>
                      </div>
                      {opt?.hintEn ? (
                        <p className="admin-inspection-modal__rubric-rating-desc">
                          {opt.hintEn}
                        </p>
                      ) : null}
                      {row.hintEn ? (
                        <p className="admin-inspection-modal__criterion-hint">
                          {row.hintEn}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {notesText ? (
            <section
              className="admin-inspection-modal__notes-block"
              aria-labelledby="admin-inspection-notes-heading"
            >
              <h3
                id="admin-inspection-notes-heading"
                className="admin-inspection-modal__notes-heading"
              >
                Inspector notes
              </h3>
              <div className="admin-inspection-modal__notes-panel">
                <p className="admin-inspection-modal__notes-text">{notesText}</p>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

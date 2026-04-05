import { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import axiosInstance from "../../services/axiosConfig";
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

function inspectionScoreLabelEn(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const opt = INSPECTION_SCORE_OPTIONS.find((o) => o.value === n);
  return opt?.labelEn ?? String(n);
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
 * Admin: read-only inspection report for a post (same API paths as ProductPreviewModal).
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
              if (!cancelled) setInspection(ins);
              break;
            }
          } catch {
            /* try next */
          }
        }
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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(560px, 94vw)"
      destroyOnHidden
      className="admin-inspection-modal"
      title={
        <div className="admin-inspection-modal__title">
          <span className="admin-inspection-modal__title-main">
            Inspection report
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
          <Spin />
        </div>
      ) : !inspection || !inspectionResponseHasUsableData(inspection) ? (
        <p className="admin-inspection-modal__empty">
          No inspection data for this listing yet. Reports appear after an
          inspector submits scores (post moves past admin-approved / pending
          inspection).
        </p>
      ) : (
        <div className="admin-inspection-modal__body">
          <div className="admin-inspection-modal__meta">
            {inspection.reportId != null ? (
              <span className="admin-inspection-modal__report-id">
                Report #{inspection.reportId}
              </span>
            ) : (
              <span className="admin-inspection-modal__report-id">
                Post #{postId}
              </span>
            )}
            {formatInspectedAt(inspection.inspectedAt) ? (
              <span className="admin-inspection-modal__date">
                {formatInspectedAt(inspection.inspectedAt)}
              </span>
            ) : null}
          </div>

          <div className="admin-inspection-modal__result-row">
            {inspection.result != null && String(inspection.result) !== "" ? (
              <span
                className={`admin-inspection-modal__badge ${(() => {
                  const r = String(inspection.result).toUpperCase();
                  if (r === "PASS") return "admin-inspection-modal__badge--pass";
                  if (r === "FAIL") return "admin-inspection-modal__badge--fail";
                  return "admin-inspection-modal__badge--neutral";
                })()}`}
              >
                {String(inspection.result).toUpperCase()}
              </span>
            ) : null}
            {typeof scorePct === "number" ? (
              <span className="admin-inspection-modal__score">
                Condition score: <strong>{scorePct}%</strong>
              </span>
            ) : null}
          </div>

          {condLabel ? (
            <div className="admin-inspection-modal__row">
              <span className="admin-inspection-modal__label">
                Overall band
              </span>
              <span className="admin-inspection-modal__value">{condLabel}</span>
            </div>
          ) : null}

          {inspection.scores ? (
            <div className="admin-inspection-modal__scores">
              <div className="admin-inspection-modal__scores-title">
                Rubric scores
              </div>
              {INSPECTION_CRITERIA_ROWS.map((row) => {
                const s = inspection.scores[row.key];
                if (s == null) return null;
                return (
                  <div key={row.key} className="admin-inspection-modal__score-line">
                    <span className="admin-inspection-modal__criterion">
                      {row.labelEn}
                      {INSPECTION_CRITICAL_CRITERIA_KEYS.has(row.key) ? (
                        <span className="admin-inspection-modal__critical-tag">
                          (critical)
                        </span>
                      ) : null}
                    </span>
                    <span className="admin-inspection-modal__score-val">
                      {s} — {inspectionScoreLabelEn(s)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {notesText ? (
            <div className="admin-inspection-modal__notes-block">
              <div className="admin-inspection-modal__notes-title">
                Inspector notes
              </div>
              <p className="admin-inspection-modal__notes-text">{notesText}</p>
            </div>
          ) : null}
        </div>
      )}
    </Modal>
  );
}

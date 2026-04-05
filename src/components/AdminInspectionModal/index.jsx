import { useState, useEffect } from "react";
import { Modal, Spin } from "antd";
import { ClipboardList } from "lucide-react";
import {
  calcScore,
  inspectionResponseHasUsableData,
} from "../../utils/inspectionReportNormalize";
import { fetchInspectionReportForPost } from "../../utils/inspectionReportFetch";
import {
  OVERALL_CONDITION_LABEL,
  OVERALL_CONDITION_LABEL_VI,
} from "../../constants/postingStatus";
import { overallConditionKeyFromInspectionScore } from "../../utils/inspectionScoring";
import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_CRITICAL_CRITERIA_KEYS,
  formatInspectorScoreRubricLineEn,
} from "../../constants/inspectionRubric";
import "./index.css";

function formatInspectedAtEn(raw) {
  if (raw == null || raw === "") return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof raw === "string" ? raw : null;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatInspectedAtVi(raw) {
  if (raw == null || raw === "") return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof raw === "string" ? raw : null;
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(d);
  } catch {
    return formatInspectedAtEn(raw);
  }
}

/**
 * Admin: same API + rubric copy as inspector (per-criterion scores → INSPECTION_SCORE_OPTIONS).
 */
export default function AdminInspectionModal({
  postId,
  listingTitle,
  /** Subline: brand · category · year · size */
  listingMeta,
  posterHint,
  /** `public` = biên bản tiếng Việt (trang chi tiết xe); `staff` = admin/inspector */
  variant = "staff",
  /** Dữ liệu đã tải sẵn (vd. ProductDetail) — hiển thị ngay, vẫn làm mới từ API khi mở */
  prefetchedInspection = null,
  open,
  onClose,
}) {
  const isPublic = variant === "public";
  const [loading, setLoading] = useState(false);
  const [inspection, setInspection] = useState(null);

  useEffect(() => {
    if (!open || postId == null) {
      setInspection(null);
      return;
    }
    const pre =
      prefetchedInspection &&
      inspectionResponseHasUsableData(prefetchedInspection)
        ? prefetchedInspection
        : null;
    let cancelled = false;
    setInspection(pre);
    setLoading(!pre);
    (async () => {
      try {
        const found = await fetchInspectionReportForPost(postId);
        if (
          !cancelled &&
          found &&
          inspectionResponseHasUsableData(found)
        ) {
          setInspection(found);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, postId, prefetchedInspection]);

  const scorePct = inspection ? calcScore(inspection) : null;
  const notesText =
    inspection?.notes != null && String(inspection.notes).trim() !== ""
      ? String(inspection.notes).trim()
      : null;

  const posterDisplay =
    (inspection?.posterName && String(inspection.posterName).trim()) ||
    (posterHint && String(posterHint).trim()) ||
    null;
  const inspectorDisplay =
    inspection?.inspectorName && String(inspection.inspectorName).trim()
      ? String(inspection.inspectorName).trim()
      : null;
  const inspectorEmailDisplay =
    inspection?.inspectorEmail && String(inspection.inspectorEmail).trim()
      ? String(inspection.inspectorEmail).trim()
      : null;

  const condKey = String(inspection?.condition ?? "").toUpperCase();
  const condLabelSummary = isPublic
    ? (condKey && OVERALL_CONDITION_LABEL_VI[condKey]
        ? OVERALL_CONDITION_LABEL_VI[condKey]
        : null) ||
      (condKey && OVERALL_CONDITION_LABEL[condKey]
        ? OVERALL_CONDITION_LABEL[condKey]
        : null) ||
      (inspection?.condition ? String(inspection.condition) : null)
    : (condKey && OVERALL_CONDITION_LABEL[condKey]
        ? OVERALL_CONDITION_LABEL[condKey]
        : null) || (inspection?.condition ? String(inspection.condition) : null);

  const resultUpper =
    inspection?.result != null && String(inspection.result).trim() !== ""
      ? String(inspection.result).toUpperCase()
      : null;

  const passFailLabel = isPublic
    ? resultUpper === "PASS"
      ? "ĐẠT"
      : resultUpper === "FAIL"
        ? "KHÔNG ĐẠT"
        : null
    : resultUpper === "PASS"
      ? "Pass"
      : resultUpper === "FAIL"
        ? "Fail"
        : null;

  const refLine = `POST-${postId}`;
  const pctDisplay =
    typeof scorePct === "number" && !Number.isNaN(scorePct)
      ? `${scorePct}%`
      : "—";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(760px, 96vw)"
      centered
      destroyOnHidden
      className="admin-inspection-modal"
      title={
        <div className="admin-inspection-modal__title">
          <span className="admin-inspection-modal__title-kicker">
            {isPublic ? "BIKE INSPECTION" : "Inspection report"}
          </span>
          <span className="admin-inspection-modal__title-main">
            {isPublic
              ? "Biên bản kiểm định"
              : "Record (synced with inspector)"}
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
            {isPublic
              ? "Chưa có biên bản kiểm định"
              : "No inspection record on file"}
          </p>
          <p className="admin-inspection-modal__empty-desc">
            {isPublic
              ? "Biên bản hiển thị sau khi inspector gửi đủ 6 tiêu chí. Thử đóng và mở lại sau vài giây nếu vừa hoàn tất."
              : "Data appears here after the inspector submits all six criteria and notes. Close and reopen in a few seconds if they just submitted."}
          </p>
        </div>
      ) : (
        <div className="admin-inspection-modal__body">
          <div className="admin-inspection-modal__cert">
            <div className="admin-inspection-modal__cert-brand">
              <span className="admin-inspection-modal__cert-brand-mark">
                BIKE INSPECTION
              </span>
              <span className="admin-inspection-modal__cert-brand-meta">
                {isPublic ? (
                  <>
                    Bản ghi được tạo sau khi inspector gửi kết quả kiểm định.
                    <br />
                    Mã tham chiếu: <strong>{refLine}</strong>
                    {inspection.reportId != null ? (
                      <> · Báo cáo #{inspection.reportId}</>
                    ) : null}
                  </>
                ) : (
                  <>
                    Server-sourced record (admin view).
                    <br />
                    Reference: <strong>{refLine}</strong>
                    {inspection.reportId != null ? (
                      <> · Report #{inspection.reportId}</>
                    ) : null}
                  </>
                )}
              </span>
            </div>

            <div className="admin-inspection-modal__cert-banner">
              <h2 className="admin-inspection-modal__cert-banner-title">
                {isPublic
                  ? "BIÊN BẢN KIỂM ĐỊNH CHẤT LƯỢNG XE ĐẠP ĐÃ QUA SỬ DỤNG"
                  : "Used bicycle technical quality inspection record"}
              </h2>
              <p className="admin-inspection-modal__cert-banner-sub">
                {isPublic
                  ? "Used bicycle technical quality inspection record"
                  : "Official inspection certificate summary"}
              </p>
            </div>

            <div className="admin-inspection-modal__cert-summary">
              <div className="admin-inspection-modal__cert-summary-grid">
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "NGÀY KIỂM ĐỊNH" : "Inspection date"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {(isPublic
                      ? formatInspectedAtVi(inspection.inspectedAt)
                      : formatInspectedAtEn(inspection.inspectedAt)) || "—"}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "MÃ TIN ĐĂNG" : "Listing ID"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    #{postId}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "NGƯỜI ĐĂNG TIN" : "Seller / poster"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {posterDisplay || "—"}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    Người kiểm định
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {inspectorDisplay || "—"}
                    {inspectorEmailDisplay ? (
                      <>
                        <br />
                        <span className="admin-inspection-modal__cert-field-email">
                          {inspectorEmailDisplay}
                        </span>
                      </>
                    ) : null}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "SẢN PHẨM" : "Product"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {listingTitle?.trim() || "—"}
                    {listingMeta?.trim() ? (
                      <>
                        <br />
                        <span className="admin-inspection-modal__cert-field-email">
                          {listingMeta.trim()}
                        </span>
                      </>
                    ) : null}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic
                      ? "ĐIỂM TỔNG HỢP (ƯỚC TÍNH)"
                      : "Overall score (estimated)"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {pctDisplay}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "XẾP LOẠI TỔNG THỂ" : "Overall condition"}
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {condLabelSummary || "—"}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="admin-inspection-modal__cert-field-label">
                    {isPublic ? "KẾT QUẢ CUỐI" : "Inspection outcome"}
                  </span>
                  <div>
                    {passFailLabel && resultUpper ? (
                      <span
                        className={`admin-inspection-modal__cert-result-pill ${resultUpper === "PASS" ? "admin-inspection-modal__cert-result-pill--pass" : "admin-inspection-modal__cert-result-pill--fail"}`}
                      >
                        {`${passFailLabel} (${resultUpper})`}
                      </span>
                    ) : (
                      <span className="admin-inspection-modal__cert-field-value">
                        —
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-inspection-modal__cert-table-section">
              <h3 className="admin-inspection-modal__cert-table-heading">
                {isPublic
                  ? "BẢNG ĐIỂM CHI TIẾT THEO TIÊU CHÍ"
                  : "Per-criterion scores (inspector rubric)"}
              </h3>
              <div className="admin-inspection-modal__cert-table-wrap">
                <table className="admin-inspection-modal__cert-table">
                  <thead>
                    <tr>
                      <th>{isPublic ? "STT" : "#"}</th>
                      <th>{isPublic ? "TIÊU CHÍ" : "Criterion"}</th>
                      <th>{isPublic ? "ĐIỂM" : "Score"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSPECTION_CRITERIA_ROWS.map((row, idx) => {
                      const s = inspection.scores?.[row.key];
                      const rowCondKey =
                        overallConditionKeyFromInspectionScore(s);
                      const rubricLine = isPublic
                        ? null
                        : formatInspectorScoreRubricLineEn(s);
                      const tierClass = rowCondKey
                        ? `admin-inspection-modal__cert-condition--${rowCondKey.toLowerCase()}`
                        : "";
                      const numScore =
                        typeof s === "number"
                          ? s
                          : s != null && s !== ""
                            ? Number(s)
                            : NaN;
                      const scoreNumDisplay = Number.isFinite(numScore)
                        ? numScore
                        : null;
                      return (
                        <tr key={row.key}>
                          <td>{idx + 1}</td>
                          <td>
                            <span className="admin-inspection-modal__cert-criterion-name">
                              {isPublic ? row.labelVi : row.labelEn}
                            </span>
                            {INSPECTION_CRITICAL_CRITERIA_KEYS.has(row.key) ? (
                              <span className="admin-inspection-modal__cert-critical-tag">
                                {isPublic ? "Quan trọng" : "Critical"}
                              </span>
                            ) : null}
                          </td>
                          <td>
                            {isPublic ? (
                              scoreNumDisplay != null ? (
                                <div
                                  className={`admin-inspection-modal__cert-condition admin-inspection-modal__cert-condition--score-only ${tierClass}`}
                                >
                                  <span className="admin-inspection-modal__cert-score-num">
                                    {scoreNumDisplay}
                                  </span>
                                </div>
                              ) : (
                                "—"
                              )
                            ) : rubricLine ? (
                              <div
                                className={`admin-inspection-modal__cert-condition ${tierClass}`}
                              >
                                <span className="admin-inspection-modal__cert-condition-main">
                                  {rubricLine}
                                </span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-inspection-modal__cert-notes">
              <div className="admin-inspection-modal__cert-notes-label">
                {isPublic ? "Ghi chú của inspector" : "Inspector notes"}
              </div>
              <div className="admin-inspection-modal__cert-notes-body">
                {notesText || "—"}
              </div>
            </div>

            {isPublic ? (
              <p className="admin-inspection-modal__cert-footnote">
                Điểm Pass/Fail do hệ thống xác định theo quy tắc trên máy chủ.
              </p>
            ) : (
              <p className="admin-inspection-modal__cert-footnote">
                Each row shows the same English rubric text as the inspector form
                (without the numeric prefix). Overall Pass/Fail is computed on
                the server.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

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
import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_CRITICAL_CRITERIA_KEYS,
} from "../../constants/inspectionRubric";
import "./index.css";

function formatInspectedAtVi(raw) {
  if (raw == null || raw === "") return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof raw === "string" ? raw : null;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

/**
 * Admin: cùng dữ liệu API với biên bản inspector — bảng STT / tiêu chí (VI) / điểm.
 */
export default function AdminInspectionModal({
  postId,
  listingTitle,
  /** Dòng phụ: hãng · loại · năm · size (giống biên bản) */
  listingMeta,
  posterHint,
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
        const found = await fetchInspectionReportForPost(postId);
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
  const condLabelVi =
    condKey && OVERALL_CONDITION_LABEL_VI[condKey]
      ? OVERALL_CONDITION_LABEL_VI[condKey]
      : inspection?.condition
        ? String(inspection.condition)
        : null;
  const condLabelEn =
    condKey && OVERALL_CONDITION_LABEL[condKey]
      ? OVERALL_CONDITION_LABEL[condKey]
      : null;

  const resultUpper =
    inspection?.result != null && String(inspection.result).trim() !== ""
      ? String(inspection.result).toUpperCase()
      : null;

  const passFailVi =
    resultUpper === "PASS"
      ? "ĐẠT"
      : resultUpper === "FAIL"
        ? "KHÔNG ĐẠT"
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
            Báo cáo kiểm định
          </span>
          <span className="admin-inspection-modal__title-main">
            Biên bản (đồng bộ inspector)
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
            Chưa có biên bản trên hệ thống
          </p>
          <p className="admin-inspection-modal__empty-desc">
            Dữ liệu hiển thị giống biên bản sau khi inspector gửi đủ 6 tiêu chí
            và ghi chú. Thử đóng và mở lại sau vài giây nếu vừa submit.
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
                Biên bản từ máy chủ (admin view).
                <br />
                Mã tham chiếu: <strong>{refLine}</strong>
                {inspection.reportId != null ? (
                  <> · Report #{inspection.reportId}</>
                ) : null}
              </span>
            </div>

            <div className="admin-inspection-modal__cert-banner">
              <h2 className="admin-inspection-modal__cert-banner-title">
                Biên bản kiểm định chất lượng xe đạp đã qua sử dụng
              </h2>
              <p className="admin-inspection-modal__cert-banner-sub">
                Technical quality inspection record (bicycle)
              </p>
            </div>

            <div className="admin-inspection-modal__cert-summary">
              <div className="admin-inspection-modal__cert-summary-grid">
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    Ngày kiểm định
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {formatInspectedAtVi(inspection.inspectedAt) || "—"}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    Mã tin đăng
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    #{postId}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    Người đăng tin
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
                    Sản phẩm
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
                    Điểm tổng hợp (ước tính)
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {pctDisplay}
                  </span>
                </div>
                <div>
                  <span className="admin-inspection-modal__cert-field-label">
                    Xếp loại tổng thể
                  </span>
                  <span className="admin-inspection-modal__cert-field-value">
                    {condLabelVi || "—"}
                    {condLabelEn && condLabelVi !== condLabelEn ? (
                      <span className="admin-inspection-modal__cert-field-suben">
                        {" "}
                        ({condLabelEn})
                      </span>
                    ) : null}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="admin-inspection-modal__cert-field-label">
                    Kết quả kiểm định
                  </span>
                  <div>
                    {passFailVi && resultUpper ? (
                      <span
                        className={`admin-inspection-modal__cert-result-pill ${resultUpper === "PASS" ? "admin-inspection-modal__cert-result-pill--pass" : "admin-inspection-modal__cert-result-pill--fail"}`}
                      >
                        {passFailVi} ({resultUpper})
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
                Bảng điểm chi tiết theo tiêu chí
              </h3>
              <div className="admin-inspection-modal__cert-table-wrap">
                <table className="admin-inspection-modal__cert-table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tiêu chí</th>
                      <th>Điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSPECTION_CRITERIA_ROWS.map((row, idx) => {
                      const s = inspection.scores?.[row.key];
                      const n = Number(s);
                      const display = s != null && Number.isFinite(n) ? n : "—";
                      return (
                        <tr key={row.key}>
                          <td>{idx + 1}</td>
                          <td>
                            <span className="admin-inspection-modal__cert-criterion-vi">
                              {row.labelVi}
                            </span>
                            {INSPECTION_CRITICAL_CRITERIA_KEYS.has(row.key) ? (
                              <span className="admin-inspection-modal__cert-critical-tag">
                                Critical
                              </span>
                            ) : null}
                          </td>
                          <td>{display}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-inspection-modal__cert-notes">
              <div className="admin-inspection-modal__cert-notes-label">
                Ghi chú kiểm định
              </div>
              <div className="admin-inspection-modal__cert-notes-body">
                {notesText || "—"}
              </div>
            </div>

            <p className="admin-inspection-modal__cert-footnote">
              Điểm và PASS/FAIL do máy chủ tính theo rubric; bảng trên map trực
              tiếp từ API báo cáo (cùng nguồn với biên bản inspector).
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

import { Modal, Progress } from "antd";
import { formatInspectorScoreRubricLineEn } from "../../constants/inspectionRubric";
import { overallConditionKeyFromInspectionScore } from "../../utils/inspectionScoring";
import "./InspectionCertificateModal.css";

export default function InspectionCertificateModal({ open, snapshot, onDone }) {
  if (!snapshot) return null;

  const resultPillClass =
    snapshot.result === "PASS"
      ? "inspection-certificate-result-pill--pass"
      : snapshot.result === "FAIL"
        ? "inspection-certificate-result-pill--fail"
        : "inspection-certificate-result-pill--neutral";
  const scorePctClamped = (() => {
    const cp = snapshot.conditionPercent;
    if (cp == null || cp === "") return null;
    const n = typeof cp === "number" ? cp : Number(cp);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
  })();
  const scoreRingStroke =
    snapshot.result === "FAIL"
      ? { "0%": "#f87171", "100%": "#dc2626" }
      : snapshot.result === "PASS"
        ? { "0%": "#00ccad", "100%": "#0d9488" }
        : { "0%": "#94a3b8", "100%": "#64748b" };

  return (
    <Modal
      open={open}
      onCancel={onDone}
      maskClosable={false}
      footer={
        <div className="inspection-certificate-footer-actions">
          <button
            type="button"
            className="inspection-certificate-btn-done"
            onClick={onDone}
          >
            Đóng và về bảng điều khiển
          </button>
        </div>
      }
      width={720}
      centered
      destroyOnHidden
      className="inspection-certificate-modal"
      title={null}
    >
      <div className="inspection-certificate" id="inspection-certificate-root">
        <div className="inspection-certificate-brand">
          <div className="inspection-certificate-brand-mark">
            BIKE INSPECTION
          </div>
          <div className="inspection-certificate-brand-meta">
            Biên bản điện tử được tạo sau khi gửi kết quả kiểm định thành công.
            <br />
            Mã tham chiếu: <strong>{snapshot.reportId}</strong>
          </div>
        </div>

        <div className="inspection-certificate-title-block">
          <h2 className="inspection-certificate-title">
            Biên bản kiểm định chất lượng xe đạp đã qua sử dụng
          </h2>
          <p className="inspection-certificate-subtitle">
            Technical quality inspection record (bicycle)
          </p>
        </div>

        <div className="inspection-certificate-summary">
          <div className="inspection-certificate-summary-grid">
            <div>
              <span className="inspection-certificate-field-label">
                Ngày kiểm định
              </span>
              <span className="inspection-certificate-field-value">
                {snapshot.inspectedAtFormatted}
              </span>
            </div>
            <div>
              <span className="inspection-certificate-field-label">
                Mã tin đăng
              </span>
              <span className="inspection-certificate-field-value">
                #{snapshot.postId}
              </span>
            </div>
            <div>
              <span className="inspection-certificate-field-label">
                Người đăng tin
              </span>
              <span className="inspection-certificate-field-value">
                {snapshot.posterName}
              </span>
            </div>
            <div>
              <span className="inspection-certificate-field-label">
                Người kiểm định
              </span>
              <span className="inspection-certificate-field-value">
                {snapshot.inspectorName}
                {snapshot.inspectorEmail ? (
                  <>
                    <br />
                    <span style={{ fontWeight: 500, fontSize: 12 }}>
                      {snapshot.inspectorEmail}
                    </span>
                  </>
                ) : null}
              </span>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <span className="inspection-certificate-field-label">
                Sản phẩm
              </span>
              <span className="inspection-certificate-field-value">
                {snapshot.bicycleName}
                <br />
                <span style={{ fontWeight: 500, fontSize: 12, color: "#444" }}>
                  {snapshot.listingMetaLine}
                </span>
              </span>
            </div>
            {scorePctClamped != null ? (
              <div
                className="inspection-certificate-score-hero"
                style={{ gridColumn: "1 / -1" }}
              >
                <div className="inspection-certificate-score-hero-ring">
                  <span className="inspection-certificate-score-hero-label">
                    Điểm tổng hợp (ước tính)
                  </span>
                  <Progress
                    type="circle"
                    percent={scorePctClamped}
                    size={168}
                    strokeWidth={10}
                    strokeColor={scoreRingStroke}
                    trailColor="rgba(148, 163, 184, 0.22)"
                    format={() => (
                      <span className="inspection-certificate-score-hero-pct">
                        {scorePctClamped % 1 === 0
                          ? `${Math.round(scorePctClamped)}%`
                          : `${scorePctClamped.toFixed(1)}%`}
                      </span>
                    )}
                  />
                </div>
                <div className="inspection-certificate-score-hero-meta">
                  <div>
                    <span className="inspection-certificate-field-label">
                      Xếp loại tổng thể
                    </span>
                    <span className="inspection-certificate-field-value">
                      {snapshot.overallLabelVi}
                    </span>
                  </div>
                  <div>
                    <span className="inspection-certificate-field-label">
                      Kết quả kiểm định
                    </span>
                    <div>
                      <span
                        className={`inspection-certificate-result-pill inspection-certificate-result-pill--hero ${resultPillClass}`}
                      >
                        {snapshot.passFailVi}
                        {snapshot.result === "PASS" ||
                        snapshot.result === "FAIL"
                          ? ` (${snapshot.result})`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="inspection-certificate-field-label">
                    Điểm tổng hợp (ước tính)
                  </span>
                  <span className="inspection-certificate-field-value">—</span>
                </div>
                <div>
                  <span className="inspection-certificate-field-label">
                    Xếp loại tổng thể
                  </span>
                  <span className="inspection-certificate-field-value">
                    {snapshot.overallLabelVi}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span className="inspection-certificate-field-label">
                    Kết quả kiểm định
                  </span>
                  <div>
                    <span
                      className={`inspection-certificate-result-pill ${resultPillClass}`}
                    >
                      {snapshot.passFailVi}
                      {snapshot.result === "PASS" || snapshot.result === "FAIL"
                        ? ` (${snapshot.result})`
                        : ""}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="inspection-certificate-section">
          <h3 className="inspection-certificate-section-title">
            Bảng điểm chi tiết theo tiêu chí
          </h3>
          <div className="inspection-certificate-table-wrap">
            <table className="inspection-certificate-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tiêu chí</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.scoreRows.map((row, idx) => {
                  const tierKey = overallConditionKeyFromInspectionScore(
                    row.score,
                  );
                  const tier = tierKey ? String(tierKey).toLowerCase() : "";
                  const rubricLine = formatInspectorScoreRubricLineEn(row.score);
                  return (
                    <tr key={row.labelVi}>
                      <td>{idx + 1}</td>
                      <td>{row.labelVi}</td>
                      <td>
                        {rubricLine ? (
                          <span
                            className={
                              tier
                                ? `inspection-certificate-score-rubric inspection-certificate-score-rubric--${tier}`
                                : "inspection-certificate-score-rubric"
                            }
                          >
                            {rubricLine}
                          </span>
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

        <div className="inspection-certificate-notes">
          <div className="inspection-certificate-notes-label">
            Ghi chú kiểm định
          </div>
          {snapshot.notes}
        </div>

        <p className="inspection-certificate-legend">
          <strong>Lưu ý:</strong> Điểm số và PASS/FAIL cuối cùng do hệ thống máy
          chủ xác định theo rubric. Giá trị trên biên bản phản ánh dữ liệu tại
          thời điểm gửi; nếu máy chủ trả về khác, ưu tiên bản ghi trên hệ thống.
        </p>
      </div>
    </Modal>
  );
}

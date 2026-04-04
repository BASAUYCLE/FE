import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Modal, Input, Alert, Select } from "antd";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { postService, inspectionService } from "../../../services";
import {
  OVERALL_CONDITION_LABEL,
  POSTING_STATUS_LABEL,
  POSTING_STATUS,
} from "../../../constants/postingStatus";
import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_SCORE_OPTIONS,
  INSPECTION_PREVIEW_WARNING_TEXT_EN,
} from "../../../constants/inspectionRubric";
import {
  buildInspectionPreview,
  validateInspectionScores,
} from "../../../utils/inspectionScoring";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./index.css";

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s !== "") return s;
  }
  return null;
}

/** No preset scores — inspector must choose each row (placeholder: "Select rating"). */
function createEmptyScores() {
  return {};
}

/** Select options — English rubric text (hintEn) */
const INSPECTION_SCORE_SELECT_OPTIONS = INSPECTION_SCORE_OPTIONS.map((opt) => ({
  value: opt.value,
  label: `${opt.value} — ${opt.hintEn}`,
}));

/** Chuẩn hóa GET /posts/:id — cùng alias field với ProductDetail để không thiếu dữ liệu. */
function mapPostToInspectionReport(row) {
  if (!row || typeof row !== "object") return null;
  const postId = row.postId ?? row.post_id ?? row.id;
  if (postId == null) return null;

  const images =
    row.images ?? row.bicycleImages ?? row.imageList ?? row.postImages ?? [];
  const imgUrl = (i) => i?.imageUrl ?? i?.image_url ?? i?.url ?? null;
  const thumb = images.find((i) => i?.isThumbnail);
  const bicycleImage = imgUrl(thumb) ?? imgUrl(images[0]) ?? null;
  const inspectionImages = images.map(imgUrl).filter(Boolean);

  const bicycleName =
    firstNonEmpty(
      row.bicycleName,
      row.bicycle_name,
      row.postTitle,
      row.post_title,
      row.title,
    ) ?? "—";

  const rawPrice = row.price;
  const priceNum =
    typeof rawPrice === "number" && !Number.isNaN(rawPrice)
      ? rawPrice
      : typeof rawPrice === "string" && String(rawPrice).trim() !== ""
        ? Number(rawPrice)
        : NaN;
  const priceDisplay = Number.isFinite(priceNum)
    ? formatCurrency(priceNum)
    : firstNonEmpty(row.priceDisplay, row.price_display);

  return {
    id: postId,
    reportId: `POST-${postId}`,
    bicycleName,
    bicycleImage,
    inspectionImages,
    owner:
      firstNonEmpty(
        row.sellerFullName,
        row.seller_full_name,
        row.sellerName,
        row.seller_name,
      ) ?? "—",
    updatedAt: row.updatedAt ?? row.updated_at ?? new Date().toISOString(),
    reportStatus: String(
      row.postStatus ?? row.post_status ?? row.status ?? "PENDING",
    ).toUpperCase(),
    categoryName:
      firstNonEmpty(
        row.categoryName,
        row.category_name,
        typeof row.category === "string"
          ? row.category
          : (row.category?.categoryName ?? row.category?.name),
      ) ?? "—",
    brandName: firstNonEmpty(
      row.brandName,
      row.brand_name,
      typeof row.brand === "string"
        ? row.brand
        : (row.brand?.brandName ?? row.brand?.name),
    ),
    modelYear: firstNonEmpty(row.modelYear, row.model_year) ?? "—",
    size: firstNonEmpty(row.size, row.frameSize, row.frame_size) ?? "—",
    priceDisplay: priceDisplay ?? "—",
    bicycleColor: firstNonEmpty(row.bicycleColor, row.bicycle_color, row.color),
    frameMaterial: firstNonEmpty(row.frameMaterial, row.frame_material),
    groupset: firstNonEmpty(row.groupset),
    brakeType: firstNonEmpty(row.brakeType, row.brake_type),
    description: firstNonEmpty(
      row.bicycleDescription,
      row.bicycle_description,
      row.description,
    ),
  };
}

function inspectionMetaLineParts(parts) {
  const line = parts
    .filter((p) => p != null && p !== "" && p !== "—")
    .join(" · ");
  return line || "—";
}

export default function InspectorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postIdNum = useMemo(() => {
    const n = Number(id);
    return Number.isInteger(n) && n > 0 ? n : null;
  }, [id]);

  const [postFromApi, setPostFromApi] = useState(null);
  const [postLoading, setPostLoading] = useState(!!postIdNum);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [scores, setScores] = useState(createEmptyScores);
  const [notes, setNotes] = useState("");
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const report = useMemo(
    () => (postFromApi ? mapPostToInspectionReport(postFromApi) : null),
    [postFromApi],
  );

  useEffect(() => {
    if (!postIdNum) return;
    let cancelled = false;
    postService
      .getPostById(postIdNum)
      .then((res) => {
        if (cancelled) return;
        const data = res?.result ?? res;
        setPostFromApi(data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPostFromApi(null);
      })
      .finally(() => {
        if (!cancelled) setPostLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postIdNum]);

  const preview = useMemo(() => buildInspectionPreview(scores), [scores]);

  const canSubmit =
    report?.reportStatus === POSTING_STATUS.ADMIN_APPROVED && postIdNum != null;

  const setCriterionScore = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitClick = () => {
    const v = validateInspectionScores(scores);
    if (!v.valid) {
      message.error(
        "Each criterion must be scored 0, 3, 7, or 10 before submitting.",
      );
      return;
    }
    if (!canSubmit) {
      message.warning(
        "This listing is not in admin-approved (pending inspection) status.",
      );
      return;
    }
    setSubmitConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    const v = validateInspectionScores(scores);
    if (!v.valid || !postIdNum) return;
    const trimmed = notes.trim();
    const payload = {
      ...scores,
      ...(trimmed ? { notes: trimmed } : {}),
    };
    try {
      setSubmitLoading(true);
      await inspectionService.submitInspection(postIdNum, payload);
      message.success(
        "Inspection submitted. The server applied the rubric and updated PASS/FAIL and listing status.",
      );
      setSubmitConfirmOpen(false);
      navigate("/inspector");
    } catch (err) {
      message.error(err?.message ?? "Submit failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleExit = () => {
    navigate("/inspector");
  };

  if (postIdNum && postLoading) {
    return (
      <InspectorLayout>
        <div className="inspector-detail-page">
          <p>Loading post...</p>
        </div>
      </InspectorLayout>
    );
  }

  if (!report) {
    return (
      <InspectorLayout>
        <div className="inspector-detail-page">
          <p>Inspection request not found.</p>
          <button
            type="button"
            className="admin-outline-button"
            onClick={() => navigate("/inspector")}
          >
            Back to Dashboard
          </button>
        </div>
      </InspectorLayout>
    );
  }

  const statusLabel =
    POSTING_STATUS_LABEL[report.reportStatus] ?? report.reportStatus;

  return (
    <InspectorLayout>
      <div className="inspector-page">
        <div className="inspector-dashboard inspector-dashboard--detail-report">
          <div className="inspection-report-page">
            <PageBreadcrumb
              items={[
                { label: "Dashboard", path: "/inspector" },
                { label: `Inspection details #${report.id}` },
              ]}
            />

            <div className="inspection-report-header">
              <div>
                <h1 className="inspection-report-title">
                  Technical Inspection Report
                </h1>
                <p className="inspection-report-meta">
                  ID: {report.reportId} · Updated: {report.updatedAt}
                </p>
              </div>
            </div>

            <div className="inspection-report-layout">
              <div className="inspection-report-top-row">
                <div className="admin-card inspection-report-card inspection-report-status-card">
                  <h3 className="inspection-report-card-title">
                    Current status
                  </h3>
                  <p
                    className={`inspection-report-status inspection-report-status--${report.reportStatus?.toLowerCase()}`}
                  >
                    {statusLabel}
                  </p>
                </div>

                <div className="admin-card inspection-report-card inspection-confirmation inspection-confirmation--inline">
                  <div className="inspection-confirmation-icon">
                    <Settings size={24} color="#fff" />
                  </div>
                  <h3 className="inspection-report-card-title">
                    Inspection confirmation
                  </h3>
                  <p className="inspection-confirmation-text">
                    I confirm that the inspection was carried out in accordance
                    with the applicable standards and that the information above
                    is accurate at the time of inspection.
                  </p>
                </div>
              </div>

              <div className="inspection-report-body">
                <div className="admin-card inspection-report-card inspection-report-post-detail">
                  {report.bicycleImage && (
                    <img
                      src={report.bicycleImage}
                      alt={report.bicycleName}
                      className="inspection-report-bike-image"
                    />
                  )}
                  <h2 className="inspection-report-bike-name">
                    {report.bicycleName}
                  </h2>
                  <p className="inspection-report-bike-meta">
                    {inspectionMetaLineParts([
                      report.brandName,
                      report.categoryName,
                      report.modelYear,
                      report.size !== "—" ? `Size ${report.size}` : null,
                    ])}
                  </p>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Price:
                    </span>
                    <span>{report.priceDisplay}</span>
                  </div>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Owner:
                    </span>
                    <span>{report.owner}</span>
                  </div>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Color:
                    </span>
                    <span>{report.bicycleColor ?? "—"}</span>
                  </div>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Frame material:
                    </span>
                    <span>{report.frameMaterial ?? "—"}</span>
                  </div>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Groupset:
                    </span>
                    <span>{report.groupset ?? "—"}</span>
                  </div>
                  <div className="inspection-report-detail-row">
                    <span className="inspection-report-detail-label">
                      Brake type:
                    </span>
                    <span>{report.brakeType ?? "—"}</span>
                  </div>
                  <div className="inspection-report-description-block">
                    <span className="inspection-report-detail-label">
                      Description
                    </span>
                    <p className="inspection-report-description">
                      {report.description ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="admin-card inspection-report-card inspection-report-images-card">
                  <h3 className="inspection-report-card-title">
                    Listing images
                  </h3>
                  <div className="inspection-report-thumbnails inspection-report-thumbnails--large">
                    {report.inspectionImages
                      ?.filter(Boolean)
                      .slice(0, 4)
                      .map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="inspection-report-thumb inspection-report-thumb-btn"
                          onClick={() => {
                            setImageViewerIndex(idx);
                            setImageViewerOpen(true);
                          }}
                        >
                          <img src={img} alt="" />
                        </button>
                      ))}
                    {report.inspectionImages?.length > 4 && (
                      <button
                        type="button"
                        className="inspection-report-thumb inspection-report-thumb-more"
                        onClick={() => {
                          setImageViewerIndex(4);
                          setImageViewerOpen(true);
                        }}
                      >
                        +{report.inspectionImages.length - 4}
                      </button>
                    )}
                  </div>
                </div>

                <div className="admin-card inspection-report-card inspection-scoring-card">
                  <div className="inspection-scoring-card-head">
                    <h3 className="inspection-scoring-card-title">
                      Scoring rubric
                    </h3>
                    <p className="inspection-scoring-card-subtitle">
                      Six criteria — choose <strong>0, 3, 7, or 10</strong> per
                      row. The server derives overall condition and{" "}
                      <strong>PASS/FAIL</strong>; you cannot set PASS/FAIL
                      manually.
                    </p>
                  </div>
                  {!canSubmit && (
                    <Alert
                      type="warning"
                      showIcon
                      style={{ marginBottom: 16 }}
                      message="Submit is only available when the post is admin-approved (pending inspection)."
                    />
                  )}
                  <div className="inspection-criteria-list inspection-criteria-list--rubric-form">
                    {INSPECTION_CRITERIA_ROWS.map((row, idx) => (
                      <div
                        key={row.key}
                        className="inspection-rubric-section"
                      >
                        <div className="inspection-rubric-section-inner">
                          <div className="inspection-rubric-section-leading">
                            <span className="inspection-rubric-section-index">
                              {idx + 1}
                            </span>
                            <div className="inspection-rubric-section-copy">
                              <div className="inspection-rubric-section-title-row">
                                <h4 className="inspection-rubric-section-title">
                                  {row.labelEn}
                                </h4>
                              </div>
                              {row.hintEn ? (
                                <p
                                  className={`inspection-criterion-hint ${row.critical ? "inspection-criterion-hint--critical" : ""}`}
                                >
                                  {row.hintEn}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="inspection-rubric-item-score">
                            <label
                              className="field-label inspection-rubric-score-label"
                              htmlFor={`rubric-score-${row.key}`}
                            >
                              Score
                            </label>
                            <Select
                              id={`rubric-score-${row.key}`}
                              size="large"
                              className="field-select"
                              popupClassName="inspection-rubric-score-dropdown"
                              placeholder="Select rating"
                              value={scores[row.key]}
                              onChange={(value) =>
                                setCriterionScore(row.key, value)
                              }
                              options={INSPECTION_SCORE_SELECT_OPTIONS}
                              getPopupContainer={() => document.body}
                              aria-label={`${row.labelEn}: score`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="inspection-notes-block">
                    <label
                      className="inspection-notes-label"
                      htmlFor="inspector-notes"
                    >
                      Notes (optional)
                    </label>
                    <Input.TextArea
                      id="inspector-notes"
                      placeholder="e.g. Minor paint chips on top tube; brakes bled recently."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      showCount
                    />
                  </div>

                  <div className="inspection-preview-panel">
                    <h4 className="inspection-preview-title">Live preview</h4>
                    {preview.complete ? (
                      <>
                        <div className="inspection-preview-row">
                          <span>Condition score</span>
                          <strong>{preview.conditionPercent}%</strong>
                        </div>
                        <div className="inspection-preview-row">
                          <span>Overall band (preview)</span>
                          <strong>
                            {preview.overallCondition
                              ? (OVERALL_CONDITION_LABEL[
                                  preview.overallCondition
                                ] ?? preview.overallCondition)
                              : "—"}
                          </strong>
                        </div>
                        <div className="inspection-preview-row">
                          <span>PASS/FAIL (preview)</span>
                          <strong
                            className={
                              preview.result === "PASS"
                                ? "inspection-preview-pass"
                                : "inspection-preview-fail"
                            }
                          >
                            {preview.result}
                          </strong>
                        </div>
                        <div className="inspection-preview-bar-wrap">
                          <div
                            className="inspection-preview-bar"
                            style={{
                              width: `${Math.min(100, Math.max(0, preview.conditionPercent ?? 0))}%`,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <p className="inspection-preview-incomplete">
                        Enter all six scores to see the computed preview
                        (official result still comes from the server on submit).
                      </p>
                    )}
                    {preview.warnings.length > 0 && (
                      <div className="inspection-preview-warnings">
                        {preview.warnings.map((w) => (
                          <Alert
                            key={w}
                            type="warning"
                            showIcon
                            message={INSPECTION_PREVIEW_WARNING_TEXT_EN[w] ?? w}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="inspector-detail-actions">
              <button
                type="button"
                className="inspector-btn-exit"
                onClick={handleExit}
              >
                Exit
              </button>
              <div className="inspector-detail-actions-right">
                <button
                  type="button"
                  className="inspector-btn-done"
                  onClick={handleSubmitClick}
                  disabled={!canSubmit || submitLoading}
                >
                  Submit inspection
                </button>
              </div>
            </div>
          </div>
        </div>

        <Modal
          title="Confirm inspection submit"
          open={submitConfirmOpen}
          onCancel={() => setSubmitConfirmOpen(false)}
          onOk={handleConfirmSubmit}
          okText="Submit to server"
          cancelText="Back"
          okButtonProps={{ loading: submitLoading }}
          destroyOnHidden
          width={520}
        >
          {preview.complete ? (
            <div className="inspection-confirm-summary">
              <p>
                You are about to submit scores for{" "}
                <strong>{report.bicycleName}</strong>.
              </p>
              <ul className="inspection-confirm-scores">
                {INSPECTION_CRITERIA_ROWS.map((row) => (
                  <li key={row.key}>
                    {row.labelEn}: <strong>{scores[row.key]}</strong>
                  </li>
                ))}
              </ul>
              <p>
                Preview (non-binding):{" "}
                <strong>{preview.conditionPercent}%</strong> ·{" "}
                <strong>{preview.result}</strong>
                {preview.overallCondition
                  ? ` · ${OVERALL_CONDITION_LABEL[preview.overallCondition] ?? preview.overallCondition}`
                  : ""}
                . Final values are returned by the server.
              </p>
              {notes.trim() ? (
                <p className="inspection-confirm-notes">
                  <em>Notes:</em> {notes.trim()}
                </p>
              ) : null}
            </div>
          ) : (
            <p>Scores are incomplete.</p>
          )}
        </Modal>

        <Modal
          open={imageViewerOpen}
          onCancel={() => setImageViewerOpen(false)}
          footer={null}
          width="90vw"
          centered
          styles={{ body: { padding: 0 } }}
          className="inspection-image-viewer-modal"
        >
          {report?.inspectionImages?.length > 0 && (
            <div className="inspection-viewer-wrap">
              <button
                type="button"
                className="inspection-viewer-nav inspection-viewer-prev"
                onClick={() => setImageViewerIndex((i) => Math.max(0, i - 1))}
                disabled={imageViewerIndex === 0}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <img
                src={report.inspectionImages[imageViewerIndex]}
                alt="Listing"
                className="inspection-viewer-img"
              />
              <button
                type="button"
                className="inspection-viewer-nav inspection-viewer-next"
                onClick={() =>
                  setImageViewerIndex((i) =>
                    Math.min(report.inspectionImages.length - 1, i + 1),
                  )
                }
                disabled={
                  imageViewerIndex === report.inspectionImages.length - 1
                }
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
              <div className="inspection-viewer-counter">
                {imageViewerIndex + 1} / {report.inspectionImages.length}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </InspectorLayout>
  );
}

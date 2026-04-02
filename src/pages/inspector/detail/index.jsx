import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Modal, Select, Input } from "antd";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import { useNotifications } from "../../../contexts/useNotifications";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import { postService, inspectionService } from "../../../services";
import {
  OVERALL_CONDITION,
  OVERALL_CONDITION_LABEL,
  POSTING_STATUS_LABEL,
} from "../../../constants/postingStatus";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Settings,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./index.css";

const CHECKLIST_STATUS_OPTIONS = [
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "n/a", label: "N/A" },
];

function deepCloneChecklist(checklist) {
  if (!checklist || !Array.isArray(checklist)) return [];
  return checklist.map((group) => ({
    ...group,
    items: (group.items || []).map((item) => ({ ...item })),
  }));
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s !== "") return s;
  }
  return null;
}

/** Chuẩn hóa GET /posts/:id — cùng alias field với ProductDetail để không thiếu dữ liệu. */
function mapPostToInspectionReport(row) {
  if (!row || typeof row !== "object") return null;
  const postId = row.postId ?? row.post_id ?? row.id;
  if (postId == null) return null;

  const images =
    row.images ?? row.bicycleImages ?? row.imageList ?? row.postImages ?? [];
  const imgUrl = (i) => i?.imageUrl ?? i?.image_url ?? i?.url ?? null;
  const thumb = images.find((i) => i?.isThumbnail);
  const bicycleImage =
    imgUrl(thumb) ?? imgUrl(images[0]) ?? null;
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
    owner: firstNonEmpty(
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
        typeof row.category === "string" ? row.category : row.category?.categoryName ?? row.category?.name,
      ) ?? "—",
    brandName: firstNonEmpty(
      row.brandName,
      row.brand_name,
      typeof row.brand === "string" ? row.brand : row.brand?.brandName ?? row.brand?.name,
    ),
    modelYear: firstNonEmpty(row.modelYear, row.model_year) ?? "—",
    size: firstNonEmpty(row.size, row.frameSize, row.frame_size) ?? "—",
    priceDisplay: priceDisplay ?? "—",
    bicycleColor: firstNonEmpty(
      row.bicycleColor,
      row.bicycle_color,
      row.color,
    ),
    frameMaterial: firstNonEmpty(row.frameMaterial, row.frame_material),
    groupset: firstNonEmpty(row.groupset),
    brakeType: firstNonEmpty(row.brakeType, row.brake_type),
    description: firstNonEmpty(
      row.bicycleDescription,
      row.bicycle_description,
      row.description,
    ),
    checklist: row.checklist ?? [],
    completionPercent: row.completionPercent ?? 0,
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
  const [submitResultModalOpen, setSubmitResultModalOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState("PASS");
  const [submitOverallCondition, setSubmitOverallCondition] = useState(OVERALL_CONDITION.GOOD);
  const [submitNotes, setSubmitNotes] = useState("");

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
    return () => { cancelled = true; };
  }, [postIdNum]);

  const { addNotification } = useNotifications();
  const [checklist, setChecklist] = useState([]);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const updateChecklistItem = useCallback((gIdx, iIdx, field, value) => {
    setChecklist((prev) => {
      const next = prev.map((g, gi) =>
        gi === gIdx
          ? { ...g, items: g.items.map((it, ii) => (ii === iIdx ? { ...it, [field]: value } : it)) }
          : g
      );
      return next;
    });
  }, []);

  useEffect(() => {
    if (report) {
      setChecklist(deepCloneChecklist(report.checklist));
      setCompletionPercent(report.completionPercent ?? 0);
    }
  }, [report?.id]);

  const renderStatusIcon = (status) => {
    if (status === "good") return <CheckCircle2 size={18} color="#10b981" />;
    if (status === "fair") return <AlertCircle size={18} color="#f59e0b" />;
    if (status === "poor") return <AlertTriangle size={18} color="#ef4444" />;
    return <MinusCircle size={18} color="#94a3b8" />;
  };

  const handleRejectClick = () => {
    setConfirmAction("reject");
    setConfirmModalOpen(true);
  };

  const handleCompleteClick = () => {
    setConfirmAction("complete");
    setConfirmModalOpen(true);
  };

  const handleConfirmModalOk = () => {
    if (confirmAction === "reject") {
      setConfirmModalOpen(false);
      setConfirmAction(null);
      setRejectReason("");
      setRejectModalOpen(true);
    } else if (confirmAction === "complete") {
      setConfirmModalOpen(false);
      setConfirmAction(null);
      handleDone();
    }
  };

  const handleRejectSubmit = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning("Please enter a reason for rejection.");
      return;
    }
    if (postIdNum) {
      try {
        setSubmitLoading(true);
        await inspectionService.submitInspection(postIdNum, {
          result: "FAIL",
          overallCondition: "POOR",
          notes: reason,
        });
        message.success("Fail result submitted. Post status set to REJECTED.");
        setRejectModalOpen(false);
        setRejectReason("");
        navigate("/inspector");
      } catch (err) {
        message.error(err?.message ?? "Submit result failed.");
      } finally {
        setSubmitLoading(false);
      }
      return;
    }
    addNotification({
      title: "Inspection Rejected",
      message: reason,
      type: "warning",
      reportId: report?.reportId,
      bicycleName: report?.bicycleName,
      owner: report?.owner,
    });
    message.success("Inspection rejected. The member will be notified.");
    setRejectModalOpen(false);
    setRejectReason("");
    navigate("/inspector");
  };

  const handleDone = () => {
    if (postIdNum) {
      setSubmitResult("PASS");
      setSubmitOverallCondition(OVERALL_CONDITION.GOOD);
      setSubmitNotes("");
      setSubmitResultModalOpen(true);
      return;
    }
    message.success("Inspection marked as completed. (API can be wired later.)");
    navigate("/inspector");
  };

  const handleSubmitResultOk = async () => {
    const notes = submitNotes.trim();
    if (!notes) {
      message.warning("Please enter inspection notes.");
      return;
    }
    try {
      setSubmitLoading(true);
      await inspectionService.submitInspection(postIdNum, {
        result: submitResult,
        overallCondition: submitOverallCondition,
        notes,
      });
      message.success("Inspection result submitted. Post status set to AVAILABLE.");
      setSubmitResultModalOpen(false);
      navigate("/inspector");
    } catch (err) {
      message.error(err?.message ?? "Submit result failed.");
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
          <button type="button" className="admin-outline-button" onClick={() => navigate("/inspector")}>
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
              <h1 className="inspection-report-title">Technical Inspection Report</h1>
              <p className="inspection-report-meta">
                ID: {report.reportId} · Updated: {report.updatedAt}
              </p>
            </div>
          </div>

          <div className="inspection-report-layout">
            <div className="inspection-report-top-row">
              <div className="admin-card inspection-report-card inspection-report-status-card">
                <h3 className="inspection-report-card-title">Current status</h3>
                <p className={`inspection-report-status inspection-report-status--${report.reportStatus?.toLowerCase()}`}>
                  {statusLabel}
                </p>
              </div>

              <div className="admin-card inspection-report-card inspection-confirmation inspection-confirmation--inline">
                <div className="inspection-confirmation-icon">
                  <Settings size={24} color="#fff" />
                </div>
                <h3 className="inspection-report-card-title">Inspection confirmation</h3>
                <p className="inspection-confirmation-text">
                  I confirm that the inspection was carried out in accordance with the applicable standards and that the information above is accurate at the time of inspection.
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
                <h2 className="inspection-report-bike-name">{report.bicycleName}</h2>
                <p className="inspection-report-bike-meta">
                  {inspectionMetaLineParts([
                    report.brandName,
                    report.categoryName,
                    report.modelYear,
                    report.size !== "—" ? `Size ${report.size}` : null,
                  ])}
                </p>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Price:</span>
                  <span>{report.priceDisplay}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Owner:</span>
                  <span>{report.owner}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Color:</span>
                  <span>{report.bicycleColor ?? "—"}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Frame material:</span>
                  <span>{report.frameMaterial ?? "—"}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Groupset:</span>
                  <span>{report.groupset ?? "—"}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Brake type:</span>
                  <span>{report.brakeType ?? "—"}</span>
                </div>
                <div className="inspection-report-description-block">
                  <span className="inspection-report-detail-label">Description</span>
                  <p className="inspection-report-description">
                    {report.description ?? "—"}
                  </p>
                </div>
              </div>

              <div className="admin-card inspection-report-card inspection-report-images-card">
                <h3 className="inspection-report-card-title">Inspection images</h3>
                <div className="inspection-report-thumbnails inspection-report-thumbnails--large">
                  {report.inspectionImages?.filter(Boolean).slice(0, 4).map((img, idx) => (
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
            </div>
          </div>

          <div className="inspector-detail-actions">
            <button type="button" className="inspector-btn-exit" onClick={handleExit}>
              Exit
            </button>
            <div className="inspector-detail-actions-right">
              <button type="button" className="inspector-btn-reject" onClick={handleRejectClick}>
                Reject
              </button>
              <button type="button" className="inspector-btn-done" onClick={handleCompleteClick}>
                Inspection Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={confirmAction === "reject" ? "Confirm Reject" : "Confirm Inspection Complete"}
        open={confirmModalOpen}
        onCancel={() => {
          setConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onOk={handleConfirmModalOk}
        okText="Yes, I'm sure"
        cancelText="Cancel"
        okButtonProps={{
          className: confirmAction === "reject" ? "inspector-confirm-modal-ok-reject" : "inspector-confirm-modal-ok-complete",
        }}
        destroyOnHidden
        width={480}
      >
        <p className="inspection-confirm-modal-text">
          {confirmAction === "reject"
            ? "Are you sure you want to reject this inspection? The member will be notified and you will need to provide a reason in the next step."
            : "Are you sure you want to verify and complete this inspection? This will mark the listing as inspected."}
        </p>
      </Modal>

      <Modal
        title="Reject Inspection"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        onOk={handleRejectSubmit}
        okText="Submit & Notify Member"
        cancelText="Cancel"
        okButtonProps={{ className: "inspector-reject-modal-ok", loading: submitLoading }}
        destroyOnHidden
      >
        <p style={{ marginBottom: 8, color: "#64748b" }}>
          Enter the reason for rejection. This will be sent to the member&apos;s notifications.
        </p>
        <textarea
          className="inspection-reject-reason-textarea"
          placeholder="e.g. Frame damage found. Brake pads below minimum thickness."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
        />
      </Modal>

      <Modal
        title="Submit inspection result (PASS)"
        open={submitResultModalOpen}
        onCancel={() => setSubmitResultModalOpen(false)}
        onOk={handleSubmitResultOk}
        okText="Submit result"
        cancelText="Cancel"
        okButtonProps={{ loading: submitLoading }}
        destroyOnHidden
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Overall condition</label>
          <Select
            style={{ width: "100%" }}
            value={submitOverallCondition}
            onChange={setSubmitOverallCondition}
            options={[
              { value: OVERALL_CONDITION.EXCELLENT, label: OVERALL_CONDITION_LABEL[OVERALL_CONDITION.EXCELLENT] },
              { value: OVERALL_CONDITION.GOOD, label: OVERALL_CONDITION_LABEL[OVERALL_CONDITION.GOOD] },
              { value: OVERALL_CONDITION.FAIR, label: OVERALL_CONDITION_LABEL[OVERALL_CONDITION.FAIR] },
              { value: OVERALL_CONDITION.POOR, label: OVERALL_CONDITION_LABEL[OVERALL_CONDITION.POOR] },
            ]}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Notes (required)</label>
          <Input.TextArea
            placeholder="e.g. Bike in very good condition, carbon frame intact, brakes working well"
            value={submitNotes}
            onChange={(e) => setSubmitNotes(e.target.value)}
            rows={4}
          />
        </div>
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
              alt="Inspection"
              className="inspection-viewer-img"
            />
            <button
              type="button"
              className="inspection-viewer-nav inspection-viewer-next"
              onClick={() => setImageViewerIndex((i) => Math.min(report.inspectionImages.length - 1, i + 1))}
              disabled={imageViewerIndex === report.inspectionImages.length - 1}
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
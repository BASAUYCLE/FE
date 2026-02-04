import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { message, Modal } from "antd";
import Header from "../../../components/header";
import { useNotifications } from "../../../contexts/useNotifications";
import Footer from "../../../components/footer";
import PageBreadcrumb from "../../../components/PageBreadcrumb";
import {
  INSPECTOR_NAV_LINKS,
  getInspectorActiveLink,
} from "../../../config/inspectorNav";
import { getInspectionReport } from "../../../data/inspections";
import {
  Download,
  Printer,
  Send,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Settings,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

export default function InspectorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const report = getInspectionReport(id);

  const { addNotification } = useNotifications();
  const [checklist, setChecklist] = useState(() => deepCloneChecklist(report?.checklist));
  const [inspectorNotes, setInspectorNotes] = useState(report?.inspectorNotes ?? "");
  const [completionPercent, setCompletionPercent] = useState(report?.completionPercent ?? 0);
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
      setInspectorNotes(report.inspectorNotes ?? "");
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

  const handleRejectSubmit = () => {
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning("Please enter a reason for rejection.");
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
    message.success("Inspection marked as completed. (API can be wired later.)");
    navigate("/inspector");
  };

  const handleExit = () => {
    navigate("/inspector");
  };

  const handleDownloadPdf = () => {
    message.info("Download PDF (API can be wired later.)");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendApproval = () => {
    message.success("Sent for approval. (API can be wired later.)");
  };

  if (!report) {
    return (
      <div className="inspector-page">
        <Header
          navLinks={INSPECTOR_NAV_LINKS}
          activeLink={getInspectorActiveLink(pathname)}
          navVariant="pill"
          showSearch={false}
          showWishlistIcon={false}
          showAvatar
          showSellButton={false}
          showLogin={false}
        />
        <div className="inspector-detail-page">
          <p>Inspection request not found.</p>
          <button type="button" className="admin-outline-button" onClick={() => navigate("/inspector")}>
            Back to Dashboard
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusLabel = report.reportStatus === "APPROVED" ? "Approved" : report.reportStatus === "PENDING_APPROVAL" ? "Pending approval" : report.reportStatus;

  return (
    <div className="inspector-page">
      <Header
        navLinks={INSPECTOR_NAV_LINKS}
        activeLink={getInspectorActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="inspector-dashboard">
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
            <div className="inspection-report-actions-top">
              <button type="button" className="inspection-btn-secondary" onClick={handleDownloadPdf}>
                <Download size={16} />
                Download PDF
              </button>
              <button type="button" className="inspection-btn-secondary" onClick={handlePrint}>
                <Printer size={16} />
                Print report
              </button>
              <button type="button" className="inspection-btn-primary" onClick={handleSendApproval}>
                <Send size={16} />
                Send for approval
              </button>
            </div>
          </div>

          <div className="inspection-report-grid">
            <div className="inspection-report-left">
              <div className="admin-card inspection-report-card">
                <h3 className="inspection-report-card-title">Current status</h3>
                <p className={`inspection-report-status inspection-report-status--${report.reportStatus?.toLowerCase()}`}>
                  {statusLabel}
                </p>
              </div>

              <div className="admin-card inspection-report-card">
                <img
                  src={report.bicycleImage}
                  alt={report.bicycleName}
                  className="inspection-report-bike-image"
                />
                <h2 className="inspection-report-bike-name">{report.bicycleName}</h2>
                <p className="inspection-report-bike-meta">
                  {report.bicycleType} · {report.modelYear} · Size {report.size}
                </p>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Owner:</span>
                  <span>{report.owner}</span>
                </div>
                <div className="inspection-report-detail-row">
                  <span className="inspection-report-detail-label">Frame number:</span>
                  <span>{report.frameNumber}</span>
                </div>
              </div>

              <div className="admin-card inspection-report-card">
                <h3 className="inspection-report-card-title">Inspection images</h3>
                <div className="inspection-report-thumbnails">
                  {report.inspectionImages?.slice(0, 4).map((img, idx) => (
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

            <div className="inspection-report-right">
              <div className="admin-card inspection-report-card">
                <h3 className="inspection-report-card-title">Technical inspection checklist</h3>
                <div className="inspection-report-completion-row">
                  <span className="inspection-report-completion">Completed: </span>
                  <input
                    type="number"
                    className="inspection-report-completion-input"
                    min={0}
                    max={100}
                    value={completionPercent}
                    onChange={(e) => {
                      const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setCompletionPercent(Math.min(100, Math.max(0, v)));
                    }}
                    onBlur={(e) => {
                      const v = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                      setCompletionPercent(Number.isNaN(v) ? 0 : Math.min(100, Math.max(0, v)));
                    }}
                  />
                  <span className="inspection-report-completion">%</span>
                </div>
                <div className="inspection-checklist">
                  {checklist.map((group, gIdx) => (
                    <div key={gIdx} className="inspection-checklist-group">
                      <h4 className="inspection-checklist-category">{group.category}</h4>
                      {group.items.map((item, iIdx) => (
                        <div key={iIdx} className="inspection-checklist-item">
                          <span className="inspection-checklist-icon">
                            {renderStatusIcon(item.status)}
                          </span>
                          <div className="inspection-checklist-content">
                            <span className="inspection-checklist-item-title">{item.title}</span>
                            <textarea
                              className="inspection-checklist-desc-input"
                              placeholder="Enter findings / description..."
                              value={item.description ?? ""}
                              onChange={(e) => updateChecklistItem(gIdx, iIdx, "description", e.target.value)}
                              rows={2}
                            />
                            <div className="inspection-checklist-status-row">
                              <select
                                className="inspection-checklist-status-select"
                                value={item.status ?? ""}
                                onChange={(e) => updateChecklistItem(gIdx, iIdx, "status", e.target.value)}
                              >
                                <option value="">Select status</option>
                                {CHECKLIST_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                className="inspection-checklist-label-input"
                                placeholder="e.g. 95%"
                                value={item.statusLabel ?? ""}
                                onChange={(e) => updateChecklistItem(gIdx, iIdx, "statusLabel", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card inspection-report-card">
                <h3 className="inspection-report-card-title">Inspector&apos;s notes</h3>
                <textarea
                  className="inspection-notes-textarea"
                  placeholder="Enter your inspection notes..."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="admin-card inspection-report-card inspection-confirmation">
                <div className="inspection-confirmation-icon">
                  <Settings size={24} color="#fff" />
                </div>
                <h3 className="inspection-report-card-title">Inspection confirmation</h3>
                <p className="inspection-confirmation-text">
                  I confirm that the inspection was carried out in accordance with the applicable standards and that the information above is accurate at the time of inspection.
                </p>
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
        destroyOnClose
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
        okButtonProps={{ className: "inspector-reject-modal-ok" }}
        destroyOnClose
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

      <Footer />
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Typography,
  Button,
  Card,
  Tag,
  Form,
  Input,
  message,
  Spin,
  Alert,
  Empty,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import AdminInspectionModal from "../../../components/AdminInspectionModal";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import disputeService from "../../../services/disputeService";
import orderService from "../../../services/orderService";
import postService from "../../../services/postService";
import {
  DISPUTE_STATUS,
  DISPUTE_STATUS_LABEL,
} from "../../../constants/disputeStatus";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/date";
import { pickListingThumbnailUrl } from "../../../utils/listingThumbnailUrl";
import "../../MyDisputes/index.css";
import "../dashboard/index.css";

function hasNonEmptyText(v) {
  return v != null && String(v).trim() !== "";
}

function toFiniteNumber(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (!hasNonEmptyText(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeInspectionSummary(detail) {
  if (!detail || typeof detail !== "object") return null;
  const nestedCandidates = [
    detail.inspectionReport,
    detail.inspection_report,
    detail.inspection,
    detail.latestInspection,
    detail.latest_inspection,
    detail.lastInspection,
    detail.last_inspection,
    detail.post?.inspectionReport,
    detail.post?.inspection_report,
    detail.post?.inspection,
  ].filter((x) => x && typeof x === "object");
  const root = nestedCandidates[0] ?? detail;
  const resultRaw =
    root.result ?? root.inspectionResult ?? root.inspection_result ?? null;
  const conditionRaw =
    root.overallCondition ??
    root.overall_condition ??
    root.condition ??
    root.inspectionCondition ??
    root.inspection_condition ??
    null;
  const percent = toFiniteNumber(
    root.conditionPercent ??
      root.condition_percent ??
      root.conditionPct ??
      root.condition_pct,
  );
  const notesRaw =
    root.notes ??
    root.inspectorNotes ??
    root.inspector_notes ??
    detail.inspectorNote ??
    detail.inspector_note ??
    null;
  const inspectedAtRaw =
    root.inspectedAt ??
    root.inspected_at ??
    root.completedAt ??
    root.completed_at ??
    root.updatedAt ??
    root.updated_at ??
    null;
  const reportIdRaw =
    root.reportId ??
    root.report_id ??
    root.inspectionReportId ??
    root.inspection_report_id ??
    null;
  const listingIdRaw =
    root.postId ?? root.post_id ?? detail.postId ?? detail.post_id;
  const inspectorNameRaw =
    root.inspectorName ??
    root.inspector_name ??
    root.inspectorFullName ??
    root.inspector_full_name ??
    root.inspector?.fullName ??
    root.inspector?.name ??
    null;
  const inspectorEmailRaw =
    root.inspectorEmail ??
    root.inspector_email ??
    root.inspector?.email ??
    null;

  const result = hasNonEmptyText(resultRaw)
    ? String(resultRaw).trim().toUpperCase()
    : "";
  const condition = hasNonEmptyText(conditionRaw)
    ? String(conditionRaw).trim().replace(/_/g, " ")
    : "";
  const notes = hasNonEmptyText(notesRaw) ? String(notesRaw).trim() : "";
  const inspectedAt = hasNonEmptyText(inspectedAtRaw)
    ? String(inspectedAtRaw).trim()
    : "";
  const reportId = hasNonEmptyText(reportIdRaw)
    ? String(reportIdRaw).trim()
    : "";
  const listingId = hasNonEmptyText(listingIdRaw)
    ? String(listingIdRaw).trim()
    : "";
  const inspectorName = hasNonEmptyText(inspectorNameRaw)
    ? String(inspectorNameRaw).trim()
    : "";
  const inspectorEmail = hasNonEmptyText(inspectorEmailRaw)
    ? String(inspectorEmailRaw).trim()
    : "";

  if (
    !result &&
    !condition &&
    percent == null &&
    !notes &&
    !inspectedAt &&
    !reportId &&
    !listingId &&
    !inspectorName &&
    !inspectorEmail
  ) {
    return null;
  }
  return {
    result,
    condition,
    percent,
    notes,
    inspectedAt,
    reportId,
    listingId,
    inspectorName,
    inspectorEmail,
  };
}

/** Ảnh khiếu nại người mua: BE có thể trả proofImages[], proofImage string, hoặc object có imageUrl */
function collectDisputeProofUrls(row) {
  if (!row || typeof row !== "object") return [];
  const urls = [];
  const push = (v) => {
    if (v == null) return;
    const s = typeof v === "string" ? v.trim() : "";
    if (s) urls.push(s);
  };
  const fromEntry = (item) => {
    if (typeof item === "string") push(item);
    else if (item && typeof item === "object") {
      push(
        item.imageUrl ??
          item.image_url ??
          item.url ??
          item.proofImageUrl ??
          item.proof_image_url ??
          "",
      );
    }
  };
  const list = row.proofImages ?? row.proof_images;
  if (Array.isArray(list)) list.forEach(fromEntry);
  push(row.proofImage ?? row.proof_image);
  return [...new Set(urls)];
}

function normalizePost(row) {
  if (!row || typeof row !== "object") return null;
  const nested = row.post && typeof row.post === "object" ? row.post : {};
  const r = { ...nested, ...row };
  const postId = r.postId ?? r.post_id ?? r.id;
  if (postId == null) return null;
  const images =
    r?.images ?? r?.bicycleImages ?? r?.imageList ?? r?.postImages ?? [];
  const thumb = images.find((i) => i?.isThumbnail);
  const imageUrl =
    thumb?.imageUrl ??
    thumb?.image_url ??
    thumb?.url ??
    images[0]?.imageUrl ??
    images[0]?.image_url ??
    images[0]?.url ??
    null;
  const price = r.price != null ? Number(r.price) : null;
  return {
    postId,
    bikeName: r.bicycleName ?? r.bicycle_name ?? r.title ?? "—",
    brand: r.brandName ?? r.brand_name ?? "—",
    category: r.categoryName ?? r.category_name ?? "—",
    frameSize: r.size ?? r.frameSize ?? r.frame_size ?? "—",
    color: r.bicycleColor ?? r.bicycle_color ?? r.color ?? "—",
    description:
      r.bicycleDescription ?? r.bicycle_description ?? r.description ?? "",
    price,
    imageUrl,
    status: r.postStatus ?? r.post_status ?? r.status ?? "—",
    sellerName: r.sellerFullName ?? r.seller_name ?? r.sellerName ?? "—",
  };
}

export default function InspectorDisputeDetailPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [post, setPost] = useState(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionModalSession, setInspectionModalSession] = useState(0);
  const [previewId, setPreviewId] = useState(null);

  const buyerProofUrls = useMemo(
    () => collectDisputeProofUrls(detail),
    [detail],
  );
  const inspectionSummary = useMemo(
    () => normalizeInspectionSummary(detail),
    [detail],
  );
  const inspectionPostId = useMemo(() => {
    const fromSummary = inspectionSummary?.listingId;
    if (hasNonEmptyText(fromSummary)) return fromSummary;
    return (
      detail?.postId ??
      detail?.post_id ??
      detail?.post?.postId ??
      detail?.post?.id ??
      post?.postId ??
      null
    );
  }, [detail, inspectionSummary, post]);

  const load = useCallback(async () => {
    if (!disputeId || !/^\d+$/.test(String(disputeId))) {
      setDetail(null);
      setPost(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setPost(null);
    try {
      const res = await disputeService.getById(disputeId);
      const d = res?.result ?? res?.data ?? res;
      const row = d && typeof d === "object" ? d : null;
      setDetail(row);

      const postIdFromDispute =
        row?.postId ??
        row?.post_id ??
        row?.post?.postId ??
        row?.post?.id ??
        null;

      const tryLoadPostSafe = async (postId) => {
        if (postId == null) return null;
        try {
          const pRes = await postService.getPostById(postId);
          const raw = pRes?.result ?? pRes?.data ?? pRes;
          return normalizePost(raw);
        } catch {
          return null;
        }
      };

      let loadedPost = null;
      if (postIdFromDispute != null) {
        loadedPost = await tryLoadPostSafe(postIdFromDispute);
      }
      if (!loadedPost && row?.orderId != null) {
        try {
          const oRes = await orderService.getById(row.orderId);
          const o = oRes?.result ?? oRes?.data ?? oRes;
          const embedded = o?.post ?? o?.postInfo ?? null;
          const postIdFromOrder =
            o?.postId ??
            o?.post_id ??
            embedded?.postId ??
            embedded?.post_id ??
            embedded?.id ??
            null;
          if (postIdFromOrder != null) {
            loadedPost = await tryLoadPostSafe(postIdFromOrder);
          }
        } catch {
          /* order không xem được — chỉ thiếu block bài đăng */
        }
      }
      setPost(loadedPost);
    } catch (e) {
      setDetail(null);
      setPost(null);
      message.error(
        e?.message || "Could not load dispute (check ID and permissions).",
      );
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitNote = async (values) => {
    if (!detail?.disputeId) return;
    const note = String(values?.note ?? "").trim();
    if (!note) {
      message.warning("Please enter note content.");
      return;
    }
    try {
      setNoteLoading(true);
      const res = await disputeService.addInspectorNote(detail.disputeId, note);
      const d = res?.result ?? res?.data ?? res;
      setDetail(d && typeof d === "object" ? d : detail);
      message.success("Inspector note saved.");
    } catch (e) {
      message.error(e?.message || "Failed to submit note.");
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <>
      <InspectorLayout>
        <div className="inspector-page">
          <div className="inspector-dashboard">
            <div className="inspector-content">
              {loading ? (
                <div style={{ textAlign: "center", padding: 48 }}>
                  <Spin />
                </div>
              ) : !detail ? (
                <Alert type="warning" title="Dispute not found." />
              ) : (
                <div className="dispute-detail-split">
                  <section className="dispute-detail-col">
                    <Typography.Title
                      level={4}
                      className="dispute-detail-col-title"
                    >
                      Dispute details
                    </Typography.Title>
                    <Card
                      className="admin-card inspector-dispute-main-card"
                      title={`Dispute #${detail.disputeId}`}
                    >
                      <p>
                        <Tag color="blue">
                          {DISPUTE_STATUS_LABEL[detail.status] ?? detail.status}
                        </Tag>
                      </p>
                      <p>
                        <strong>Order</strong> #{detail.orderId ?? "—"} —{" "}
                        {detail.postTitle ?? detail.post?.title ?? "—"}
                      </p>
                      <p>
                        Buyer: {detail.buyerName} · Seller: {detail.sellerName}
                      </p>
                      {detail.reason && (
                        <p>
                          <strong>Reason:</strong> {detail.reason}
                        </p>
                      )}
                      {inspectionSummary && (
                        <div className="inspector-dispute-inspection-block">
                          <div className="inspector-dispute-section-head">
                            <Typography.Text strong>
                              Inspection result
                            </Typography.Text>
                          </div>
                          <div className="inspector-dispute-result-line">
                            {inspectionSummary.result ? (
                              <Tag
                                color={
                                  inspectionSummary.result === "PASS"
                                    ? "success"
                                    : inspectionSummary.result === "FAIL"
                                      ? "error"
                                      : "default"
                                }
                              >
                                {inspectionSummary.result}
                              </Tag>
                            ) : null}
                            {inspectionSummary.percent != null ? (
                              <Typography.Text className="inspector-dispute-score-text">
                                Score: {inspectionSummary.percent}%
                              </Typography.Text>
                            ) : null}
                          </div>
                          {inspectionSummary.condition ? (
                            <p className="inspector-dispute-tight-row">
                              <strong>Condition:</strong>{" "}
                              {inspectionSummary.condition}
                            </p>
                          ) : null}
                          {(inspectionSummary.reportId ||
                            inspectionSummary.listingId ||
                            inspectionSummary.inspectedAt ||
                            inspectionSummary.inspectorName ||
                            inspectionSummary.inspectorEmail) && (
                            <div className="inspector-dispute-meta-block">
                              {inspectionSummary.reportId ? (
                                <p className="inspector-dispute-tight-row">
                                  <strong>Report ID:</strong>{" "}
                                  {inspectionSummary.reportId}
                                </p>
                              ) : null}
                              {inspectionSummary.listingId ? (
                                <p className="inspector-dispute-tight-row">
                                  <strong>Listing ID:</strong> #
                                  {inspectionSummary.listingId}
                                </p>
                              ) : null}
                              {inspectionSummary.inspectedAt ? (
                                <p className="inspector-dispute-tight-row">
                                  <strong>Inspection date:</strong>{" "}
                                  {formatDateTime(
                                    inspectionSummary.inspectedAt,
                                  ) || inspectionSummary.inspectedAt}
                                </p>
                              ) : null}
                              {inspectionSummary.inspectorName ? (
                                <p className="inspector-dispute-tight-row">
                                  <strong>Inspector:</strong>{" "}
                                  {inspectionSummary.inspectorName}
                                  {inspectionSummary.inspectorEmail
                                    ? ` (${inspectionSummary.inspectorEmail})`
                                    : ""}
                                </p>
                              ) : inspectionSummary.inspectorEmail ? (
                                <p className="inspector-dispute-tight-row">
                                  <strong>Inspector email:</strong>{" "}
                                  {inspectionSummary.inspectorEmail}
                                </p>
                              ) : null}
                            </div>
                          )}
                          {inspectionSummary.notes ? (
                            <p className="inspector-dispute-tight-row">
                              <strong>Inspector note:</strong>{" "}
                              {inspectionSummary.notes}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {buyerProofUrls.length > 0 && (
                        <div className="inspector-dispute-proof-block">
                          <Typography.Text strong>
                            Buyer evidence
                          </Typography.Text>
                          <div className="my-dispute-proofs">
                            {buyerProofUrls.map((url, idx) => (
                              <a
                                key={`${url}-${idx}`}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={url}
                                  alt="Buyer dispute evidence"
                                  className="my-dispute-proof-thumb"
                                  referrerPolicy="no-referrer"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {detail.status === DISPUTE_STATUS.OPEN && (
                        <div className="inspector-dispute-note-form-wrap">
                          <Typography.Text strong>
                            Inspector note (moves status to Reviewing)
                          </Typography.Text>
                          <Form
                            key={String(disputeId)}
                            layout="vertical"
                            style={{ marginTop: 10 }}
                            onFinish={submitNote}
                          >
                            <Form.Item
                              name="note"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter note content",
                                },
                              ]}
                            >
                              <Input.TextArea
                                rows={4}
                                placeholder="Conclusion / recommendation"
                              />
                            </Form.Item>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={noteLoading}
                              className="inspector-dispute-submit-btn"
                            >
                              Submit note
                            </Button>
                          </Form>
                        </div>
                      )}

                      {detail.status !== DISPUTE_STATUS.OPEN && (
                        <p className="inspector-dispute-note-disabled-text">
                          Notes can only be submitted when status is OPEN.
                          Current:{" "}
                          {DISPUTE_STATUS_LABEL[detail.status] ?? detail.status}
                        </p>
                      )}
                    </Card>
                  </section>

                  <section className="dispute-detail-col">
                    <Typography.Title
                      level={4}
                      className="dispute-detail-col-title"
                    >
                      Listing details
                    </Typography.Title>
                    {post ? (
                      <Card
                        className="dispute-detail-post-card"
                        variant="outlined"
                      >
                        <div className="dispute-detail-post-image-wrap">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.bikeName}
                              className="dispute-detail-post-image"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="dispute-detail-post-image-placeholder">
                              No image
                            </div>
                          )}
                        </div>
                        <Typography.Title
                          level={5}
                          style={{ marginTop: 16, marginBottom: 8 }}
                        >
                          {post.bikeName}
                        </Typography.Title>
                        {post.price != null && (
                          <Typography.Text strong style={{ fontSize: 18 }}>
                            {formatCurrency(post.price)}
                          </Typography.Text>
                        )}
                        <dl className="dispute-detail-dl">
                          <div>
                            <dt>Brand</dt>
                            <dd>{post.brand}</dd>
                          </div>
                          <div>
                            <dt>Category</dt>
                            <dd>{post.category}</dd>
                          </div>
                          <div>
                            <dt>Size</dt>
                            <dd>{post.frameSize}</dd>
                          </div>
                          <div>
                            <dt>Color</dt>
                            <dd>{post.color}</dd>
                          </div>
                          <div>
                            <dt>Status</dt>
                            <dd>{post.status}</dd>
                          </div>
                          <div>
                            <dt>Seller</dt>
                            <dd>{post.sellerName}</dd>
                          </div>
                        </dl>
                        {post.description ? (
                          <Typography.Paragraph
                            type="secondary"
                            ellipsis={{ rows: 6, expandable: true }}
                            style={{ marginTop: 12 }}
                          >
                            {post.description}
                          </Typography.Paragraph>
                        ) : null}
                        <div className="inspector-dispute-actions-row">
                          <Button
                            type="primary"
                            onClick={() => setPreviewId(post.postId)}
                            className="inspector-dispute-action-btn"
                          >
                            Open full product page
                          </Button>
                          {inspectionPostId != null ? (
                            <Button
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => {
                                setInspectionModalSession(Date.now());
                                setInspectionModalOpen(true);
                              }}
                              className="inspector-dispute-action-btn"
                            >
                              View inspection report
                            </Button>
                          ) : null}
                        </div>
                      </Card>
                    ) : (
                      <Card variant="outlined">
                        <Empty
                          description="No listing available (removed, hidden, or API returned no data)."
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                        <Typography.Paragraph type="secondary">
                          Order #{detail.orderId ?? "—"} —{" "}
                          {detail.postTitle ?? "No title"}
                        </Typography.Paragraph>
                        {(() => {
                          const pid =
                            detail?.postId ??
                            detail?.post_id ??
                            detail?.post?.postId ??
                            detail?.post?.id;
                          return pid != null ? (
                            <Link to={`/product/${pid}`}>
                              <Button type="default" style={{ marginTop: 8 }}>
                                Try opening product page (post #{pid})
                              </Button>
                            </Link>
                          ) : null;
                        })()}
                      </Card>
                    )}
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      </InspectorLayout>
      <AdminInspectionModal
        key={
          inspectionPostId != null
            ? `${inspectionPostId}-${inspectionModalSession}`
            : "inspector-dispute-inspection-closed"
        }
        postId={inspectionPostId}
        listingTitle={post?.bikeName ?? detail?.postTitle ?? null}
        posterHint={post?.sellerName ?? detail?.sellerName ?? null}
        listingMeta={
          [post?.brand, post?.category, post?.frameSize]
            .filter((x) => hasNonEmptyText(x) && x !== "—")
            .join(" · ") || null
        }
        listingThumbnailUrl={pickListingThumbnailUrl(post)}
        open={inspectionModalOpen && inspectionPostId != null}
        onClose={() => setInspectionModalOpen(false)}
      />
      <ProductPreviewModal
        postId={previewId}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
      />
    </>
  );
}

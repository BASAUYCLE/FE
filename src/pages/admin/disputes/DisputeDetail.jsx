import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Button,
  Card,
  Tag,
  message,
  Space,
  Alert,
  Spin,
  Popconfirm,
  Typography,
  Divider,
  Empty,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import disputeService from "../../../services/disputeService";
import orderService from "../../../services/orderService";
import postService from "../../../services/postService";
import {
  DISPUTE_STATUS,
  DISPUTE_STATUS_LABEL,
  disputeStatusTagColor,
} from "../../../constants/disputeStatus";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../../constants/orderStatus";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDateTime } from "../../../utils/date";
import "../../MyDisputes/index.css";
import "../dashboard/index.css";

function hasNonEmptyText(v) {
  return v != null && String(v).trim() !== "";
}

function adminOutcomeSummary(status) {
  const s = String(status ?? "").toUpperCase();
  switch (s) {
    case DISPUTE_STATUS.OPEN:
      return "No decision from admin yet.";
    case DISPUTE_STATUS.REVIEWING:
      return "Admin is reviewing this case.";
    case DISPUTE_STATUS.APPROVED:
      return "Admin approved the dispute (item return allowed).";
    case DISPUTE_STATUS.RETURN_SHIPPED:
      return "Approved - buyer shipped the return; waiting for seller confirmation.";
    case DISPUTE_STATUS.RESOLVED:
      return "Case has been resolved.";
    case DISPUTE_STATUS.REJECTED:
      return "Admin rejected the dispute.";
    default:
      return "—";
  }
}

function normalizePost(row) {
  if (!row || typeof row !== "object") return null;
  const postId = row.postId ?? row.post_id ?? row.id;
  if (postId == null) return null;
  const images =
    row?.images ??
    row?.bicycleImages ??
    row?.imageList ??
    row?.postImages ??
    [];
  const thumb = images.find((i) => i?.isThumbnail);
  const imageUrl =
    thumb?.imageUrl ??
    thumb?.image_url ??
    thumb?.url ??
    images[0]?.imageUrl ??
    images[0]?.image_url ??
    images[0]?.url ??
    null;
  const price = row.price != null ? Number(row.price) : null;
  return {
    postId,
    bikeName: row.bicycleName ?? row.bicycle_name ?? row.title ?? "—",
    brand: row.brandName ?? row.brand_name ?? "—",
    category: row.categoryName ?? row.category_name ?? "—",
    frameSize: row.size ?? row.frameSize ?? row.frame_size ?? "—",
    color: row.bicycleColor ?? row.bicycle_color ?? row.color ?? "—",
    description:
      row.bicycleDescription ??
      row.bicycle_description ??
      row.description ??
      "",
    price,
    imageUrl,
    status: row.postStatus ?? row.post_status ?? row.status ?? "—",
    sellerName: row.sellerFullName ?? row.seller_name ?? row.sellerName ?? "—",
  };
}

function normalizeOrder(row) {
  if (!row || typeof row !== "object") return null;
  return {
    orderId: row.orderId ?? row.order_id,
    postId: row.postId ?? row.post_id,
    postTitle: row.postTitle ?? row.post_title,
    buyerName: row.buyerName ?? row.buyer_name,
    sellerName: row.sellerName ?? row.seller_name,
    fullAddress: row.fullAddress ?? row.full_address,
    totalPrice: row.totalPrice != null ? Number(row.totalPrice) : null,
    depositAmount: row.depositAmount != null ? Number(row.depositAmount) : null,
    orderStatus: row.orderStatus ?? row.order_status ?? row.status,
    shippingMethod: row.shippingMethod ?? row.shipping_method,
    shippingTrackingNumber:
      row.shippingTrackingNumber ?? row.shipping_tracking_number,
    proofImage: row.proofImage ?? row.proof_image,
    shippedAt: row.shippedAt ?? row.shipped_at,
    deliveredAt: row.deliveredAt ?? row.delivered_at,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };
}

export default function AdminDisputeDetailPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role ?? user?.userRole ?? "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [post, setPost] = useState(null);
  const [order, setOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!disputeId || !/^\d+$/.test(String(disputeId))) {
      setDetail(null);
      setPost(null);
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await disputeService.getById(disputeId);
      const d = res?.result ?? res?.data ?? res;
      if (!d || typeof d !== "object") {
        setDetail(null);
        setPost(null);
        setOrder(null);
        return;
      }
      setDetail(d);

      let orderRow = null;
      try {
        const oRes = await orderService.getById(d.orderId);
        orderRow = normalizeOrder(oRes?.result ?? oRes?.data ?? oRes);
      } catch {
        orderRow = null;
      }
      setOrder(orderRow);

      const postId = orderRow?.postId;
      if (postId != null) {
        try {
          const pRes = await postService.getPostById(postId);
          const raw = pRes?.result ?? pRes?.data ?? pRes;
          setPost(normalizePost(raw));
        } catch {
          setPost(null);
        }
      } else {
        setPost(null);
      }
    } catch (e) {
      setDetail(null);
      setPost(null);
      setOrder(null);
      message.error(e?.message || "Cannot load dispute.");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    load();
  }, [load]);

  const runApprove = async () => {
    if (!detail?.disputeId) return;
    setActionLoading(true);
    try {
      await disputeService.adminApprove(detail.disputeId, undefined);
      message.success("Dispute approved.");
      await load();
    } catch (e) {
      message.error(e?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const runReject = async () => {
    if (!detail?.disputeId) return;
    setActionLoading(true);
    try {
      await disputeService.adminReject(detail.disputeId, undefined);
      message.success("Dispute rejected.");
      await load();
    } catch (e) {
      message.error(e?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="admin-page-shell">
          <Alert type="error" message="Admin only" />
        </div>
      </AdminLayout>
    );
  }

  const inspectorNoteRaw =
    detail?.inspectorNote ?? detail?.inspector_note ?? "";
  const hasInspectorNote = hasNonEmptyText(inspectorNoteRaw);
  /** Chỉ sau khi inspector gửi ghi chú (BE chuyển sang REVIEWING) admin mới được quyết định. */
  const canModerate =
    detail && detail.status === DISPUTE_STATUS.REVIEWING && hasInspectorNote;

  const orderStatusLabel =
    order?.orderStatus != null
      ? (ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus)
      : "—";
  const orderTagColor =
    order?.orderStatus != null
      ? (ORDER_STATUS_TAG_COLOR[order.orderStatus] ?? "default")
      : "default";

  return (
    <AdminLayout>
      <div className="admin-page-shell dispute-detail-container">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin-disputes")}
          style={{ marginBottom: 12 }}
        >
          Back to list
        </Button>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin />
          </div>
        ) : !detail ? (
          <Alert type="warning" message="Dispute not found." />
        ) : (
          <>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              Dispute #{detail.disputeId}
            </Typography.Title>
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              Listing · Order · Case — review everything before approving or
              rejecting.
            </Typography.Text>

            <div className="dispute-detail-split dispute-detail-split--three">
              {/* ─── Post ─── */}
              <section className="dispute-detail-col">
                <Typography.Title
                  level={4}
                  className="dispute-detail-col-title"
                >
                  Listing detail
                </Typography.Title>
                {post ? (
                  <Card className="dispute-detail-post-card" bordered>
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
                    <Link to={`/product/${post.postId}`}>
                      <Button type="primary" style={{ marginTop: 12 }}>
                        Open full product page
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <Card>
                    <Empty
                      description="Could not load listing."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Typography.Paragraph type="secondary">
                      Order #{detail.orderId} — {detail.postTitle}
                    </Typography.Paragraph>
                  </Card>
                )}
              </section>

              {/* ─── Order ─── */}
              <section className="dispute-detail-col">
                <Typography.Title
                  level={4}
                  className="dispute-detail-col-title"
                >
                  Order detail
                </Typography.Title>
                {order ? (
                  <Card bordered>
                    <Space wrap style={{ marginBottom: 0 }}>
                      <Typography.Text strong>
                        Order #{order.orderId}
                      </Typography.Text>
                      <Tag color={orderTagColor}>{orderStatusLabel}</Tag>
                    </Space>
                    <dl className="dispute-detail-dl" style={{ marginTop: 12 }}>
                      <div>
                        <dt>Listing</dt>
                        <dd>{order.postTitle ?? detail.postTitle ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Buyer</dt>
                        <dd>{order.buyerName ?? detail.buyerName ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd>{order.sellerName ?? detail.sellerName ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Total</dt>
                        <dd>
                          {order.totalPrice != null
                            ? formatCurrency(order.totalPrice)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Deposit</dt>
                        <dd>
                          {order.depositAmount != null
                            ? formatCurrency(order.depositAmount)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Address</dt>
                        <dd>{order.fullAddress ?? "—"}</dd>
                      </div>
                      <div>
                        <dt>Shipping</dt>
                        <dd>
                          {order.shippingMethod ?? "—"}
                          {order.shippingTrackingNumber
                            ? ` · ${order.shippingTrackingNumber}`
                            : ""}
                        </dd>
                      </div>
                      <div>
                        <dt>Created</dt>
                        <dd>
                          {order.createdAt
                            ? formatDateTime(order.createdAt)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Shipped</dt>
                        <dd>
                          {order.shippedAt
                            ? formatDateTime(order.shippedAt)
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt>Delivered</dt>
                        <dd>
                          {order.deliveredAt
                            ? formatDateTime(order.deliveredAt)
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                    {order.proofImage ? (
                      <div style={{ marginTop: 12 }}>
                        <Typography.Text strong>Shipping proof</Typography.Text>
                        <div className="my-dispute-proofs">
                          <a
                            href={order.proofImage}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={order.proofImage}
                              alt="shipping proof"
                              className="my-dispute-proof-thumb"
                            />
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                ) : (
                  <Card>
                    <Empty
                      description="Could not load order."
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <Typography.Paragraph type="secondary">
                      Order #{detail.orderId}
                    </Typography.Paragraph>
                  </Card>
                )}
              </section>

              {/* ─── Dispute ─── */}
              <section className="dispute-detail-col dispute-detail-col--case">
                <Typography.Title
                  level={4}
                  className="dispute-detail-col-title"
                >
                  Dispute case
                </Typography.Title>
                <Card
                  className="my-dispute-card my-dispute-card--highlight dispute-detail-case-card"
                  title={
                    <Space wrap>
                      <span>Dispute #{detail.disputeId}</span>
                      <Tag color={disputeStatusTagColor(detail.status)}>
                        {DISPUTE_STATUS_LABEL[detail.status] ?? detail.status}
                      </Tag>
                    </Space>
                  }
                >
                  <p>
                    <strong>Order</strong> #{detail.orderId} —{" "}
                    {detail.postTitle}
                  </p>
                  <p className="my-dispute-meta">
                    Buyer: {detail.buyerName} · Seller: {detail.sellerName}
                  </p>
                  {detail.reason && (
                    <p>
                      <strong>Reason:</strong> {detail.reason}
                    </p>
                  )}
                  {Array.isArray(detail.proofImages) &&
                    detail.proofImages.length > 0 && (
                      <div className="my-dispute-proofs">
                        {detail.proofImages.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={url}
                              alt="proof"
                              className="my-dispute-proof-thumb"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                  <Divider style={{ margin: "16px 0 12px" }} />
                  <Typography.Title
                    level={5}
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Inspector note
                  </Typography.Title>
                  {hasInspectorNote ? (
                    <Typography.Paragraph
                      style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                    >
                      {inspectorNoteRaw}
                    </Typography.Paragraph>
                  ) : (
                    <Typography.Text type="secondary">
                      None yet — inspector must submit a note before admin can
                      decide.
                    </Typography.Text>
                  )}

                  <Divider style={{ margin: "16px 0 12px" }} />
                  <Typography.Title
                    level={5}
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Admin outcome
                  </Typography.Title>
                  <Typography.Paragraph strong style={{ marginBottom: 8 }}>
                    {adminOutcomeSummary(detail.status)}
                  </Typography.Paragraph>
                  {hasNonEmptyText(detail.adminNote) ? (
                    <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                      <Typography.Text strong>Note: </Typography.Text>
                      {detail.adminNote}
                    </Typography.Paragraph>
                  ) : null}
                  {detail.resolvedAt != null && detail.resolvedAt !== "" && (
                    <Typography.Text
                      type="secondary"
                      style={{ display: "block" }}
                    >
                      Resolved at: {formatDateTime(detail.resolvedAt)}
                    </Typography.Text>
                  )}
                  {(detail.shippingProvider || detail.trackingCode) && (
                    <p style={{ marginTop: 8 }}>
                      <strong>Return ship:</strong> {detail.shippingProvider} /{" "}
                      {detail.trackingCode}
                    </p>
                  )}

                  {detail.status === DISPUTE_STATUS.OPEN && (
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginTop: 16 }}
                      message="Waiting for inspector"
                      description="This dispute is still OPEN. The inspector must write a note first; then it moves to Reviewing and you can approve or reject."
                    />
                  )}
                  {detail.status === DISPUTE_STATUS.REVIEWING &&
                    !hasInspectorNote && (
                      <Alert
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                        message="Inspector note required"
                        description="Status is Reviewing but no inspector note is stored. Approve and Reject stay disabled until a note is present."
                      />
                    )}

                  <Space style={{ marginTop: 20 }} wrap>
                    <Popconfirm
                      title="Approve this dispute?"
                      description="Buyer will be allowed to return the item per platform rules."
                      onConfirm={runApprove}
                      okText="Approve"
                      cancelText="Cancel"
                      disabled={!canModerate || actionLoading}
                    >
                      <Button
                        type="primary"
                        disabled={!canModerate}
                        loading={actionLoading}
                      >
                        Approve
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title="Reject this dispute?"
                      description="The case will be closed; buyer claim will not proceed."
                      onConfirm={runReject}
                      okText="Reject"
                      okButtonProps={{ danger: true }}
                      cancelText="Cancel"
                      disabled={!canModerate || actionLoading}
                    >
                      <Button
                        danger
                        disabled={!canModerate}
                        loading={actionLoading}
                      >
                        Reject
                      </Button>
                    </Popconfirm>
                  </Space>
                </Card>
              </section>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

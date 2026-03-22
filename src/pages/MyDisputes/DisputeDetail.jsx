import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  Tag,
  Button,
  Spin,
  Empty,
  Space,
  Modal,
  Form,
  Input,
  App,
  Divider,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import disputeService from "../../services/disputeService";
import orderService from "../../services/orderService";
import postService from "../../services/postService";
import {
  DISPUTE_STATUS,
  DISPUTE_STATUS_LABEL,
} from "../../constants/disputeStatus";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDateTime } from "../../utils/date";
import ReturnShippingReceiptFormItem from "../../components/disputes/ReturnShippingReceiptUpload";
import { resolveShippingReceiptUrl } from "../../utils/returnShippingReceiptUpload";
import "../Orders/index.css";
import "./index.css";

function hasNonEmptyText(v) {
  return v != null && String(v).trim() !== "";
}

/** Mô tả kết quả / giai đoạn xử lý admin theo trạng thái (BE DisputeStatus). */
function adminOutcomeSummary(status) {
  const s = String(status ?? "").toUpperCase();
  switch (s) {
    case DISPUTE_STATUS.OPEN:
      return "Chưa có quyết định từ admin.";
    case DISPUTE_STATUS.REVIEWING:
      return "Admin đang xem xét vụ việc.";
    case DISPUTE_STATUS.APPROVED:
      return "Admin đã chấp thuận khiếu nại (cho phép trả hàng).";
    case DISPUTE_STATUS.RETURN_SHIPPED:
      return "Đã chấp thuận — người mua đã gửi trả hàng; chờ người bán xác nhận nhận hàng.";
    case DISPUTE_STATUS.RESOLVED:
      return "Vụ việc đã được giải quyết (đóng case).";
    case DISPUTE_STATUS.REJECTED:
      return "Admin đã từ chối khiếu nại.";
    default:
      return "—";
  }
}

function statusColor(st) {
  switch (st) {
    case DISPUTE_STATUS.OPEN:
      return "orange";
    case DISPUTE_STATUS.REVIEWING:
      return "gold";
    case DISPUTE_STATUS.APPROVED:
      return "blue";
    case DISPUTE_STATUS.RETURN_SHIPPED:
      return "geekblue";
    case DISPUTE_STATUS.RESOLVED:
      return "green";
    case DISPUTE_STATUS.REJECTED:
      return "default";
    default:
      return "default";
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

export default function DisputeDetailPage() {
  const { message } = App.useApp();
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrders, refreshSales } = useOrders();

  const myId = user?.userId ?? user?.id ?? user?.user_id ?? null;

  const [loading, setLoading] = useState(true);
  const [dispute, setDispute] = useState(null);
  const [post, setPost] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [shipModal, setShipModal] = useState(false);
  const [shipLoading, setShipLoading] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    const id = String(disputeId || "").trim();
    if (!/^\d+$/.test(id)) {
      setLoadError("Invalid dispute ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const dRes = await disputeService.getById(id);
      const d = dRes?.result ?? dRes?.data ?? dRes;
      if (!d || typeof d !== "object") {
        setDispute(null);
        setPost(null);
        setLoadError("Dispute not found.");
        return;
      }
      setDispute(d);

      const orderId = d.orderId;
      let postId = null;
      try {
        const oRes = await orderService.getById(orderId);
        const o = oRes?.result ?? oRes?.data ?? oRes;
        postId = o?.postId ?? o?.post_id ?? null;
      } catch {
        /* order detail optional */
      }

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
      setDispute(null);
      setPost(null);
      setLoadError(e?.message || "Could not load dispute.");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    load();
  }, [load]);

  const openShipModal = () => {
    form.resetFields();
    setShipModal(true);
  };

  const submitShipping = async () => {
    if (!dispute) return;
    try {
      const v = await form.validateFields();
      setShipLoading(true);
      let shippingReceiptUrl;
      try {
        shippingReceiptUrl = await resolveShippingReceiptUrl(v.shippingReceipt);
      } catch (upErr) {
        message.error(upErr?.message || "Upload ảnh thất bại.");
        setShipLoading(false);
        return;
      }
      await disputeService.updateShippingInfo(dispute.disputeId, {
        shippingProvider: v.shippingProvider,
        trackingCode: v.trackingCode,
        shippingReceiptUrl,
      });
      message.success("Return shipping info saved.");
      setShipModal(false);
      await load();
      refreshOrders?.();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || "Update failed.");
    } finally {
      setShipLoading(false);
    }
  };

  const confirmReturn = async () => {
    if (!dispute) return;
    try {
      await disputeService.confirmReturnReceipt(dispute.disputeId);
      message.success(
        "Return confirmed. Refund flow continues per platform rules.",
      );
      await load();
      refreshSales?.();
      refreshOrders?.();
    } catch (e) {
      message.error(e?.message || "Could not confirm.");
    }
  };

  const isBuyer =
    dispute && myId != null && String(dispute.buyerId) === String(myId);
  const isSeller =
    dispute && myId != null && String(dispute.sellerId) === String(myId);

  return (
    <div className="orders-page dispute-detail-page">
      <Header />
      <main className="orders-main">
        <div className="orders-container dispute-detail-container">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/my-disputes")}
            style={{ marginBottom: 8, paddingLeft: 0 }}
          >
            Back to disputes
          </Button>

          {loading ? (
            <div style={{ textAlign: "center", padding: 64 }}>
              <Spin size="large" />
            </div>
          ) : loadError || !dispute ? (
            <Empty
              description={loadError || "Dispute not found"}
              style={{ padding: 48 }}
            >
              <Link to="/my-disputes">
                <Button type="primary">Return to list</Button>
              </Link>
            </Empty>
          ) : (
            <>
              <Typography.Title
                level={2}
                className="title"
                style={{ marginBottom: 8 }}
              >
                Dispute #{dispute.disputeId}
              </Typography.Title>
              <Typography.Text type="secondary" className="orders-subtitle">
                Listing on the left · Case details on the right
              </Typography.Text>

              <div className="dispute-detail-split">
                <section className="dispute-detail-col dispute-detail-col--post">
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
                        description="Could not load listing (order or post unavailable)."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                      <Typography.Paragraph type="secondary">
                        Order #{dispute.orderId} — {dispute.postTitle}
                      </Typography.Paragraph>
                    </Card>
                  )}
                </section>

                <section className="dispute-detail-col dispute-detail-col--case">
                  <Typography.Title
                    level={4}
                    className="dispute-detail-col-title"
                  >
                    Dispute detail
                  </Typography.Title>
                  <Card
                    className="my-dispute-card my-dispute-card--highlight dispute-detail-case-card"
                    title={
                      <Space wrap>
                        <span>Dispute #{dispute.disputeId}</span>
                        <Tag color={statusColor(dispute.status)}>
                          {DISPUTE_STATUS_LABEL[dispute.status] ??
                            dispute.status}
                        </Tag>
                      </Space>
                    }
                  >
                    <p>
                      <strong>Order</strong> #{dispute.orderId} —{" "}
                      {dispute.postTitle}
                    </p>
                    <p className="my-dispute-meta">
                      Buyer: {dispute.buyerName} · Seller: {dispute.sellerName}
                    </p>
                    {dispute.reason && (
                      <p>
                        <strong>Reason:</strong> {dispute.reason}
                      </p>
                    )}
                    {Array.isArray(dispute.proofImages) &&
                      dispute.proofImages.length > 0 && (
                        <div className="my-dispute-proofs">
                          {dispute.proofImages.map((url) => (
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
                      Ghi chú kiểm định viên
                    </Typography.Title>
                    {hasNonEmptyText(dispute.inspectorNote) ? (
                      <Typography.Paragraph
                        style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                      >
                        {dispute.inspectorNote}
                      </Typography.Paragraph>
                    ) : (
                      <Typography.Text type="secondary">
                        Chưa có ghi chú từ kiểm định viên.
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
                      Kết quả xử lý từ admin
                    </Typography.Title>
                    <Typography.Paragraph
                      strong
                      style={{ marginBottom: 8, marginTop: 0 }}
                    >
                      {adminOutcomeSummary(dispute.status)}
                    </Typography.Paragraph>
                    {hasNonEmptyText(dispute.adminNote) ? (
                      <Typography.Paragraph
                        style={{ marginBottom: 8, whiteSpace: "pre-wrap" }}
                      >
                        <Typography.Text strong>
                          Ghi chú / lý do từ admin:{" "}
                        </Typography.Text>
                        {dispute.adminNote}
                      </Typography.Paragraph>
                    ) : (
                      (String(dispute.status || "").toUpperCase() ===
                        DISPUTE_STATUS.RESOLVED ||
                        String(dispute.status || "").toUpperCase() ===
                          DISPUTE_STATUS.REJECTED ||
                        String(dispute.status || "").toUpperCase() ===
                          DISPUTE_STATUS.APPROVED) && (
                        <Typography.Text
                          type="secondary"
                          style={{ display: "block", marginBottom: 8 }}
                        >
                          Không có ghi chú bổ sung từ admin.
                        </Typography.Text>
                      )
                    )}
                    {dispute.resolvedAt != null &&
                      dispute.resolvedAt !== "" && (
                        <Typography.Text type="secondary">
                          Thời điểm kết thúc:{" "}
                          {formatDateTime(dispute.resolvedAt)}
                        </Typography.Text>
                      )}

                    {(dispute.shippingProvider || dispute.trackingCode) && (
                      <p>
                        <strong>Return ship:</strong> {dispute.shippingProvider}{" "}
                        / {dispute.trackingCode}
                      </p>
                    )}

                    <div style={{ marginTop: 16 }}>
                      {isBuyer &&
                        dispute.status === DISPUTE_STATUS.APPROVED && (
                          <Button type="primary" onClick={openShipModal}>
                            Add return shipping info
                          </Button>
                        )}
                      {isSeller &&
                        dispute.status === DISPUTE_STATUS.RETURN_SHIPPED && (
                          <Button type="primary" onClick={confirmReturn}>
                            Confirm return received
                          </Button>
                        )}
                    </div>
                  </Card>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <Modal
        title="Return shipping details"
        open={shipModal}
        onCancel={() => setShipModal(false)}
        onOk={submitShipping}
        confirmLoading={shipLoading}
        destroyOnHidden
        centered
        zIndex={1300}
        styles={{
          body: {
            maxHeight: "min(70vh, 520px)",
            overflowY: "auto",
            paddingTop: 8,
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="shippingProvider"
            label="Carrier"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. GHTK, GHN" />
          </Form.Item>
          <Form.Item
            name="trackingCode"
            label="Tracking code"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <ReturnShippingReceiptFormItem />
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Modal, Form, Input, Upload, Button, Divider, Tag, message } from "antd";
import { UploadOutlined, TruckOutlined } from "@ant-design/icons";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TAG_COLOR,
} from "../../constants/orderStatus";
import { useOrders } from "../../contexts/OrderContext";
import { useNotifications } from "../../contexts/useNotifications";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ConfirmShippingModal({ open, onClose, order }) {
  const { confirmShipping } = useOrders();
  const [form] = Form.useForm();
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      await confirmShipping(order.orderId, {
        shippingMethod:         values.shippingMethod || "",
        shippingTrackingNumber: values.shippingTrackingNumber || "",
        proofImageFile:         proofFile,
      });
      message.success("Shipping confirmed successfully!");
      addNotification?.({
        title: "Shipping confirmed",
        message: `Order #${order.orderId} has been marked as shipped.`,
        type: "success",
      });
      form.resetFields();
      setProofFile(null);
      onClose?.();
    } catch {
      message.error("Could not confirm shipping. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    form.resetFields();
    setProofFile(null);
    onClose?.();
  };

  const uploadProps = {
    maxCount: 1,
    accept: "image/*",
    beforeUpload: (file) => {
      setProofFile(file);
      return false;
    },
    onRemove: () => setProofFile(null),
    fileList: proofFile ? [{ uid: "-1", name: proofFile.name, status: "done" }] : [],
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={440}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      {/* Header */}
      <div style={{ padding: "14px 18px 0" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          <TruckOutlined style={{ marginRight: 8, color: "#00ccad" }} />
          Confirm shipping
        </h3>
      </div>
      <Divider style={{ margin: "10px 0 0" }} />

      <div style={{ padding: "12px 18px" }}>
        {/* Product info */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {order?.image ? (
            <img
              src={order.image}
              alt={order?.bikeName}
              referrerPolicy="no-referrer"
              style={{
                width: 56, height: 44, objectFit: "cover", borderRadius: 6,
                border: "1px solid #e5e7eb", flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 56, height: 44, borderRadius: 6, background: "#f1f5f9",
              border: "1px solid #e5e7eb", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, color: "#94a3b8",
            }}>
              No img
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#1a1a1a",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {order?.bikeName ?? "—"}
            </div>
            <Tag
              color={ORDER_STATUS_TAG_COLOR[order?.status]}
              style={{
                fontSize: 11,
                lineHeight: "18px",
                padding: "0 5px",
                marginTop: 3,
              }}
            >
              {ORDER_STATUS_LABEL[order?.status] ?? order?.status}
            </Tag>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              {formatCurrency(order?.totalPrice ?? 0)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#94a3b8",
                marginTop: 4,
              }}
            >
              <span style={{ fontWeight: 500, color: "#64748b" }}>
                Recipient address:
              </span>{" "}
              <span>
                {order?.shippingAddress && order.shippingAddress.trim()
                  ? order.shippingAddress
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <Form form={form} layout="vertical" size="small">
          <Form.Item
            name="shippingMethod"
            label={<span style={{ fontSize: 12, fontWeight: 600 }}>Shipping carrier</span>}
          >
            <Input placeholder="e.g. GHTK, GHN, Viettel Post..." style={{ fontSize: 13 }} />
          </Form.Item>

          <Form.Item
            name="shippingTrackingNumber"
            label={<span style={{ fontSize: 12, fontWeight: 600 }}>Tracking number</span>}
          >
            <Input placeholder="e.g. GHTK123456789" style={{ fontSize: 13 }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: 12, fontWeight: 600 }}>Shipping proof (photo)</span>}
            style={{ marginBottom: 0 }}
          >
            <Upload {...uploadProps}>
              <Button size="small" icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
              Receipt, shipping slip, etc.
            </div>
          </Form.Item>
        </Form>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", gap: 10, padding: "0 18px 14px" }}>
        <button
          type="button"
          onClick={handleClose}
          disabled={submitting}
          style={{
            flex: 1, padding: "9px 0", border: "1px solid #d1d5db",
            borderRadius: 8, background: "#fff", fontWeight: 600,
            fontSize: 13, color: "#475569", cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 2, padding: "9px 0", border: "none", borderRadius: 8,
            background: submitting ? "#94a3b8" : "#00ccad",
            boxShadow: submitting ? "none" : "0 8px 20px rgba(0, 204, 173, 0.35)",
            fontWeight: 700, fontSize: 13, color: "#0f172a",
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting ? "Processing..." : "Confirm shipping"}
        </button>
      </div>
    </Modal>
  );
}

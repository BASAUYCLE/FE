import { useState } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import disputeService from "../../services/disputeService";

export default function OpenDisputeModal({ open, onClose, order, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const file = values.proofImage?.[0];
      if (!file?.originFileObj && !(file instanceof File)) {
        message.error("Please upload a proof image.");
        return;
      }
      setLoading(true);
      await disputeService.createDispute({
        orderId: order.orderId,
        reason: values.reason ?? "",
        proofImageFile: file?.originFileObj ?? file,
      });
      message.success("Dispute opened. Track it under My Disputes.");
      form.resetFields();
      onSuccess?.();
      onClose?.();
    } catch (e) {
      if (e?.errorFields) return;
      const msg =
        typeof e?.message === "string"
          ? e.message
          : "Could not open dispute. Check order status and dispute window.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Open dispute"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose?.();
      }}
      onOk={handleOk}
      okText="Submit"
      confirmLoading={loading}
      destroyOnClose
      width={480}
    >
      <p style={{ marginBottom: 12, color: "#64748b", fontSize: 13 }}>
        Describe the issue and upload one clear photo as evidence. The backend
        requires an image and validates eligibility (order status and dispute
        window).
      </p>
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Reason"
          rules={[{ required: true, message: "Please describe the problem" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="What went wrong?"
            maxLength={2000}
            showCount
          />
        </Form.Item>
        <Form.Item
          name="proofImage"
          label="Proof image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[
            {
              required: true,
              message: "Upload one image",
            },
          ]}
        >
          <Upload maxCount={1} beforeUpload={() => false} accept="image/*">
            <Button icon={<UploadOutlined />}>Select image</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}

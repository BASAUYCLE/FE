import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import disputeService from "../../../services/disputeService";
import {
  DISPUTE_STATUS,
  DISPUTE_STATUS_LABEL,
} from "../../../constants/disputeStatus";
import "../dashboard/index.css";

export default function InspectorDisputeDetailPage() {
  const { disputeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [noteForm] = Form.useForm();
  const [noteLoading, setNoteLoading] = useState(false);

  const load = useCallback(async () => {
    if (!disputeId || !/^\d+$/.test(String(disputeId))) {
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await disputeService.getById(disputeId);
      const d = res?.result ?? res?.data ?? res;
      setDetail(d && typeof d === "object" ? d : null);
    } catch (e) {
      setDetail(null);
      message.error(
        e?.message || "Không tải được tranh chấp (kiểm tra ID và quyền).",
      );
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    noteForm.resetFields();
  }, [disputeId, noteForm]);

  const submitNote = async () => {
    if (!detail?.disputeId) return;
    try {
      const v = await noteForm.validateFields();
      setNoteLoading(true);
      const res = await disputeService.addInspectorNote(
        detail.disputeId,
        v.note,
      );
      const d = res?.result ?? res?.data ?? res;
      setDetail(d && typeof d === "object" ? d : detail);
      message.success("Đã lưu ghi chú kiểm định.");
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || "Gửi ghi chú thất bại.");
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <InspectorLayout>
      <div className="inspector-page">
        <div className="inspector-dashboard">
          <div className="inspector-content">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/inspector/disputes")}
              style={{ marginBottom: 12 }}
            >
              Quay lại danh sách
            </Button>

            {loading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin />
              </div>
            ) : !detail ? (
              <Alert type="warning" message="Không tìm thấy tranh chấp." />
            ) : (
              <Card
                className="admin-card"
                title={`Dispute #${detail.disputeId}`}
              >
                <p>
                  <Tag color="blue">
                    {DISPUTE_STATUS_LABEL[detail.status] ?? detail.status}
                  </Tag>
                </p>
                <p>
                  <strong>Order</strong> #{detail.orderId} — {detail.postTitle}
                </p>
                <p>
                  Buyer: {detail.buyerName} · Seller: {detail.sellerName}
                </p>
                {detail.reason && (
                  <p>
                    <strong>Reason:</strong> {detail.reason}
                  </p>
                )}

                {detail.status === DISPUTE_STATUS.OPEN && (
                  <div style={{ marginTop: 16 }}>
                    <Typography.Text strong>
                      Ghi chú kiểm định (chuyển sang Reviewing)
                    </Typography.Text>
                    <Form
                      form={noteForm}
                      layout="vertical"
                      style={{ marginTop: 8 }}
                    >
                      <Form.Item
                        name="note"
                        rules={[
                          { required: true, message: "Nhập nội dung ghi chú" },
                        ]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Kết luận / đề xuất"
                        />
                      </Form.Item>
                      <Button
                        type="primary"
                        onClick={submitNote}
                        loading={noteLoading}
                      >
                        Gửi ghi chú
                      </Button>
                    </Form>
                  </div>
                )}

                {detail.status !== DISPUTE_STATUS.OPEN && (
                  <p style={{ marginTop: 12, color: "#64748b" }}>
                    Chỉ gửi ghi chú khi trạng thái OPEN. Hiện tại:{" "}
                    {DISPUTE_STATUS_LABEL[detail.status] ?? detail.status}
                  </p>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}

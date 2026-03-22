import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InspectorLayout from "../../../components/layout/InspectorLayout";
import { Typography, Button, message, Empty, Spin } from "antd";
import { RefreshCw } from "lucide-react";
import disputeService from "../../../services/disputeService";
import DisputeSummaryRow from "../../../components/disputes/DisputeSummaryRow";
import "./index.css";

/**
 * GET /disputes/inspector/my-disputes — danh sách thanh ngang.
 * View details → /inspector/disputes/:disputeId
 */
export default function InspectorDisputes() {
  const navigate = useNavigate();
  const [listLoading, setListLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await disputeService.getInspectorMyDisputes();
      const raw = res?.result ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(list);
    } catch (e) {
      setRows([]);
      message.error(e?.message || "Không tải được danh sách tranh chấp.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return (
    <InspectorLayout>
      <div className="inspector-page">
        <div className="inspector-dashboard">
          <div className="inspector-content disputes-support-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Typography.Title level={3} style={{ margin: 0 }}>
                Dispute center
              </Typography.Title>
              <Button
                icon={<RefreshCw size={16} />}
                onClick={loadList}
                loading={listLoading}
              >
                Làm mới danh sách
              </Button>
            </div>

            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Các tranh chấp thuộc bài đăng bạn đã kiểm định. Chọn{" "}
              <strong>View details</strong> để xem đầy đủ và gửi ghi chú cho
              admin.
            </Typography.Paragraph>

            {listLoading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin />
              </div>
            ) : rows.length === 0 ? (
              <Empty description="Không có tranh chấp nào." />
            ) : (
              <div className="my-disputes-list--bars">
                {rows.map((d) => (
                  <DisputeSummaryRow
                    key={d.disputeId}
                    dispute={d}
                    actions={
                      <Button
                        type="primary"
                        onClick={() =>
                          navigate(`/inspector/disputes/${d.disputeId}`)
                        }
                      >
                        View details
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}

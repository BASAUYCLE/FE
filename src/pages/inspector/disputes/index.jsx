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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await disputeService.getInspectorMyDisputes();
      const raw = res?.result ?? res?.data ?? res;
      const list = Array.isArray(raw) ? raw : [];
      setRows(list);
    } catch (e) {
      setRows([]);
      message.error(e?.message || "Could not load dispute list.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                Refresh list
              </Button>
            </div>

            <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
              Disputes for listings you inspected. Choose{" "}
              <strong>View details</strong> to see full information and submit
              notes for admin.
            </Typography.Paragraph>

            {listLoading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin />
              </div>
            ) : rows.length === 0 ? (
              <Empty description="No disputes found." />
            ) : (
              <div className="my-disputes-list--bars">
                {pageRows.map((d) => (
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
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 12,
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: 13 }}>
                      {rows.length} disputes · Page {page}/{totalPages}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="admin-tx-page-btn"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="admin-tx-page-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </InspectorLayout>
  );
}

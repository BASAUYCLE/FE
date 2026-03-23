import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../components/layout/AdminLayout";
import { Typography, Button, message, Alert, Empty, Spin } from "antd";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import disputeService from "../../../services/disputeService";
import DisputeSummaryRow from "../../../components/disputes/DisputeSummaryRow";
import "../dashboard/index.css";

/**
 * GET /disputes/admin/all — toàn bộ tranh chấp (chỉ role ADMIN trên BE).
 */
export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = String(user?.role ?? user?.userRole ?? "").toUpperCase();
  const isAdmin = role === "ADMIN";

  const [listLoading, setListLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await disputeService.getAdminAllDisputes();
      const raw = res?.result ?? res?.data ?? res;
      setRows(Array.isArray(raw) ? raw : []);
    } catch (e) {
      setRows([]);
      message.error(e?.message || "Could not load disputes.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadList();
  }, [isAdmin, loadList]);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="admin-page-shell">
          <Alert type="error" message="Admin only" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-shell">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            Disputes
          </Typography.Title>
          <Button
            icon={<RefreshCw size={16} />}
            onClick={loadList}
            loading={listLoading}
          >
            Refresh
          </Button>
        </div>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          All disputes on the platform. You can open any case to view details;
          approve or reject is only available after the inspector has submitted
          a note (status Reviewing).
        </Typography.Paragraph>

        {listLoading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin />
          </div>
        ) : rows.length === 0 ? (
          <Empty description="No disputes." />
        ) : (
          <div className="my-disputes-list--bars">
            {pageRows.map((d) => (
              <DisputeSummaryRow
                key={d.disputeId}
                dispute={d}
                actions={
                  <Button
                    type="primary"
                    onClick={() => navigate(`/admin-disputes/${d.disputeId}`)}
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
    </AdminLayout>
  );
}

import { useState, useEffect, useCallback } from "react";
import { message, Modal, Input } from "antd";
import ProductPreviewModal from "../../../components/ProductPreviewModal";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
  Eye,
  ClipboardList,
} from "lucide-react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import { adminPostService } from "../../../services";
import {
  POSTING_STATUS_LABEL,
  POSTING_STATUS_TAG_COLOR,
} from "../../../constants/postingStatus";
import { formatCurrency } from "../../../utils/formatCurrency";
import { formatDate } from "../../../utils/date";
import { useConfirmCrud } from "../../../utils/confirmCrud";
import "./index.css";

const PAGE_SIZE = 10;

function getThumbnailUrl(item) {
  const list = item?.images ?? [];
  const thumb = list.find((i) => i?.isThumbnail);
  return thumb?.imageUrl ?? list[0]?.imageUrl ?? null;
}

export default function ListingApproval() {
  const askConfirm = useConfirmCrud();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectPostId, setRejectPostId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [page, setPage] = useState(1);

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminPostService.getPendingPosts();
      const list = Array.isArray(res?.result) ? res.result : [];
      setListings(list);
    } catch (err) {
      message.error(err?.message ?? "Failed to load pending list.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (postId, row) => {
    const name = row?.bicycleName ?? "—";
    const ok = await askConfirm({
      title: "Confirm listing approval?",
      content: `Listing "${name}" will move to the inspection step (Inspector). This action takes effect immediately.`,
      okText: "Approve",
    });
    if (!ok) return;
    try {
      setApprovingId(postId);
      await adminPostService.approvePost(postId);
      message.success(
        "Content approved. Post is now pending Inspector verification.",
      );
      await fetchPending();
    } catch (err) {
      message.error(err?.message ?? "Approval failed.");
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = async (postId, row) => {
    const name = row?.bicycleName ?? "—";
    const ok = await askConfirm({
      title: "Reject this listing?",
      content: `You are about to reject listing "${name}". In the next step, enter a reason visible to the seller.`,
      okText: "Continue",
      danger: true,
    });
    if (!ok) return;
    setRejectPostId(postId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning("Please enter the rejection reason.");
      return;
    }
    if (!rejectPostId) return;
    const ok = await askConfirm({
      title: "Submit rejection?",
      content: `Confirm rejecting listing #${rejectPostId} with the entered reason? This action is usually irreversible.`,
      okText: "Submit rejection",
      danger: true,
    });
    if (!ok) return;
    try {
      setRejectingId(rejectPostId);
      await adminPostService.rejectPost(rejectPostId, {
        rejectionReason: reason,
      });
      message.success(
        "Post rejected. Members will see the reason in Manage Listings.",
      );
      setRejectModalOpen(false);
      setRejectPostId(null);
      setRejectReason("");
      await fetchPending();
    } catch (err) {
      message.error(err?.message ?? "Rejection failed.");
    } finally {
      setRejectingId(null);
    }
  };

  const pendingCount = listings.length;
  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const pageListings = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [listings.length]);

  return (
    <AdminLayout>
      <div className="admin-listings-page">
        <div className="admin-listings-shell">
          <div className="admin-listings-stats">
            <div className="admin-listings-stat">
              <div className="stat-header">
                <span className="stat-label">PENDING REVIEW</span>
                <span className="stat-icon green">
                  <ClipboardList />
                </span>
              </div>
              <div className="stat-value">
                {loading ? "…" : String(pendingCount)}
              </div>
              <div className="stat-note green">
                From API /admin/posts/pending
              </div>
            </div>
            <div className="admin-listings-stat">
              <div className="stat-header">
                <span className="stat-label">APPROVED TODAY</span>
                <span className="stat-icon green">
                  <CheckCircle2 />
                </span>
              </div>
              <div className="stat-value">—</div>
              <div className="stat-note green">N/A</div>
            </div>
            <div className="admin-listings-stat">
              <div className="stat-header">
                <span className="stat-label">REJECTION RATE</span>
                <span className="stat-icon red">
                  <AlertTriangle />
                </span>
              </div>
              <div className="stat-value">—</div>
              <div className="stat-note red">N/A</div>
            </div>
          </div>

          <div className="admin-listings-queue">
            <div className="queue-header">
              <div>
                <h2>Listing Approval Queue</h2>
              </div>
              <div className="queue-actions">
                <button
                  type="button"
                  className="queue-refresh"
                  onClick={fetchPending}
                  disabled={loading}
                >
                  <RefreshCcw />
                  Refresh Queue
                </button>
              </div>
            </div>

            <div className="queue-table">
              <div className="queue-row queue-header-row">
                <div>BIKE INFO</div>
                <div>SELLER</div>
                <div>CATEGORY</div>
                <div>PRICE</div>
                <div>SUBMISSION</div>
                <div>STATUS</div>
                <div>ACTIONS</div>
              </div>
              {loading ? (
                <div className="queue-row">
                  <div
                    style={{
                      padding: "24px",
                      gridColumn: "1 / -1",
                      textAlign: "center",
                    }}
                  >
                    Loading...
                  </div>
                </div>
              ) : (
                pageListings.map((row, idx) => {
                  const thumb = getThumbnailUrl(row);
                  const status = row.postStatus ?? "PENDING";
                  return (
                    <div
                      className="queue-row"
                      key={row?.postId ?? row?.id ?? `row-${idx}`}
                    >
                      <div
                        className="queue-bike admin-row-link"
                        onClick={() => row.postId && setPreviewId(row.postId)}
                        title="View listing"
                      >
                        {thumb ? (
                          <img src={thumb} alt={row.bicycleName} />
                        ) : (
                          <div className="queue-bike-placeholder">No image</div>
                        )}
                        <div>
                          <div className="queue-bike-title">
                            {row.bicycleName ?? "—"}
                          </div>
                        </div>
                      </div>
                      <div>{row.sellerFullName ?? row.sellerName ?? "—"}</div>
                      <div>
                        <span className="queue-category">
                          {row.categoryName ?? "—"}
                        </span>
                      </div>
                      <div className="queue-price">
                        {formatCurrency(row.price)}
                      </div>
                      <div>{formatDate(row.createdAt) || "—"}</div>
                      <div>
                        <span
                          className={`queue-inspection ${(POSTING_STATUS_TAG_COLOR[status] ?? "default").toLowerCase()}`}
                        >
                          <FileCheck2 />
                          {POSTING_STATUS_LABEL[status] ?? status}
                        </span>
                      </div>
                      <div className="queue-actions-cell">
                        <button
                          type="button"
                          className="queue-icon"
                          onClick={() => row.postId && setPreviewId(row.postId)}
                          title="View details"
                        >
                          <Eye />
                        </button>
                        <button
                          type="button"
                          className="queue-approve"
                          onClick={() => handleApprove(row.postId, row)}
                          disabled={approvingId === row.postId}
                        >
                          {approvingId === row.postId
                            ? "Approving…"
                            : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="queue-reject"
                          onClick={() => openRejectModal(row.postId, row)}
                          disabled={rejectingId === row.postId}
                        >
                          {rejectingId === row.postId ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="queue-footer">
              {totalPages <= 1 ? (
                <span>
                  Showing {pageListings.length} / {listings.length} pending
                  result(s)
                </span>
              ) : (
                <AdminPaginationBar
                  totalCount={listings.length}
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  nounPhrase="pending result(s)"
                  labelColor="#0f172a"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Reject post"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectPostId(null);
          setRejectReason("");
        }}
        onOk={handleRejectSubmit}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: rejectingId != null }}
        destroyOnHidden
        width={520}
      >
        <p style={{ marginBottom: 8, color: "#64748b" }}>
          Enter the rejection reason (title, price, description...). Members
          will see this in Manage Listings.
        </p>
        <Input.TextArea
          placeholder="e.g. Price too far from market; Description missing required information..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          maxLength={500}
          showCount
        />
      </Modal>
      <ProductPreviewModal
        postId={previewId}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
      />
    </AdminLayout>
  );
}

import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCcw,
  Eye,
  Check,
  ClipboardList,
  MessageSquare,
  FileText,
} from "lucide-react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { ADMIN_NAV_LINKS, getAdminActiveLink } from "../../../config/adminNav";
import { adminPostService } from "../../../services";
import { POSTING_STATUS_LABEL, POSTING_STATUS_TAG_COLOR } from "../../../constants/postingStatus";
import { formatCurrency } from "../../../utils/formatCurrency";
import "./index.css";

function getThumbnailUrl(item) {
  const list = item?.images ?? [];
  const thumb = list.find((i) => i?.isThumbnail);
  return thumb?.imageUrl ?? list[0]?.imageUrl ?? null;
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const flaggedItems = [
  { title: "Santa Cruz Bronson V4", issue: "Issue: Blurry main photo" },
  { title: "Giant TCR Advanced", issue: "Issue: Missing frame size" },
];

const moderationHistory = [
  { name: "Admin Mike", action: "approved", item: "S-Works Epic", time: "2 mins ago" },
  { name: "Sarah J.", action: "rejected", item: "Generic BMX", time: "15 mins ago" },
  { name: "Admin Mike", action: "approved", item: "Bianchi Oltre", time: "42 mins ago" },
];

const guidelines = [
  "Min. 5 high-res photos required (Side, Drivetrain, Cockpit, Serial, Flaws).",
  "Verify frame serial number against global theft databases.",
  "Price must be within +/- 20% of Bluebook estimated market value.",
  "Description must include: Model Year, Component Group, & Tire Condition.",
];

export default function ListingApproval() {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminPostService.getPendingPosts();
      const list = Array.isArray(res?.result) ? res.result : [];
      setListings(list);
    } catch (err) {
      message.error(err?.message ?? "Không tải được danh sách chờ duyệt.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (postId) => {
    try {
      setApprovingId(postId);
      await adminPostService.approvePost(postId);
      message.success("Đã duyệt bài đăng.");
      await fetchPending();
    } catch (err) {
      message.error(err?.message ?? "Duyệt bài thất bại.");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingCount = listings.length;

  return (
    <div className="admin-listings-page">
      <Header
        navLinks={ADMIN_NAV_LINKS}
        activeLink={getAdminActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />

      <div className="admin-listings-shell">
        <div className="admin-listings-stats">
          <div className="admin-listings-stat">
            <div className="stat-header">
              <span className="stat-label">PENDING REVIEW</span>
              <span className="stat-icon green"><ClipboardList /></span>
            </div>
            <div className="stat-value">{loading ? "…" : String(pendingCount)}</div>
            <div className="stat-note green">Từ API /admin/posts/pending</div>
          </div>
          <div className="admin-listings-stat">
            <div className="stat-header">
              <span className="stat-label">APPROVED TODAY</span>
              <span className="stat-icon green"><CheckCircle2 /></span>
            </div>
            <div className="stat-value">—</div>
            <div className="stat-note green">Có thể bổ sung API thống kê</div>
          </div>
          <div className="admin-listings-stat">
            <div className="stat-header">
              <span className="stat-label">REJECTION RATE</span>
              <span className="stat-icon red"><AlertTriangle /></span>
            </div>
            <div className="stat-value">—</div>
            <div className="stat-note red">Có thể bổ sung API thống kê</div>
          </div>
        </div>

        <div className="admin-listings-queue">
          <div className="queue-header">
            <div>
              <h2>Listing Approval Queue</h2>
            </div>
            <div className="queue-actions">
              <button type="button" className="queue-filter">
                <Filter />
                Filter
              </button>
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
                <div style={{ padding: "24px", gridColumn: "1 / -1", textAlign: "center" }}>
                  Đang tải...
                </div>
              </div>
            ) : (
              listings.map((row) => {
                const thumb = getThumbnailUrl(row);
                const status = row.postStatus ?? "PENDING";
                return (
                  <div className="queue-row" key={row.postId}>
                    <div className="queue-bike">
                      {thumb ? (
                        <img src={thumb} alt={row.bicycleName} />
                      ) : (
                        <div className="queue-bike-placeholder">No image</div>
                      )}
                      <div>
                        <div className="queue-bike-title">{row.bicycleName ?? "—"}</div>
                        <div className="queue-bike-id">ID: #{row.postId}</div>
                      </div>
                    </div>
                    <div>{row.sellerFullName ?? row.sellerName ?? "—"}</div>
                    <div>
                      <span className="queue-category">{row.categoryName ?? "—"}</span>
                    </div>
                    <div className="queue-price">{formatCurrency(row.price)}</div>
                    <div>{formatDate(row.createdAt)}</div>
                    <div>
                      <span className={`queue-inspection ${(POSTING_STATUS_TAG_COLOR[status] ?? "default").toLowerCase()}`}>
                        <FileCheck2 />
                        {POSTING_STATUS_LABEL[status] ?? status}
                      </span>
                    </div>
                    <div className="queue-actions-cell">
                      <button
                        type="button"
                        className="queue-icon"
                        onClick={() => navigate(`/product/${row.postId}`)}
                        title="Xem chi tiết"
                      >
                        <Eye />
                      </button>
                      <button
                        type="button"
                        className="queue-approve"
                        onClick={() => handleApprove(row.postId)}
                        disabled={approvingId === row.postId}
                      >
                        {approvingId === row.postId ? "Đang duyệt…" : "Approve"}
                      </button>
                      <button type="button" className="queue-reject">
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="queue-footer">
            <span>Showing {listings.length} pending result(s)</span>
          </div>
        </div>

        <div className="admin-listings-bottom">
          <div className="bottom-card">
            <div className="bottom-card-title">
              <FileText />
              Flagged for Quality
            </div>
            {flaggedItems.map((item) => (
              <div key={item.title} className="flagged-item">
                <div className="flagged-icon" />
                <div>
                  <div className="flagged-title">{item.title}</div>
                  <div className="flagged-issue">{item.issue}</div>
                </div>
              </div>
            ))}
            <button type="button" className="bottom-link">
              View all flagged items (14)
            </button>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-title">
              <MessageSquare />
              Moderation History
            </div>
            {moderationHistory.map((item) => (
              <div key={`${item.name}-${item.item}`} className="history-item">
                <div className="history-avatar">
                  {item.name.split(" ")[0][0]}
                </div>
                <div>
                  <div className="history-title">
                    <strong>{item.name}</strong> {item.action}{" "}
                    <em>{item.item}</em>
                  </div>
                  <div className="history-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bottom-card">
            <div className="bottom-card-title">
              <Check />
              Admin Guidelines
            </div>
            <ul className="guidelines-list">
              {guidelines.map((rule) => (
                <li key={rule}>
                  <Check />
                  {rule}
                </li>
              ))}
            </ul>
            <button type="button" className="bottom-primary">
              Download Full Handbook (PDF)
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

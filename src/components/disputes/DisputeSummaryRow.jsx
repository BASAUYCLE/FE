import { Tag } from "antd";
import {
  DISPUTE_STATUS_LABEL,
  disputeStatusTagColor,
} from "../../constants/disputeStatus";
import { formatDateTime } from "../../utils/date";
import "./disputeListRows.css";

/**
 * Một dòng tóm tắt dispute (thanh ngang). Nội dung chi tiết ở trang riêng.
 */
export default function DisputeSummaryRow({ dispute, highlight, actions }) {
  if (!dispute || typeof dispute !== "object") return null;
  const d = dispute;
  return (
    <div
      className={
        highlight
          ? "my-dispute-row my-dispute-row--highlight"
          : "my-dispute-row"
      }
    >
      <div className="my-dispute-row__main">
        <div className="my-dispute-row__id">
          <span className="my-dispute-row__title">
            Dispute #{d.disputeId ?? "—"}
          </span>
          <Tag color={disputeStatusTagColor(d.status)}>
            {DISPUTE_STATUS_LABEL[d.status] ?? d.status}
          </Tag>
        </div>
        <div className="my-dispute-row__info">
          <div className="my-dispute-row__order">
            Order #{d.orderId ?? "—"} — {d.postTitle ?? "—"}
          </div>
          <div className="my-dispute-row__parties">
            Buyer: {d.buyerName ?? "—"} · Seller: {d.sellerName ?? "—"}
          </div>
          {d.createdAt && (
            <div className="my-dispute-row__date">
              {formatDateTime(d.createdAt)}
            </div>
          )}
        </div>
      </div>
      {actions ? (
        <div className="my-dispute-row__actions">{actions}</div>
      ) : null}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Tag } from "antd";
import { Link } from "react-router-dom";
import {
  DISPUTE_STATUS_LABEL,
  disputeStatusTagColor,
} from "../../constants/disputeStatus";
import { formatDateTime } from "../../utils/date";
import { pickListingThumbnailUrl } from "../../utils/listingThumbnailUrl";
import {
  fetchListingThumbnailByPostId,
  fetchPostIdFromOrderId,
} from "../../utils/fetchListingThumbnailByPostId";
import "./disputeListRows.css";

/**
 * Mã tin đăng — BE dispute/order đôi khi dùng postId, đôi khi bikeId/productId (cùng id bài post).
 */
function resolvePostId(d) {
  if (!d || typeof d !== "object") return null;
  const id =
    d.postId ??
    d.post_id ??
    d.bikeId ??
    d.bike_id ??
    d.productId ??
    d.product_id ??
    d.listingId ??
    d.listing_id ??
    d.post?.postId ??
    d.post?.id ??
    d.order?.postId ??
    d.order?.post_id ??
    d.order?.bikeId ??
    d.order?.bike_id ??
    null;
  return id != null ? String(id) : null;
}

function thumbnailFromDispute(d) {
  if (!d || typeof d !== "object") return null;
  return (
    pickListingThumbnailUrl(d) ||
    pickListingThumbnailUrl(d.post) ||
    pickListingThumbnailUrl(d.listing) ||
    pickListingThumbnailUrl(d.order)
  );
}

/**
 * Một dòng tóm tắt dispute (thanh ngang). Nội dung chi tiết ở trang riêng.
 */
export default function DisputeSummaryRow({ dispute, highlight, actions }) {
  const d = dispute && typeof dispute === "object" ? dispute : null;
  const postId = d ? resolvePostId(d) : null;
  const thumbDirect = d ? thumbnailFromDispute(d) : null;
  /** `undefined` = đang hoặc chưa tải ảnh theo post; `null` = không có ảnh */
  const [thumbFromPost, setThumbFromPost] = useState(undefined);
  /** postId lấy từ GET /orders/{orderId} khi list dispute không trả postId */
  const [resolvedFromOrder, setResolvedFromOrder] = useState({
    orderId: null,
    postId: null,
  });

  const listingPostId =
    postId ||
    (d?.orderId != null && resolvedFromOrder.orderId === d.orderId
      ? resolvedFromOrder.postId
      : null);

  useEffect(() => {
    if (!d) return;
    if (thumbDirect) return;
    let cancelled = false;
    (async () => {
      let pid = postId;
      if (!pid && d.orderId != null) {
        pid = await fetchPostIdFromOrderId(d.orderId);
        if (!cancelled) {
          setResolvedFromOrder({
            orderId: d.orderId,
            postId: pid ?? null,
          });
        }
      }
      if (!pid) {
        if (!cancelled) setThumbFromPost(null);
        return;
      }
      const url = await fetchListingThumbnailByPostId(pid);
      if (!cancelled) setThumbFromPost(url ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [d, thumbDirect, postId, d?.orderId]);

  const thumbUrl =
    thumbDirect ?? (thumbFromPost === undefined ? null : thumbFromPost);

  if (!d) return null;

  return (
    <div
      className={[
        "my-dispute-row",
        highlight && "my-dispute-row--highlight",
        thumbUrl && "my-dispute-row--has-thumb",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="my-dispute-row__main">
        <div className="my-dispute-row__head">
          <div className="my-dispute-row__id">
            <span className="my-dispute-row__title">
              Dispute #{d.disputeId ?? "—"}
            </span>
            <Tag color={disputeStatusTagColor(d.status)}>
              {DISPUTE_STATUS_LABEL[d.status] ?? d.status}
            </Tag>
          </div>
        </div>
        <div className="my-dispute-row__body">
          {thumbUrl ? (
            <div className="my-dispute-row__thumb" aria-hidden>
              <img src={thumbUrl} alt="" loading="lazy" decoding="async" />
            </div>
          ) : null}
          <div className="my-dispute-row__info">
            <div className="my-dispute-row__order">
              Order #{d.orderId ?? "—"} — {d.postTitle ?? "—"}
              {listingPostId ? (
                <>
                  {" "}
                  <Link
                    className="my-dispute-row__post-link"
                    to={`/product/${listingPostId}`}
                  >
                    View listing
                  </Link>
                </>
              ) : null}
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
      </div>
      {actions ? (
        <div className="my-dispute-row__actions">{actions}</div>
      ) : null}
    </div>
  );
}

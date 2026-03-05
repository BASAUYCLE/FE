import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Tag, Button, Typography, message } from "antd";
import { Calendar, Pencil, Eye, CheckCircle, RotateCcw, Send } from "lucide-react";
import {
  POSTING_STATUS,
  POSTING_STATUS_LABEL,
  POSTING_STATUS_TAG_COLOR,
} from "../../constants/postingStatus";
import { formatDate } from "../../utils/date";
import { usePostings } from "../../contexts/PostingContext";
import postService from "../../services/postService";
import "./PostingCard.css";

export default function PostingCard({ posting, onSubmitted }) {
  const navigate = useNavigate();
  const { updatePostingStatus } = usePostings();
  const [submitting, setSubmitting] = useState(false);
  const status = posting.status;
  const isActive = status === POSTING_STATUS.ACTIVE;
  const isVerified = status === POSTING_STATUS.VERIFIED;
  const isDraft = status === POSTING_STATUS.DRAFTED;
  const isSold = status === POSTING_STATUS.SOLD;
  const isExpired = status === POSTING_STATUS.EXPIRED;
  const isPending = status === POSTING_STATUS.PENDING_REVIEW;
  const isRejected = status === POSTING_STATUS.REJECTED;

  const handleMarkSold = () => {
    updatePostingStatus(posting.id, POSTING_STATUS.SOLD);
  };

  return (
    <Card
      className={`posting-card ${isDraft ? "posting-card-draft" : ""} ${isExpired ? "posting-card-expired" : ""}`}
    >
      <div className="posting-card-inner">
        <div className="posting-card-image">
          {posting.imageUrl ? (
            <img src={posting.imageUrl} alt={posting.bikeName} />
          ) : (
            <div className="posting-card-image-placeholder">No photo</div>
          )}
        </div>

        <div className="posting-card-details">
          <Tag color={POSTING_STATUS_TAG_COLOR[status]}>
            {POSTING_STATUS_LABEL[status]}
          </Tag>
          <Typography.Title level={5} className="posting-card-title">
            {posting.bikeName}
          </Typography.Title>
          <div className="posting-card-date">
            <Calendar size={12} color="#64748b" />
            <span>Posted {formatDate(posting.createdAt)}</span>
          </div>
        </div>

        <div className="posting-card-right">
          <div className="posting-card-price-label">Listing Price</div>
          <div className="posting-card-price">
            {posting.priceDisplay ||
              (posting.price ? `$${posting.price}` : "—")}
          </div>
          <div className="posting-card-actions">
            {(isActive || isVerified) && (
              <>
                <Button
                  size="small"
                  type="default"
                  icon={<Pencil size={12} />}
                  onClick={() => navigate(`/post?edit=${posting.id}`)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircle size={12} />}
                  onClick={handleMarkSold}
                  style={{
                    backgroundColor: "#00ccad",
                    color: "#0f172a",
                    border: "none",
                  }}
                >
                  Mark Sold
                </Button>
              </>
            )}
            {isPending && (
              <Button size="small" type="default" disabled>
                Under Review
              </Button>
            )}
            {isRejected && (
              <Button
                size="small"
                type="default"
                icon={<Pencil size={12} />}
                onClick={() => navigate(`/post?edit=${posting.id}`)}
              >
                Edit
              </Button>
            )}
            {isSold && (
              <Button
                size="small"
                type="default"
                disabled
                style={{ color: "#64748b" }}
              >
                ✓ Sold
              </Button>
            )}
            {isDraft && (
              <>
                <Button
                  size="small"
                  type="default"
                  icon={<Pencil size={12} />}
                  onClick={() => navigate(`/post?edit=${posting.id}`)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<Send size={12} />}
                  loading={submitting}
                  onClick={async () => {
                    const id = posting.id ?? posting.backendPostId;
                    if (!id) return;
                    setSubmitting(true);
                    try {
                      await postService.submitDraft(id);
                      message.success("Submitted for review. Awaiting admin/inspector approval.");
                      onSubmitted?.();
                    } catch (err) {
                      message.error(err?.message ?? err?.data?.message ?? "Submit for review failed.");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  Submit for review
                </Button>
              </>
            )}
            {isExpired && (
              <Button
                size="small"
                type="default"
                icon={<RotateCcw size={12} />}
              >
                Renew
              </Button>
            )}
            <Button
              size="small"
              type="text"
              icon={<Eye size={12} />}
              onClick={() => navigate("/marketplace")}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

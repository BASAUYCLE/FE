import { useEffect, useState } from "react";
import { Modal, Rate, Input, message, Alert } from "antd";
import { feedbackService } from "../../services";
import { ORDER_STATUS } from "../../constants/orderStatus";

const { TextArea } = Input;

function isOrderNotCompletedError(err) {
  const m = String(err?.message ?? err?.data?.message ?? "").toLowerCase();
  return (
    m.includes("order_not_completed") ||
    m.includes("1063") ||
    m.includes("must be completed") ||
    m.includes("completed before leaving feedback")
  );
}

export default function FeedbackModal({ open, onClose, order, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Khi mở modal, thử load feedback hiện có để cho phép edit
  useEffect(() => {
    if (!open || !order?.orderId) return;
    let cancelled = false;
    setInitialLoaded(false);
    setLoading(true);
    feedbackService
      .getFeedbackByOrder(order.orderId)
      .then((res) => {
        if (cancelled) return;
        const data = res?.result ?? res?.data ?? res;
        if (data && typeof data === "object") {
          setRating(Number(data.rating ?? 5) || 5);
          setComment(data.comment ?? "");
        } else {
          setRating(5);
          setComment("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRating(5);
          setComment("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setInitialLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, order?.orderId]);

  const handleSubmit = async () => {
    if (!order?.orderId) return;
    if (!rating) {
      message.warning("Please select a rating.");
      return;
    }
    setLoading(true);
    try {
      const payload = { rating, comment };
      try {
        await feedbackService.createFeedback(order.orderId, payload);
      } catch (err) {
        // Fallback to update when feedback already exists.
        if (err?.message?.toString?.().includes("FEEDBACK_ALREADY_EXISTS")) {
          await feedbackService.updateFeedback(order.orderId, payload);
        } else {
          throw err;
        }
      }
      message.success("Review submitted successfully.");
      onSuccess?.();
      onClose?.();
    } catch (error) {
      if (isOrderNotCompletedError(error)) {
        message.warning({
          content:
            "Hệ thống chỉ nhận đánh giá khi đơn ở trạng thái Completed (thường sau thời gian không tranh chấp). Vui lòng chờ hoặc mở lại từ Đơn hàng của tôi và bấm Gửi lại.",
          duration: 8,
        });
      } else {
        message.error(
          error?.message || "Unable to submit your review. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = "Rate Seller";

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={() => !loading && onClose?.()}
      onOk={handleSubmit}
      okText="Submit Review"
      cancelText="Cancel"
      confirmLoading={loading && initialLoaded}
      centered
      width={560}
      styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 4,
          }}
        >
          Order #{order?.orderId} - {order?.bikeName}
        </div>
        <Rate
          value={rating}
          onChange={setRating}
          style={{ color: "#f59e0b", fontSize: 22 }}
        />
      </div>
      <TextArea
        rows={4}
        placeholder="Share your buying experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Modal>
  );
}

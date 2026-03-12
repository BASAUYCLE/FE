import { useEffect, useState } from "react";
import { Modal, Rate, Input, message } from "antd";
import { feedbackService } from "../../services";

const { TextArea } = Input;

export default function FeedbackModal({ open, onClose, order }) {
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
      message.warning("Vui lòng chọn số sao đánh giá.");
      return;
    }
    setLoading(true);
    try {
      const payload = { rating, comment };
      try {
        await feedbackService.createFeedback(order.orderId, payload);
      } catch (err) {
        // Nếu feedback đã tồn tại thì chuyển sang update
        if (err?.message?.toString?.().includes("FEEDBACK_ALREADY_EXISTS")) {
          await feedbackService.updateFeedback(order.orderId, payload);
        } else {
          throw err;
        }
      }
      message.success("Gửi đánh giá thành công!");
      onClose?.();
    } catch (error) {
      message.error(
        error?.message || "Không thể gửi đánh giá. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đánh giá người bán"
      open={open}
      onCancel={() => !loading && onClose?.()}
      onOk={handleSubmit}
      okText="Gửi đánh giá"
      confirmLoading={loading && initialLoaded}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 4,
          }}
        >
          Đơn hàng #{order?.orderId} – {order?.bikeName}
        </div>
        <Rate
          value={rating}
          onChange={setRating}
          style={{ color: "#f59e0b", fontSize: 22 }}
        />
      </div>
      <TextArea
        rows={4}
        placeholder="Chia sẻ trải nghiệm mua hàng của bạn (tùy chọn)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </Modal>
  );
}


import { useState, useEffect } from "react";
import { Modal, Tag, Spin } from "antd";
import axiosInstance from "../../services/axiosConfig";
import { formatCurrency } from "../../utils/formatCurrency";
import { getAvatarSrc } from "../../utils/avatar";
import { calcScore } from "../../utils/inspectionReportNormalize";
import { fetchInspectionReportForPost } from "../../utils/inspectionReportFetch";
import { OVERALL_CONDITION_LABEL } from "../../constants/postingStatus";
import "./index.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractImages(row) {
  const arr = row?.images ?? row?.bicycleImages ?? row?.imageList ?? [];
  const sorted = [...arr].sort(
    (a, b) => (b?.isThumbnail ? 1 : 0) - (a?.isThumbnail ? 1 : 0),
  );
  const urls = sorted
    .map((i) => i?.imageUrl ?? i?.image_url ?? i?.url)
    .filter(Boolean);
  if (urls.length) return urls;
  if (row?.imageUrl) return [row.imageUrl];
  if (row?.thumbnailUrl) return [row.thumbnailUrl];
  return [];
}

function normalizePost(row) {
  if (!row || typeof row !== "object") return null;
  const price = row.price ?? row.askingPrice ?? null;
  const sellerEntity = row.seller ?? row.user ?? null;
  return {
    id: row.postId ?? row.id,
    name: row.bicycleName ?? row.title ?? "—",
    priceDisplay:
      typeof price === "number"
        ? formatCurrency(price)
        : price
          ? String(price)
          : "—",
    status: row.postStatus ?? row.status ?? "AVAILABLE",
    seller: row.sellerFullName ?? row.sellerName ?? "—",
    sellerAvatar: getAvatarSrc(
      sellerEntity,
      row.sellerAvatar,
      row.sellerAvatarUrl,
      row.seller_avatar,
      row.seller_avatar_url,
      row.userAvatar,
      row.userAvatarUrl,
      row.user_avatar,
      row.user_avatar_url,
      row.avatar,
      row.avatarUrl,
      row.avatar_url,
    ),
    sellerLocation: row.sellerLocation ?? row.seller_address ?? null,
    brand: row.brandName ?? row.brand ?? null,
    category: row.categoryName ?? row.category ?? null,
    frameSize: row.size ?? row.frameSize ?? null,
    frameMaterial: row.frameMaterial ?? null,
    color: row.bicycleColor ?? row.color ?? null,
    modelYear: row.modelYear ?? null,
    groupset: row.groupset ?? null,
    brakeType: row.brakeType ?? null,
    description: row.bicycleDescription ?? row.description ?? null,
    createdAt: row.createdAt ?? null,
    images: extractImages(row),
  };
}

const STATUS_COLOR = {
  AVAILABLE: "green",
  DEPOSITED: "orange",
  SOLD: "purple",
  PENDING: "gold",
  ADMIN_APPROVED: "blue",
  REJECTED: "red",
  HIDDEN: "default",
};
const STATUS_LABEL = {
  AVAILABLE: "Available",
  DEPOSITED: "Deposited",
  SOLD: "Sold",
  PENDING: "Pending",
  ADMIN_APPROVED: "Pending inspection",
  REJECTED: "Rejected",
  HIDDEN: "Hidden",
};
const CONDITION_VI = { good: "Good", fair: "Fair", poor: "Average" };

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductPreviewModal({ postId, open, onClose }) {
  const [product, setProduct] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    if (!open || !postId) {
      queueMicrotask(() => {
        setProduct(null);
        setInspection(null);
        setPaymentInfo(null);
      });
      return;
    }

    queueMicrotask(() => {
      setLoading(true);
      setImgIdx(0);
      setPaymentInfo(null);
      setAvatarLoadError(false);

      (async () => {
        for (const url of [
          `/posts/${postId}`,
          `/admin/posts/${postId}`,
          `/bicycle-posts/${postId}`,
        ]) {
          try {
            const res = await axiosInstance.get(url);
            const raw = res?.result ?? res?.data ?? res;
            const post = normalizePost(raw);
            if (post) {
              setProduct(post);
              break;
            }
          } catch {
            /* thử tiếp */
          }
        }
        const ins = await fetchInspectionReportForPost(postId);
        setInspection(ins);
        try {
          const res = await axiosInstance.get("/orders/my-orders");
          const raw = res?.result ?? res?.data ?? res?.content ?? res;
          const orders = Array.isArray(raw)
            ? raw
            : (raw?.orders ?? raw?.content ?? []);
          const matched = orders.find((o) => {
            const oid = o?.postId ?? o?.post_id ?? o?.bikeId ?? o?.productId;
            if (String(oid) !== String(postId)) return false;
            const st = String(
              o?.orderStatus ??
                o?.order_status ??
                o?.status ??
                o?.orderState ??
                o?.order_state ??
                "",
            ).toUpperCase();
            return st === "DEPOSITED";
          });
          if (matched) {
            const numericPrice = Number(
              matched.totalPrice ?? matched.total_price ?? 0,
            );
            const depositAmount = Number(
              matched.depositAmount ?? matched.deposit_amount ?? 0,
            );
            if (
              Number.isFinite(numericPrice) &&
              Number.isFinite(depositAmount)
            ) {
              setPaymentInfo({ numericPrice, depositAmount });
            }
          }
        } catch {
          // ignore if not in buyer flow
        }
        setLoading(false);
      })();
    });
  }, [postId, open]);

  // Tính giá trị "Kiểm định" để đưa vào bảng thông số
  const score = calcScore(inspection);
  const inspectionEntry = (() => {
    if (!inspection) return { value: "Not inspected", color: "#94a3b8" };
    const condKey = String(inspection.condition ?? "").toUpperCase();
    const condLabel =
      OVERALL_CONDITION_LABEL[condKey] ?? inspection.condition ?? null;

    if (inspection.result === "FAIL") {
      const pctPart = score !== null ? `Failed (${score}%)` : "Failed (0%)";
      const value = condLabel ? `${pctPart} · ${condLabel}` : pctPart;
      return { value, color: "#ef4444" };
    }

    if (score !== null) {
      const label = condLabel ? `${score}% · ${condLabel}` : `${score}%`;
      const color =
        score >= 80 ? "#10b981" : score >= 60 ? "#d97706" : "#ef4444";
      return { value: label, color };
    }

    if (inspection.result === "PASS" || condLabel) {
      return {
        value: condLabel ? `Pass · ${condLabel}` : "Pass",
        color: "#10b981",
      };
    }

    return { value: "Not inspected", color: "#94a3b8" };
  })();

  const specs = product
    ? [
        { label: "Brand", value: product.brand },
        { label: "Category", value: product.category },
        { label: "Frame size", value: product.frameSize },
        { label: "Frame material", value: product.frameMaterial },
        { label: "Color", value: product.color },
        { label: "Model year", value: product.modelYear },
        { label: "Groupset", value: product.groupset },
        { label: "Brake", value: product.brakeType },
        {
          label: "Inspection",
          value: inspectionEntry.value,
          color: inspectionEntry.color,
        },
      ].filter((s) => s.value)
    : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="min(1120px, 96vw)"
      style={{ top: 12 }}
      destroyOnHidden
      className="product-preview-modal"
      styles={{ body: { padding: 0 } }}
      title={null}
    >
      {loading ? (
        <div className="ppm-loading">
          <Spin size="large" />
        </div>
      ) : !product ? (
        <div className="ppm-loading" style={{ color: "#94a3b8" }}>
          Product not found.
        </div>
      ) : (
        <div className="ppm-body">
          {/* Gallery */}
          <div className="ppm-gallery">
            <div className="ppm-main-img-wrap">
              {product.images.length > 0 ? (
                <img
                  src={product.images[imgIdx] ?? product.images[0]}
                  alt={product.name}
                  className="ppm-main-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="ppm-no-img">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="ppm-thumbs">
                {product.images.slice(0, 8).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className={`ppm-thumb ${i === imgIdx ? "active" : ""}`}
                    onClick={() => setImgIdx(i)}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ppm-info">
            {/* Header */}
            <div className="ppm-header">
              <Tag
                color={STATUS_COLOR[product.status] ?? "default"}
                style={{ marginBottom: 6 }}
              >
                {STATUS_LABEL[product.status] ?? product.status}
              </Tag>
              <h2 className="ppm-name">{product.name}</h2>
              <div className="ppm-price">{product.priceDisplay}</div>
              {product.createdAt && (
                <div className="ppm-date">
                  Posted{" "}
                  {new Date(product.createdAt).toLocaleDateString("en-US")}
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="ppm-seller">
              <div className="ppm-seller-avatar">
                {product.sellerAvatar && !avatarLoadError ? (
                  <img
                    src={product.sellerAvatar}
                    alt={product.seller}
                    className="ppm-seller-avatar-img"
                    onError={() => setAvatarLoadError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  (product.seller[0] ?? "?").toUpperCase()
                )}
              </div>
              <div>
                <div className="ppm-seller-name">{product.seller}</div>
                {product.sellerLocation && (
                  <div className="ppm-seller-label">
                    {product.sellerLocation}
                  </div>
                )}
                <div className="ppm-seller-label">Seller</div>
              </div>
            </div>

            {/* Specs — bao gồm dòng Kiểm định */}
            {specs.length > 0 && (
              <>
                <div className="ppm-section-title">Specifications</div>
                <div className="ppm-specs">
                  {specs.map((s) => (
                    <div key={s.label} className="ppm-spec-row">
                      <span className="ppm-spec-label">{s.label}</span>
                      <span
                        className="ppm-spec-value"
                        style={
                          s.color
                            ? { color: s.color, fontWeight: 700 }
                            : undefined
                        }
                      >
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Description */}
            {product.description && (
              <>
                <div className="ppm-section-title">Description</div>
                <p className="ppm-desc">{product.description}</p>
              </>
            )}
            {paymentInfo && (
              <>
                <div className="ppm-section-title">Pay remaining</div>
                <div className="ppm-pay-remaining-box">
                  <span
                    style={{
                      display: "block",
                      fontSize: 16,
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    Pay {formatCurrency(paymentInfo.depositAmount)} now,{" "}
                    {formatCurrency(
                      paymentInfo.numericPrice - paymentInfo.depositAmount,
                    )}{" "}
                    later
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

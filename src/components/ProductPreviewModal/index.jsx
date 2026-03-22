import { useState, useEffect } from "react";
import { Modal, Tag, Spin } from "antd";
import axiosInstance from "../../services/axiosConfig";
import { formatCurrency } from "../../utils/formatCurrency";
import "./index.css";

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractImages(row) {
  const arr = row?.images ?? row?.bicycleImages ?? row?.imageList ?? [];
  const sorted = [...arr].sort((a, b) => (b?.isThumbnail ? 1 : 0) - (a?.isThumbnail ? 1 : 0));
  const urls = sorted.map((i) => i?.imageUrl ?? i?.image_url ?? i?.url).filter(Boolean);
  if (urls.length) return urls;
  if (row?.imageUrl)    return [row.imageUrl];
  if (row?.thumbnailUrl) return [row.thumbnailUrl];
  return [];
}

function normalizePost(row) {
  if (!row || typeof row !== "object") return null;
  const price = row.price ?? row.askingPrice ?? null;
  return {
    id:             row.postId ?? row.id,
    name:           row.bicycleName  ?? row.title         ?? "—",
    priceDisplay:   typeof price === "number" ? formatCurrency(price) : (price ? String(price) : "—"),
    status:         row.postStatus   ?? row.status        ?? "AVAILABLE",
    seller:         row.sellerFullName ?? row.sellerName  ?? "—",
    sellerLocation: row.sellerLocation ?? row.seller_address ?? null,
    brand:          row.brandName    ?? row.brand         ?? null,
    category:       row.categoryName ?? row.category      ?? null,
    frameSize:      row.size         ?? row.frameSize     ?? null,
    frameMaterial:  row.frameMaterial ?? null,
    color:          row.bicycleColor ?? row.color         ?? null,
    modelYear:      row.modelYear    ?? null,
    groupset:       row.groupset     ?? null,
    brakeType:      row.brakeType    ?? null,
    description:    row.bicycleDescription ?? row.description ?? null,
    createdAt:      row.createdAt    ?? null,
    images:         extractImages(row),
  };
}

function normalizeInspection(row) {
  if (!row || typeof row !== "object") return null;
  return {
    result:    row.result    ?? row.inspectionResult   ?? null,
    condition: row.overallCondition ?? row.condition   ?? null,
    checklist: row.checklist ?? null,
  };
}

/** Tính % chất lượng từ kết quả kiểm định */
function calcScore(ins) {
  if (!ins) return null;
  const { result, condition, checklist } = ins;

  // Từ checklist items
  if (Array.isArray(checklist) && checklist.length > 0) {
    const items = checklist.flatMap((g) => g.items ?? []);
    const valid = items.filter((i) => i?.status && i.status !== "n/a");
    if (valid.length > 0) {
      const score = valid.reduce((s, i) => {
        if (i.status === "good") return s + 1;
        if (i.status === "fair") return s + 0.6;
        return s;
      }, 0);
      return Math.round((score / valid.length) * 100);
    }
  }

  // Fallback từ overallCondition
  if (result === "FAIL") return 0;
  const c = (condition ?? "").toLowerCase();
  if (c === "good")  return 90;
  if (c === "fair")  return 70;
  if (c === "poor")  return 50;
  if (result === "PASS") return 80;
  return null;
}

const STATUS_COLOR = {
  AVAILABLE: "green", DEPOSITED: "orange", SOLD: "purple",
  PENDING: "gold", ADMIN_APPROVED: "blue", REJECTED: "red", HIDDEN: "default",
};
const STATUS_LABEL = {
  AVAILABLE: "Available", DEPOSITED: "Deposited", SOLD: "Sold",
  PENDING: "Pending", ADMIN_APPROVED: "Chờ kiểm định", REJECTED: "Rejected", HIDDEN: "Hidden",
};
const CONDITION_VI = { good: "Tốt", fair: "Khá", poor: "Trung bình" };

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductPreviewModal({ postId, open, onClose }) {
  const [product,    setProduct]    = useState(null);
  const [inspection, setInspection] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [imgIdx,     setImgIdx]     = useState(0);

  useEffect(() => {
    if (!open || !postId) { setProduct(null); setInspection(null); return; }
    setLoading(true);
    setImgIdx(0);

    (async () => {
      for (const url of [`/posts/${postId}`, `/admin/posts/${postId}`, `/bicycle-posts/${postId}`]) {
        try {
          const res  = await axiosInstance.get(url);
          const raw  = res?.result ?? res?.data ?? res;
          const post = normalizePost(raw);
          if (post) { setProduct(post); break; }
        } catch { /* thử tiếp */ }
      }
      for (const url of [`/inspection/${postId}/report`, `/admin/inspection/${postId}`, `/inspection/${postId}`]) {
        try {
          const res = await axiosInstance.get(url);
          const raw = res?.result ?? res?.data ?? res;
          const ins = normalizeInspection(raw);
          if (ins?.result || ins?.condition) { setInspection(ins); break; }
        } catch { /* thử tiếp */ }
      }
      setLoading(false);
    })();
  }, [postId, open]);

  // Tính giá trị "Kiểm định" để đưa vào bảng thông số
  const score = calcScore(inspection);
  const inspectionEntry = (() => {
    if (!inspection) return { value: "Chưa kiểm định", color: "#94a3b8" };
    if (inspection.result === "FAIL") return { value: "Không đạt (0%)", color: "#ef4444" };
    const condLabel = CONDITION_VI[(inspection.condition ?? "").toLowerCase()] ?? null;
    if (score !== null) {
      const label = condLabel ? `${score}% · ${condLabel}` : `${score}%`;
      const color = score >= 80 ? "#10b981" : score >= 60 ? "#d97706" : "#ef4444";
      return { value: label, color };
    }
    return { value: "Pass", color: "#10b981" };
  })();

  const specs = product ? [
    { label: "Brand",    value: product.brand },
    { label: "Category",       value: product.category },
    { label: "Frame size",     value: product.frameSize },
    { label: "Frame material", value: product.frameMaterial },
    { label: "Color",          value: product.color },
    { label: "Model year",     value: product.modelYear },
    { label: "Groupset",       value: product.groupset },
    { label: "Brake",          value: product.brakeType },
    { label: "Inspection",     value: inspectionEntry.value, color: inspectionEntry.color },
  ].filter((s) => s.value) : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnHidden
      className="product-preview-modal"
      styles={{ body: { padding: 0 } }}
      title={null}
    >
      {loading ? (
        <div className="ppm-loading"><Spin size="large" /></div>
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
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div className="ppm-no-img">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="ppm-thumbs">
                {product.images.slice(0, 8).map((url, i) => (
                  <img
                    key={i} src={url} alt=""
                    className={`ppm-thumb ${i === imgIdx ? "active" : ""}`}
                    onClick={() => setImgIdx(i)}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="ppm-info">

            {/* Header */}
            <div className="ppm-header">
              <Tag color={STATUS_COLOR[product.status] ?? "default"} style={{ marginBottom: 6 }}>
                {STATUS_LABEL[product.status] ?? product.status}
              </Tag>
              <h2 className="ppm-name">{product.name}</h2>
              <div className="ppm-price">{product.priceDisplay}</div>
              {product.createdAt && (
                <div className="ppm-date">
                  Posted {new Date(product.createdAt).toLocaleDateString("en-US")}
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="ppm-seller">
              <div className="ppm-seller-avatar">
                {(product.seller[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <div className="ppm-seller-name">{product.seller}</div>
                {product.sellerLocation && (
                  <div className="ppm-seller-label">{product.sellerLocation}</div>
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
                        style={s.color ? { color: s.color, fontWeight: 700 } : undefined}
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

          </div>
        </div>
      )}
    </Modal>
  );
}

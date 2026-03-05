/**
 * Post (bài đăng xe) – map từ API sang shape dùng trong UI.
 */

import { POSTING_STATUS } from "../constants/postingStatus";

/** Field chính của Post */
export const POST_FIELDS = [
  "postId", "bicycleName", "brandId", "categoryId", "frameSize", "frameMaterial",
  "groupset", "brakeType", "modelYear", "color", "description", "price", "postStatus",
  "sellerId", "imageUrl", "imageUrls", "createdAt", "updatedAt",
];

/** Post rỗng cho form tạo bài đăng */
export function getDefaultPost() {
  return {
    postId: null,
    bicycleName: "",
    brandId: undefined,
    categoryId: undefined,
    frameSize: "",
    frameMaterial: undefined,
    groupset: undefined,
    brakeType: undefined,
    modelYear: undefined,
    color: "",
    description: "",
    price: undefined,
    postStatus: POSTING_STATUS.PENDING,
    sellerId: null,
    imageUrl: null,
    imageUrls: [],
    images: [],
    status: POSTING_STATUS.PENDING,
    rejectionReason: null,
    views: 0,
    createdAt: null,
    updatedAt: null,
  };
}

/** Map response API GET /posts/:id sang object posting dùng trong UI */
export function mapApiPostToPosting(row, formatCurrency = (n) => String(n)) {
  if (!row || typeof row !== "object") return null;
  const postId = row.postId ?? row.post_id ?? row.id;
  if (postId == null) return null;
  const images = row?.images ?? row?.bicycleImages ?? [];
  const thumb = images.find((i) => i?.isThumbnail ?? i?.is_thumbnail);
  const imageUrl =
    thumb?.imageUrl ?? thumb?.image_url ?? images[0]?.imageUrl ?? images[0]?.image_url ?? null;
  const imageUrls = images.map((i) => i?.imageUrl ?? i?.image_url).filter(Boolean);
  const price = row.price;
  const status =
    row.postStatus ?? row.post_status ?? row.status ?? POSTING_STATUS.PENDING;
  return {
    id: postId,
    postId,
    postingId: postId,
    bikeName: row.bicycleName ?? row.bicycle_name ?? row.title ?? "Untitled",
    brand: row.brandName ?? row.brand_name,
    brandId: row.brandId ?? row.brand_id,
    category: row.categoryName ?? row.category_name,
    categoryId: row.categoryId ?? row.category_id,
    frameSize: row.size ?? row.frameSize ?? row.frame_size,
    frameMaterial: row.frameMaterial ?? row.frame_material,
    groupset: row.groupset,
    brakeType: row.brakeType ?? row.brake_type,
    modelYear: row.modelYear ?? row.model_year,
    color: row.bicycleColor ?? row.bicycle_color ?? row.color,
    description:
      row.bicycleDescription ?? row.bicycle_description ?? row.description,
    price,
    priceDisplay:
      typeof price === "number"
        ? formatCurrency(price)
        : (row.priceDisplay ?? String(price ?? "")),
    imageUrl: imageUrl || (imageUrls[0] ?? null),
    imageUrls: imageUrls.length ? imageUrls : imageUrl ? [imageUrl] : [],
    status,
    rejectionReason: row.rejectionReason ?? row.rejection_reason ?? null,
    sellerId: row.sellerId ?? row.seller_id,
    views: row.views,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
    images: row.images ?? row.bicycleImages,
  };
}

export { POSTING_STATUS };
export default mapApiPostToPosting;

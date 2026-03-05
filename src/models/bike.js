/**
 * Bike – dùng cho rental/booking, chuẩn hóa từ API.
 */

/** Chuẩn hóa bike từ response API */
export function normalizeBike(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id,
    name: raw.name ?? raw.bikeName ?? raw.bicycleName,
    brand: raw.brand ?? raw.brandName,
    category: raw.category ?? raw.categoryName,
    size: raw.size ?? raw.frameSize,
    frameMaterial: raw.frameMaterial ?? raw.frame_material,
    groupset: raw.groupset,
    modelYear: raw.modelYear ?? raw.model_year,
    pricePerDay: raw.pricePerDay ?? raw.price_per_day ?? raw.price,
    imageUrl: raw.imageUrl ?? raw.image_url,
    imageUrls: raw.imageUrls ?? raw.image_urls ?? [],
    available: raw.available ?? true,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

/** Field của Bike */
export const BIKE_FIELDS = [
  "id", "name", "brand", "category", "size", "frameMaterial", "groupset",
  "modelYear", "pricePerDay", "imageUrl", "imageUrls", "available", "createdAt", "updatedAt",
];

/** Bike rỗng */
export function getDefaultBike() {
  return {
    id: null,
    name: "",
    brand: "",
    category: "",
    size: "",
    frameMaterial: "",
    groupset: "",
    modelYear: null,
    pricePerDay: null,
    imageUrl: "",
    imageUrls: [],
    available: true,
    createdAt: null,
    updatedAt: null,
  };
}

export default normalizeBike;

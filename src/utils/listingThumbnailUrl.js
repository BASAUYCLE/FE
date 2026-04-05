/**
 * Thumbnail URL from listing / post DTOs (aliases aligned with ProductDetail & inspector detail).
 * @param {Record<string, unknown> | null | undefined} entity
 * @returns {string}
 */
export function resolveListingThumbnailUrl(entity) {
  if (!entity || typeof entity !== "object") return "";
  const s = (v) =>
    typeof v === "string" && String(v).trim() !== "" ? String(v).trim() : "";
  const top = s(
    entity.thumbnailUrl ??
      entity.thumbnail_url ??
      entity.thumbnail ??
      entity.imageUrl ??
      entity.image_url ??
      entity.bicycleImage,
  );
  if (top) return top;

  const images =
    entity.images ??
    entity.bicycleImages ??
    entity.imageList ??
    entity.postImages ??
    [];
  if (!Array.isArray(images) || images.length === 0) return "";
  const urlOf = (i) => s(i?.imageUrl ?? i?.image_url ?? i?.url);
  const thumb = images.find((i) => i?.isThumbnail);
  return urlOf(thumb) || urlOf(images[0]) || "";
}

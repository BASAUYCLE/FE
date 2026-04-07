/**
 * Ảnh đại diện tin đăng (thumbnail hoặc ảnh đầu) — dùng modal biên bản, card, v.v.
 * @param {Record<string, unknown> | null | undefined} row
 * @returns {string | null}
 */
export function pickListingThumbnailUrl(row) {
  if (!row || typeof row !== "object") return null;
  const images = row.images ?? row.bicycleImages ?? row.imageList ?? [];
  if (Array.isArray(images) && images.length > 0) {
    const thumb = images.find((i) => i?.isThumbnail);
    const urlOf = (i) =>
      i?.imageUrl ?? i?.image_url ?? i?.url ?? null;
    return urlOf(thumb) ?? urlOf(images[0]);
  }
  const direct =
    row.thumbnailUrl ??
    row.thumbnail ??
    row.imageUrl ??
    row.image_url ??
    null;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

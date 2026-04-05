/**
 * Shared row shape for admin inspection reports table & inspector history (same columns / modals).
 */

/** BE LocalDateTime as ISO string or Jackson array [y,m,d,h,mi,s,nano]. */
export function coerceInspectionDateToIso(v) {
  if (v == null || v === "") return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length >= 3) {
    const [y, mo, d, h = 0, mi = 0, s = 0, nano = 0] = v;
    const ms = Number(nano) ? Math.floor(Number(nano) / 1e6) : 0;
    const date = new Date(y, mo - 1, d, h, mi, s, ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

/**
 * @param {Record<string, unknown> | null | undefined} post
 * @returns {string | null}
 */
export function buildListingMetaLine(post) {
  if (!post || typeof post !== "object") return null;
  const brand =
    post.brandName ??
    post.brand_name ??
    (typeof post.brand === "string"
      ? post.brand
      : (post.brand?.brandName ?? post.brand?.name));
  const cat =
    post.categoryName ??
    post.category_name ??
    (typeof post.category === "string"
      ? post.category
      : (post.category?.categoryName ?? post.category?.name));
  const year = post.modelYear ?? post.model_year;
  const sizeRaw = post.size ?? post.frameSize ?? post.frame_size;
  const sizePart =
    sizeRaw != null && String(sizeRaw).trim() !== ""
      ? `Size ${sizeRaw}`
      : null;
  const parts = [brand, cat, year, sizePart].filter(
    (p) => p != null && String(p).trim() !== "" && String(p) !== "—",
  );
  return parts.length ? parts.join(" · ") : null;
}

function firstNonEmptyStr(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : String(v).trim();
    if (s !== "") return s;
  }
  return null;
}

/**
 * Seller / poster display: root row + nested `post` + `post.seller` (BE/Jackson).
 * @param {Record<string, unknown> | null | undefined} row
 */
export function pickSellerFromReportRow(row) {
  if (!row || typeof row !== "object") return "—";
  const post =
    row.post && typeof row.post === "object" && !Array.isArray(row.post)
      ? row.post
      : null;
  const postSeller =
    post?.seller && typeof post.seller === "object" && !Array.isArray(post.seller)
      ? post.seller
      : null;
  const rowSeller =
    row.seller && typeof row.seller === "object" && !Array.isArray(row.seller)
      ? row.seller
      : null;

  return (
    firstNonEmptyStr(
      row.sellerFullName,
      row.seller_full_name,
      row.sellerName,
      row.seller_name,
      typeof row.seller === "string" ? row.seller : null,
      row.memberName,
      row.member_name,
      row.posterName,
      row.poster_name,
      row.ownerName,
      row.owner_name,
      rowSeller?.fullName,
      rowSeller?.full_name,
      rowSeller?.name,
      post?.sellerFullName,
      post?.seller_full_name,
      post?.sellerName,
      post?.seller_name,
      typeof post?.seller === "string" ? post.seller : null,
      postSeller?.fullName,
      postSeller?.full_name,
      postSeller?.name,
      postSeller?.email,
      post?.ownerFullName,
      post?.owner_full_name,
      post?.ownerName,
      post?.member?.fullName,
      post?.member?.name,
      post?.user?.fullName,
      post?.user?.name,
    ) ?? "—"
  );
}

/**
 * @param {Record<string, unknown> | null | undefined} row
 */
export function normalizeInspectionReportRow(row) {
  if (!row || typeof row !== "object") {
    return {
      id: null,
      postId: null,
      title: "—",
      thumbnail: null,
      seller: "—",
      inspector: "—",
      inspectorEmail: "—",
      inspectedAt: null,
      result: null,
      status: "PENDING",
      overallCondition: null,
      notes: null,
      price: null,
      metaLine: null,
    };
  }

  const post =
    row.post && typeof row.post === "object" && !Array.isArray(row.post)
      ? row.post
      : null;
  const images = row.images ?? post?.images ?? [];

  const resultRaw = String(
    row.result ?? row.inspectionResult ?? row.inspection_result ?? "",
  ).toUpperCase();
  const result = resultRaw || null;
  const postStatus = String(
    row.postStatus ?? post?.postStatus ?? post?.status ?? "",
  ).toUpperCase();
  const statusRaw = String(row.status ?? "").toUpperCase();
  const status = (() => {
    if (
      statusRaw === "APPROVED" ||
      statusRaw === "REJECTED" ||
      statusRaw === "PENDING"
    ) {
      return statusRaw;
    }
    if (postStatus === "ADMIN_APPROVED") return "PENDING";
    if (postStatus === "REJECTED" || result === "FAIL") return "REJECTED";
    if (result === "PASS" || postStatus === "AVAILABLE") {
      return "APPROVED";
    }
    return "PENDING";
  })();

  return {
    id: row.reportId ?? row.id ?? row.postId,
    postId: row.postId ?? row.bicyclePostId ?? post?.postId ?? post?.id ?? row.id,
    title:
      row.bicycleName ??
      row.listingTitle ??
      row.title ??
      row.postTitle ??
      post?.bicycleName ??
      post?.title ??
      post?.postTitle ??
      "—",
    thumbnail:
      images.find((i) => i?.isThumbnail)?.imageUrl ??
      images?.[0]?.imageUrl ??
      row.thumbnailUrl ??
      post?.thumbnailUrl ??
      row.thumbnail ??
      post?.thumbnail ??
      row.imageUrl ??
      post?.imageUrl ??
      null,
    seller: pickSellerFromReportRow(row),
    inspector:
      row.inspectorName ??
      row.inspectorFullName ??
      row.inspector?.fullName ??
      row.inspector?.name ??
      row.inspectedByName ??
      row.inspectedBy ??
      row.reviewerName ??
      row.reviewer ??
      row.inspector ??
      "—",
    inspectorEmail:
      row.inspectorEmail ??
      row.inspector?.email ??
      row.reviewerEmail ??
      row.inspectedByEmail ??
      "—",
    inspectedAt:
      row.inspectedAt ??
      row.completedAt ??
      row.updatedAt ??
      row.createdAt ??
      null,
    result: result,
    status: status,
    overallCondition: row.overallCondition ?? row.condition ?? null,
    notes: row.notes ?? row.inspectorNotes ?? null,
    price: row.price ?? row.salePrice ?? null,
    metaLine: row.metaLine ?? null,
  };
}

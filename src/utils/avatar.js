import { API_CONFIG } from "../config/api";

/** Turn `/path` or `path` into absolute URL for `<img src>` (Vite dev vs API host). */
export function resolveMediaUrl(url) {
  const s = String(url ?? "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^data:/i.test(s)) return s;
  if (/^blob:/i.test(s)) return s;
  const base = String(API_CONFIG.BASE_URL || "").replace(/\/$/, "");
  if (!base) return s;
  if (s.startsWith("/")) return `${base}${s}`;
  return s;
}

export function pickFirstNonEmpty(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return null;
}

export function getAvatarUrl(entity, ...extras) {
  return (
    pickFirstNonEmpty(
      entity?.avatar,
      entity?.avatarUrl,
      entity?.avatar_url,
      entity?.profileImageUrl,
      entity?.profile_image_url,
      entity?.profileImage,
      entity?.profile_image,
      entity?.imageUrl,
      entity?.image_url,
      ...extras,
    ) ?? ""
  );
}

function appendVersion(url, version) {
  if (!url) return "";
  if (!version) return String(url);
  const hasQuery = String(url).includes("?");
  return `${url}${hasQuery ? "&" : "?"}v=${encodeURIComponent(String(version))}`;
}

export function getAvatarVersion(entity) {
  return (
    pickFirstNonEmpty(
      entity?.avatarUpdatedAt,
      entity?.avatar_updated_at,
      entity?.updatedAt,
      entity?.updated_at,
      entity?.profileUpdatedAt,
      entity?.profile_updated_at,
    ) ?? ""
  );
}

export function getAvatarSrc(entity, ...extras) {
  const url = getAvatarUrl(entity, ...extras);
  const version = getAvatarVersion(entity);
  return appendVersion(url, version);
}

export function getAvatarInitial(entity, fallback = "U") {
  const name = pickFirstNonEmpty(
    entity?.fullName,
    entity?.name,
    entity?.username,
    entity?.email,
  );
  if (!name) return fallback;
  return String(name).trim().charAt(0).toUpperCase() || fallback;
}

/**
 * Admin transaction / withdrawal rows: nested user or flat avatar fields.
 */
export function getAvatarSrcFromTransaction(tx) {
  if (!tx || typeof tx !== "object") return "";
  const nested = tx?.user ?? tx?.member ?? tx?.account ?? {};
  return getAvatarSrc(
    nested,
    tx,
    nested?.avatar,
    nested?.avatarUrl,
    nested?.avatar_url,
    nested?.profileImageUrl,
    nested?.profile_image_url,
    tx?.userAvatar,
    tx?.userAvatarUrl,
    tx?.user_avatar,
    tx?.user_avatar_url,
    tx?.memberAvatar,
    tx?.member_avatar,
    tx?.memberAvatarUrl,
    tx?.member_avatar_url,
    tx?.avatarUrl,
    tx?.avatar_url,
    tx?.profileImageUrl,
    tx?.profile_image_url,
    tx?.photoUrl,
    tx?.photo_url,
    tx?.picture,
    tx?.pictureUrl,
  );
}

/**
 * `GET /admin/users`-style rows → Map for merging into transaction list when BE omits avatar on tx DTO.
 */
export function buildAvatarUrlMapFromUsers(users) {
  const map = new Map();
  if (!Array.isArray(users)) return map;
  for (const u of users) {
    const id = u?.id ?? u?.userId ?? u?.user_id;
    if (id == null) continue;
    const url = getAvatarSrc(u);
    if (!url) continue;
    const n = Number(id);
    if (Number.isFinite(n)) map.set(n, url);
    map.set(String(id), url);
  }
  return map;
}

function transactionUserId(tx) {
  if (!tx || typeof tx !== "object") return null;
  const v =
    tx.userId ??
    tx.user_id ??
    tx.memberId ??
    tx.member_id ??
    tx.buyerId ??
    tx.buyer_id ??
    tx.sellerId ??
    tx.seller_id ??
    tx?.user?.id ??
    tx?.user?.userId ??
    tx?.user?.user_id ??
    tx?.member?.id;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : String(v);
}

/** Prefer URL on the row; else resolve from admin users map by user id. */
export function getAvatarForTransactionRow(tx, avatarByUserId) {
  const direct = getAvatarSrcFromTransaction(tx);
  if (direct) return direct;
  if (!avatarByUserId || typeof avatarByUserId.get !== "function") return "";
  const uid = transactionUserId(tx);
  if (uid == null) return "";
  return avatarByUserId.get(uid) ?? avatarByUserId.get(Number(uid)) ?? "";
}

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

/**
 * Bicycle listing images from GET /posts/:id — align order & labels with Post form slots.
 * @see src/pages/Post/index.jsx IMAGE_TYPE_BY_SLOT & required slots
 */

const SLOT_ORDER = [
  "OVERALL_DRIVE_SIDE",
  "OVERALL_NON_DRIVE_SIDE",
  "COCKPIT_AREA",
  "DRIVETRAIN_CLOSEUP",
  "FRONT_BRAKE",
  "REAR_BRAKE",
];

/** API imageType → same English labels as Post page */
export const BICYCLE_IMAGE_TYPE_LABEL_EN = {
  OVERALL_DRIVE_SIDE: "Drive Side",
  OVERALL_NON_DRIVE_SIDE: "Non-Drive",
  COCKPIT_AREA: "Cockpit",
  DRIVETRAIN_CLOSEUP: "Drivetrain",
  FRONT_BRAKE: "Front Brake",
  REAR_BRAKE: "Rear Brake",
  DEFECT_POINT: "Defect / damage",
};

function normalizeType(raw) {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

function labelForType(type) {
  const t = normalizeType(type);
  if (BICYCLE_IMAGE_TYPE_LABEL_EN[t]) return BICYCLE_IMAGE_TYPE_LABEL_EN[t];
  if (!t) return "Additional photo";
  return t
    .split(/_+/)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * @param {unknown} images - post.images from API
 * @returns {{ url: string, label: string, imageType: string | null }[]}
 */
export function buildListingPhotosFromPostImages(images) {
  const list = Array.isArray(images) ? images : [];
  const firstBySlot = new Map();
  const extras = [];
  const defects = [];

  for (const img of list) {
    const url = img?.imageUrl ?? img?.image_url ?? img?.url;
    if (!url || typeof url !== "string") continue;
    const imageType = normalizeType(img?.imageType ?? img?.image_type);
    if (SLOT_ORDER.includes(imageType)) {
      if (!firstBySlot.has(imageType)) {
        firstBySlot.set(imageType, { url, imageType });
      }
    } else if (imageType === "DEFECT_POINT") {
      defects.push({ url, imageType });
    } else {
      extras.push({ url, imageType: imageType || null });
    }
  }

  const ordered = [];
  for (const t of SLOT_ORDER) {
    const row = firstBySlot.get(t);
    if (row) {
      ordered.push({
        url: row.url,
        imageType: row.imageType,
        label: labelForType(t),
      });
    }
  }
  for (const e of extras) {
    ordered.push({
      url: e.url,
      imageType: e.imageType,
      label: labelForType(e.imageType),
    });
  }
  defects.forEach((d, i) => {
    ordered.push({
      url: d.url,
      imageType: d.imageType,
      label:
        defects.length > 1
          ? `${BICYCLE_IMAGE_TYPE_LABEL_EN.DEFECT_POINT} (${i + 1})`
          : BICYCLE_IMAGE_TYPE_LABEL_EN.DEFECT_POINT,
    });
  });

  return ordered;
}

/**
 * Inspection guide copy (English) — aligns with `inspectionScoring.js`, `inspectionRubric.js`, and BE.
 */

import {
  INSPECTION_CRITERIA_ROWS,
  INSPECTION_SCORE_OPTIONS,
} from "./inspectionRubric";

export { INSPECTION_CRITERIA_ROWS, INSPECTION_SCORE_OPTIONS };

export const GUIDE_INSPECTION_HERO = Object.freeze({
  title: "Inspection & condition score",
  lead:
    "BASAUYCLE uses a six-criterion rubric. Each criterion is scored with exactly one of four fixed values (0, 3, 7, 10). The server computes conditionPercent (weighted sum, capped at 99%, then a ceiling by the lowest criterion so the % matches the band label), then PASS/FAIL. The inspector preview uses the same logic as the backend (see `InspectionService` on the server).",
});

export const GUIDE_INSPECTION_MEMBER = Object.freeze({
  title: "For members (sellers & buyers)",
  intro:
    "Members do not enter rubric scores; inspectors and the system do. Below: listing statuses and where the UI shows the condition % and PASS/FAIL.",

  sellerFlow: Object.freeze({
    title: "Seller journey",
    bullets: [
      "Create or edit a listing and submit it for review — it waits for admin (e.g. Pending).",
      "After admin approves content, the listing moves to admin-approved, pending inspection (ADMIN_APPROVED): it is queued for the inspector’s rubric.",
      "When the inspector submits: on PASS, the listing usually goes Available on the marketplace with % and report data; on FAIL, it is not offered as a passing inspection — see status in Manage listings per backend rules.",
      "Track status in Manage listings; in-app notifications may fire when a listing is approved or after inspection completes.",
    ],
  }),

  whereToSee: Object.freeze({
    title: "Where to see the % and inspection report",
    bullets: [
      "Product detail (/product/{id}): when the backend exposes a report, the Pro Inspection Report panel shows PASS/FAIL, the condition % bar, the overall band (Excellent / Good / …), and the six criteria (if scores are returned).",
      "On the same page, under Technical specs, the Inspection row gives a short summary (e.g. % with band, or Failed with % when present).",
      "Listing preview modals may show a matching inspection line in the specs table when a report exists.",
      "If there is no report yet or inspection is not finished, those blocks may be hidden or show a not-inspected state — that is expected.",
    ],
  }),

  buyerNotes: Object.freeze({
    title: "Tips for buyers",
    bullets: [
      "Prefer Pro Inspection Report and the Inspection spec row before depositing; % and PASS/FAIL reflect the submitted rubric, not the seller’s opinion.",
      "If the listing is still pending inspection, there may be no public % yet — wait until it is Available (or shows a full report) before deciding.",
    ],
  }),
});

export const GUIDE_INSPECTION_FORMULA = Object.freeze({
  title: "How the condition percentage is calculated",
  bullets: [
    "Each criterion must be scored 0, 3, 7, or 10 only (other values are rejected; error code 1089).",
    "Each criterion has a weight in percent; the six weights sum to 100%.",
    "A criterion’s contribution = (score ÷ 10) × (weight %).",
    "conditionPercent is the sum of those contributions; if the sum is ≥ 100%, it is capped at 99% (used bikes cannot show 100%).",
    "Then a ceiling is applied from the lowest score among all six criteria: if the minimum is ≤3, the displayed % cannot exceed 69%; if the minimum is 7, it cannot exceed 89%; if the minimum is 10, no extra cap (matches the overall band label on the report).",
  ],
  formulaLine:
    "Summary: weighted sum → 99% cap if needed → min-score ceiling → one decimal place, same as the Java `InspectionService`.",
});

export const GUIDE_INSPECTION_PASS_FAIL = Object.freeze({
  title: "How PASS and FAIL are determined",
  bullets: [
    "If frame score = 0 or brake score = 0 → always FAIL, regardless of other criteria (safety / structure).",
    "If conditionPercent is below 50% → FAIL.",
    "Otherwise (all six scores valid, and neither rule above applies) → PASS in the preview logic; the authoritative listing outcome comes from the backend after the submit API.",
    "There is no separate “choose PASS” control: inspectors submit scores and notes only; PASS/FAIL follows the rubric.",
  ],
});

export const GUIDE_INSPECTION_INSPECTOR = Object.freeze({
  title: "For inspectors",
  intro:
    "You enter all six rubric scores and optional notes; the system computes %, PASS/FAIL, and updates the listing after a successful submit. There is no separate “pick PASS” action.",

  navigation: Object.freeze({
    title: "Opening a listing to inspect",
    bullets: [
      "Sign in with the Inspector role; open the dashboard at /inspector (or the details list at /inspector/details).",
      "The queue comes from the API (e.g. admin-approved posts); open a row to load the technical report page at /inspector/{postId} (postId = listing id).",
      "If the post is no longer eligible, submit stays disabled with a warning — do not force a submit.",
    ],
  }),

  formAndSubmit: Object.freeze({
    title: "Scoring form & submit",
    bullets: [
      "For each of the six criteria, pick exactly one score: 0, 3, 7, or 10 (pills/buttons on the UI).",
      "Notes are optional; use them for damage, repairs, or context the scores alone do not capture.",
      "Live preview shows condition %, overall band, PASS/FAIL, and warnings (mechanical 0, frame+drivetrain both ≤3, three or more scores at 3, below 50%) — indicative until you submit.",
      "Click Submit inspection → confirm modal lists scores and preview → confirm to call the submit API; on success, follow the toast and return to the queue (per current app flow).",
    ],
  }),

  errors: Object.freeze({
    title: "When submit fails (1089 & 1033)",
    bullets: [
      "1089 — Invalid or incomplete scores: ensure all six criteria have exactly one of 0, 3, 7, 10; do not submit fractional values or leave any unset.",
      "1033 — Post status does not allow submit: the listing may already be processed, removed from the queue, or not admin-approved; refresh or return to the list, contact admin if it looks wrong.",
      "User-facing errors usually include the backend code or message; fix the underlying issue before retrying.",
    ],
  }),
});

export const GUIDE_INSPECTION_BANDS = Object.freeze({
  title: "Overall condition band",
  intro:
    "After conditionPercent is known, the system may assign a band label (EXCELLENT / GOOD / FAIR / POOR) from percentage thresholds. This is shown alongside the %; it does not replace PASS/FAIL.",
  rows: Object.freeze([
    { minPct: 90, label: "Excellent — like new" },
    { minPct: 70, label: "Good — light signs of use" },
    { minPct: 50, label: "Fair — noticeable wear" },
    { minPct: 0, label: "Poor — needs repair" },
  ]),
});

export const GUIDE_INSPECTION_API_NOTES = Object.freeze({
  title: "Technical notes & error codes",
  bullets: [
    "1089 — a score is not in {0, 3, 7, 10} or a criterion is missing on submit.",
    "1033 — the post is not in a status that allows inspection submit (e.g. not admin-approved or already processed).",
    "The inspector page preview shows estimated % and PASS/FAIL; authoritative values come from the successful submit response.",
  ],
});

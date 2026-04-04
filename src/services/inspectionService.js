import axiosInstance from "./axiosConfig";
import { API_ENDPOINTS } from "../config/api";

const ENDPOINTS = API_ENDPOINTS.INSPECTION;

/**
 * @typedef {0 | 3 | 7 | 10} InspectionScoreValue
 */

/**
 * Body for `POST /inspection/{postId}/submit` (Inspector).
 * Backend computes `conditionPercent`, `overallCondition`, PASS/FAIL, and listing status.
 *
 * @typedef {Object} InspectionSubmitPayload
 * @property {InspectionScoreValue} colorScore      — weight 10%
 * @property {InspectionScoreValue} frameScore      — weight 30% (0 ⇒ auto FAIL)
 * @property {InspectionScoreValue} groupsetScore  — weight 25%
 * @property {InspectionScoreValue} brakeScore     — weight 15% (0 ⇒ auto FAIL)
 * @property {InspectionScoreValue} controlScore   — weight 10%
 * @property {InspectionScoreValue} wheelScore     — weight 10%
 * @property {string} [notes]                      — optional inspector notes
 */

const inspectionService = {
  /** GET /inspection/pending — posts awaiting inspection (e.g. ADMIN_APPROVED). */
  getPendingInspections: (params = {}) =>
    axiosInstance.get(ENDPOINTS.PENDING, { params }),

  /**
   * POST /inspection/{postId}/submit — submit 6-criterion rubric scores.
   *
   * @param {number|string} postId
   * @param {InspectionSubmitPayload} payload
   * @returns {Promise<unknown>} Resolved `response.data` from axios wrapper (typically `{ code, result }`).
   *
   * Common error `code` values (message mapped in axios interceptor):
   * - **1089** — invalid score values (must be 0, 3, 7, or 10).
   * - **1033** — post status does not allow inspection submit.
   */
  submitInspection: (postId, payload) =>
    axiosInstance.post(ENDPOINTS.SUBMIT(postId), payload),
};

export default inspectionService;

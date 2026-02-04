/**
 * Helpers dùng chung cho các service – tránh lặp code.
 */

/** Options cho request khi body là FormData */
export const formDataOptions = (data) =>
  data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};

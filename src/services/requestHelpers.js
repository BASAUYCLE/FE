/**
 * Helpers dùng chung cho các service – tránh lặp code.
 */

/** Options cho request khi body là FormData. Không set Content-Type để browser tự thêm boundary. */
export const formDataOptions = (data) =>
  data instanceof FormData ? {} : {};

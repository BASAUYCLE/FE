/**
 * Format amount as currency. Shared by Wallet, Payment, Orders.
 * @param {number} amount
 * @param {'vnd'|'usd'} [locale='vnd']
 */
export function formatCurrency(amount, locale = "vnd") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";
  if (locale === "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }
  return amount.toLocaleString("vi-VN") + " ₫";
}

/** Parse price string like "$4,250" or "$8,500" to number (USD). */
export function parsePriceString(price) {
  if (typeof price === "number" && !Number.isNaN(price)) return price;
  if (typeof price !== "string") return 0;
  const num = parseFloat(price.replace(/[$,]/g, ""), 10);
  return Number.isNaN(num) ? 0 : num;
}

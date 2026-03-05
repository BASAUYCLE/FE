import { useState, useEffect } from "react";
import systemConfigService from "../services/systemConfigService";

const FALLBACK_RATE = 0.1; // 10% — fallback khi BE chưa sẵn sàng
const CACHE_KEY = "system_deposit_rate";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch {
    return null;
  }
}

function writeCache(value) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // ignore
  }
}

/**
 * Fetch deposit rate từ BE's SystemConfig.
 * DB: config_key = 'DEPOSIT_RATE', config_value = '10' (percent, e.g. 10 → 0.10)
 *
 * @returns {{ depositRate: number, depositPercent: number, loading: boolean }}
 *   depositRate    = số thập phân (0.10)
 *   depositPercent = phần trăm hiển thị (10)
 */
export function useDepositRate() {
  const cached = readCache();
  const [depositRate, setDepositRate] = useState(cached ?? FALLBACK_RATE);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached !== null) return;

    let cancelled = false;
    setLoading(true);

    systemConfigService
      .getByKey("DEPOSIT_RATE")
      .then((res) => {
        if (cancelled) return;
        const raw = res?.result ?? res?.data ?? res;
        // BE có thể trả về object { configKey, configValue } hoặc { value } hoặc string
        const strVal =
          typeof raw === "string"
            ? raw
            : raw?.configValue ?? raw?.config_value ?? raw?.value ?? String(raw ?? "");
        const num = parseFloat(strVal);
        if (!isNaN(num) && num > 0) {
          // Nếu BE trả về 10 (percent) thì chia 100; nếu trả về 0.10 thì dùng trực tiếp
          const rate = num > 1 ? num / 100 : num;
          setDepositRate(rate);
          writeCache(rate);
        }
      })
      .catch(() => {
        // Giữ fallback, không throw
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    depositRate,
    depositPercent: Math.round(depositRate * 100),
    loading,
  };
}

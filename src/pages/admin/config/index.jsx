import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import systemConfigService from "../../../services/systemConfigService";
import { formatCurrency } from "../../../utils/formatCurrency";
import { writeCachedPostingFeeVnd } from "../../../constants/postingFee";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import "../dashboard/index.css";
import "./index.css";

function unwrap(res) {
  return res?.result ?? res?.data ?? res;
}

function toConfigValueString(raw) {
  if (raw == null) return "";
  if (typeof raw === "string" || typeof raw === "number") return String(raw);
  return String(
    raw?.configValue ??
      raw?.config_value ??
      raw?.value ??
      raw?.config?.value ??
      "",
  );
}

function parseNumber(str) {
  const n = typeof str === "number" ? str : parseFloat(String(str ?? ""));
  return Number.isFinite(n) ? n : NaN;
}

export default function AdminConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Stored as form-friendly units:
  // - depositPercent: 0..100
  // - postingFee: VND number
  // - autoConfirmDays: integer days
  const [depositPercent, setDepositPercent] = useState(10);
  const [postingFee, setPostingFee] = useState(50_000);
  const [autoConfirmDays, setAutoConfirmDays] = useState(7);
  const [disputeWindowDays, setDisputeWindowDays] = useState(3);
  const [autoCloseUnshippedDays, setAutoCloseUnshippedDays] = useState(7);
  const [autoRefundShippedDays, setAutoRefundShippedDays] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const [
        depRes,
        feeRes,
        autoRes,
        disputeRes,
        closeUnshippedRes,
        refundShippedRes,
      ] = await Promise.allSettled([
        systemConfigService.getByKey("DEPOSIT_RATE"),
        systemConfigService.getByKey("POSTING_FEE"),
        systemConfigService.getByKey("AUTO_CONFIRM_DAYS"),
        systemConfigService.getByKey("DISPUTE_WINDOW_DAYS"),
        systemConfigService.getByKey("AUTO_CLOSE_UNSHIPPED_DISPUTE_DAYS"),
        systemConfigService.getByKey("AUTO_REFUND_SHIPPED_DISPUTE_DAYS"),
      ]);

      if (depRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(depRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) {
          // BE có thể trả 10 (percent) hoặc 0.1
          const percent = n <= 1 ? n * 100 : n;
          setDepositPercent(Math.max(0, Math.min(100, percent)));
        }
      }

      if (feeRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(feeRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) {
          setPostingFee(n);
          writeCachedPostingFeeVnd(n);
        }
      }

      if (autoRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(autoRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) setAutoConfirmDays(Math.round(n));
      }

      if (disputeRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(disputeRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) setDisputeWindowDays(Math.round(n));
      }

      if (closeUnshippedRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(closeUnshippedRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) setAutoCloseUnshippedDays(Math.round(n));
      }

      if (refundShippedRes.status === "fulfilled") {
        const strVal = toConfigValueString(unwrap(refundShippedRes.value));
        const n = parseNumber(strVal);
        if (!isNaN(n) && n >= 0) setAutoRefundShippedDays(Math.round(n));
      }
    } catch (e) {
      setError(e?.message ?? "Load config failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const preview = useMemo(() => {
    const rate = Math.max(0, Math.min(100, Number(depositPercent) || 0));
    const fee = Number(postingFee) || 0;
    const days = Math.max(0, Math.round(Number(autoConfirmDays) || 0));
    const disputeDays = Math.max(0, Math.round(Number(disputeWindowDays) || 0));
    const closeUnshippedDays = Math.max(
      0,
      Math.round(Number(autoCloseUnshippedDays) || 0),
    );
    const refundShippedDays = Math.max(
      0,
      Math.round(Number(autoRefundShippedDays) || 0),
    );
    return {
      depositPercent: rate,
      depositRate: rate / 100,
      postingFee: fee,
      autoConfirmDays: days,
      disputeWindowDays: disputeDays,
      autoCloseUnshippedDays: closeUnshippedDays,
      autoRefundShippedDays: refundShippedDays,
    };
  }, [
    depositPercent,
    postingFee,
    autoConfirmDays,
    disputeWindowDays,
    autoCloseUnshippedDays,
    autoRefundShippedDays,
  ]);

  const saveAll = useCallback(async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const depValueToSave = String(preview.depositPercent); // save as percent (10)
      const feeValueToSave = String(preview.postingFee);
      const autoValueToSave = String(preview.autoConfirmDays);
      const disputeValueToSave = String(preview.disputeWindowDays);
      const closeUnshippedValueToSave = String(preview.autoCloseUnshippedDays);
      const refundShippedValueToSave = String(preview.autoRefundShippedDays);

      await Promise.all([
        systemConfigService.updateByKey("DEPOSIT_RATE", depValueToSave),
        systemConfigService.updateByKey("POSTING_FEE", feeValueToSave),
        systemConfigService.updateByKey("AUTO_CONFIRM_DAYS", autoValueToSave),
        systemConfigService.updateByKey(
          "DISPUTE_WINDOW_DAYS",
          disputeValueToSave,
        ),
        systemConfigService.updateByKey(
          "AUTO_CLOSE_UNSHIPPED_DISPUTE_DAYS",
          closeUnshippedValueToSave,
        ),
        systemConfigService.updateByKey(
          "AUTO_REFUND_SHIPPED_DISPUTE_DAYS",
          refundShippedValueToSave,
        ),
      ]);

      writeCachedPostingFeeVnd(preview.postingFee);
      setSuccess("Saved successfully.");
    } catch (e) {
      setError(e?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [preview]);

  return (
    <AdminLayout>
      <div className="admin-dashboard-page admin-config-page">
        <div className="admin-dashboard">
          <div className="admin-content">
            <header className="admin-topbar admin-config-topbar">
              <div>
                <h1
                  className="admin-page-title"
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span className="admin-config-title-icon">
                    <Settings size={18} />
                  </span>
                  System config
                </h1>
                <p className="admin-page-subtitle">
                  Configure deposit rate, posting fee, dispute window, and
                  automated dispute timelines.
                </p>
              </div>
              <div className="admin-config-actions">
                <button
                  type="button"
                  className="admin-period-tab"
                  onClick={load}
                  disabled={loading || saving}
                  title="Reload"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  className="admin-primary-button admin-config-save"
                  onClick={saveAll}
                  disabled={loading || saving}
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </header>

            {(error || success) && (
              <div
                className={`admin-config-banner ${error ? "error" : "success"}`}
              >
                <span className="admin-config-banner-icon">
                  {error ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </span>
                <span>{error || success}</span>
              </div>
            )}

            <section className="admin-config-grid">
              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">Deposit rate</div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={depositPercent}
                      min={0}
                      max={100}
                      step={0.5}
                      disabled={loading || saving}
                      onChange={(e) => setDepositPercent(e.target.value)}
                    />
                  </label>
                  <div className="admin-config-help">
                    Preview: {preview.depositPercent.toFixed(1)}% (rate ={" "}
                    {preview.depositRate.toFixed(3)})
                  </div>
                </div>
              </div>

              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">Posting fee</div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={postingFee}
                      min={0}
                      step={1000}
                      disabled={loading || saving}
                      onChange={(e) => setPostingFee(e.target.value)}
                    />
                  </label>
                  <div className="admin-config-help">
                    Preview: {formatCurrency(preview.postingFee)} / listing
                  </div>
                </div>
              </div>

              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">
                      Auto-confirm order
                    </div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={autoConfirmDays}
                      min={0}
                      step={1}
                      disabled={loading || saving}
                      onChange={(e) => setAutoConfirmDays(e.target.value)}
                    />
                  </label>
                  <div className="admin-config-help">
                    Automatically confirms after {preview.autoConfirmDays} day(s)
                    from order delivery/receipt.
                  </div>
                </div>
              </div>

              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">
                      Dispute window (days)
                    </div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={disputeWindowDays}
                      min={0}
                      step={1}
                      disabled={loading || saving}
                      onChange={(e) => setDisputeWindowDays(e.target.value)}
                    />
                  </label>
                  <div className="admin-config-help">
                    DISPUTE_WINDOW_DAYS = {preview.disputeWindowDays} day(s)
                  </div>
                </div>
              </div>

              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">
                      Auto-close unshipped dispute (days)
                    </div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={autoCloseUnshippedDays}
                      min={0}
                      step={1}
                      disabled={loading || saving}
                      onChange={(e) =>
                        setAutoCloseUnshippedDays(e.target.value)
                      }
                    />
                  </label>
                  <div className="admin-config-help">
                    AUTO_CLOSE_UNSHIPPED_DISPUTE_DAYS ={" "}
                    {preview.autoCloseUnshippedDays} day(s)
                  </div>
                </div>
              </div>

              <div className="admin-card admin-config-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-card-title">
                      Auto-refund shipped dispute (days)
                    </div>
                  </div>
                </div>
                <div className="admin-config-body">
                  <label className="admin-config-field">
                    <input
                      type="number"
                      className="admin-config-input"
                      value={autoRefundShippedDays}
                      min={0}
                      step={1}
                      disabled={loading || saving}
                      onChange={(e) => setAutoRefundShippedDays(e.target.value)}
                    />
                  </label>
                  <div className="admin-config-help">
                    AUTO_REFUND_SHIPPED_DISPUTE_DAYS ={" "}
                    {preview.autoRefundShippedDays} day(s)
                  </div>
                </div>
              </div>
            </section>

            {loading && (
              <div className="admin-table-empty">Loading configuration...</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

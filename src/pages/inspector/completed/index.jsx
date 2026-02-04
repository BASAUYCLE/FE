import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import {
  INSPECTOR_NAV_LINKS,
  getInspectorActiveLink,
} from "../../../config/inspectorNav";
import { mockCompletedOrders, getInspectionReport } from "../../../data/inspections";
import { Search, Filter, Eye, Download } from "lucide-react";
import { message } from "antd";
import "./index.css";

const PAGE_SIZE = 5;

function formatCompletedDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildReportHtml(order, report) {
  const completedStr = formatCompletedDate(order.completedAt);
  let checklistHtml = "";
  if (report?.checklist?.length) {
    checklistHtml = report.checklist
      .map(
        (g) =>
          `<h3 style="font-size:12px;color:#64748b;margin:12px 0 6px 0;">${g.category}</h3>
          <ul style="margin:0 0 8px 0;padding-left:20px;font-size:13px;">
            ${(g.items || []).map((i) => `<li><strong>${i.title}</strong>: ${i.description ?? ""} — ${i.status ?? ""}</li>`).join("")}
          </ul>`
      )
      .join("");
  }
  const notes = report?.inspectorNotes ? `<p style="margin:8px 0;font-size:13px;"><strong>Inspector notes:</strong> ${report.inspectorNotes}</p>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Inspection Report - ${order.reportId}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:700px;margin:24px auto;padding:0 16px;color:#0f172a;">
  <h1 style="font-size:1.5rem;margin-bottom:8px;">Inspection Report</h1>
  <p style="color:#64748b;font-size:14px;margin:0 0 24px 0;">BASAUYCLE · Completed order</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><strong>Report ID</strong></td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${order.reportId}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><strong>Bicycle</strong></td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${order.bicycleName} (${order.bicycleType})</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><strong>Seller</strong></td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${order.sellerName}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><strong>Completed</strong></td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${completedStr}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;"><strong>Status</strong></td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">${order.status}</td></tr>
  </table>
  ${notes}
  ${checklistHtml ? `<h2 style="font-size:14px;margin:20px 0 8px 0;">Checklist</h2>${checklistHtml}` : ""}
  <p style="margin-top:24px;font-size:12px;color:#94a3b8;">Generated from BASAUYCLE Inspector · ${new Date().toLocaleString()}</p>
</body>
</html>`;
}

export default function InspectorCompleted() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mockCompletedOrders;
    return mockCompletedOrders.filter(
      (o) =>
        o.reportId?.toLowerCase().includes(q) ||
        o.bicycleName?.toLowerCase().includes(q) ||
        o.sellerName?.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filteredOrders.slice(start, start + PAGE_SIZE);

  const handleView = (order) => {
    const id = order.inspectionId || order.id;
    navigate(`/inspector/${id}`);
  };

  const handleDownload = (order) => {
    const report = order.inspectionId ? getInspectionReport(order.inspectionId) : null;
    const html = buildReportHtml(order, report);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Inspection-Report-${order.reportId || order.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success("Report downloaded. Open the file in a browser; you can print to PDF from there.");
  };

  return (
    <div className="inspector-page">
      <Header
        navLinks={INSPECTOR_NAV_LINKS}
        activeLink={getInspectorActiveLink(pathname)}
        navVariant="pill"
        showSearch={false}
        showWishlistIcon={false}
        showAvatar
        showSellButton={false}
        showLogin={false}
      />
      <div className="inspector-dashboard">
        <div className="inspector-content completed-orders-content">
          <div className="admin-card completed-orders-card">
            <div className="admin-card-header completed-orders-header">
              <div className="inspector-queue-toolbar">
                <div className="inspector-search">
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search by report ID or bicycle..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <button type="button" className="admin-outline-button">
                  <Filter size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Filters
                </button>
              </div>
            </div>

            <div className="admin-table">
              <div className="completed-table-row completed-table-header">
                <div>REPORT ID</div>
                <div>BICYCLE</div>
                <div>SELLER</div>
                <div>COMPLETED DATE</div>
                <div>STATUS</div>
                <div>ACTIONS</div>
              </div>
              {pageItems.length === 0 ? (
                <div className="inspector-card-empty" style={{ gridColumn: "1 / -1", padding: "32px" }}>
                  No completed orders found.
                </div>
              ) : (
                pageItems.map((order) => (
                  <div key={order.id} className="completed-table-row">
                    <div className="completed-report-id">{order.reportId}</div>
                    <div>
                      <div className="inspector-bike-name">{order.bicycleName}</div>
                      <div className="inspector-bike-meta">{order.bicycleType}</div>
                    </div>
                    <div className="inspector-seller-name">{order.sellerName}</div>
                    <div>{formatCompletedDate(order.completedAt)}</div>
                    <div>
                      <span className="completed-status-badge">{order.status}</span>
                    </div>
                    <div className="completed-actions-cell">
                      <button
                        type="button"
                        className="admin-actions-button"
                        aria-label="View report"
                        onClick={() => handleView(order)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        className="admin-outline-button completed-btn-download"
                        onClick={() => handleDownload(order)}
                      >
                        <Download size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredOrders.length > 0 && (
              <div className="inspector-pagination">
                <span>
                  Showing {start + 1} to {Math.min(start + PAGE_SIZE, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </span>
                <div className="inspector-pagination-btns">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={p === page ? "active" : ""}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

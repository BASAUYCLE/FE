import "../../pages/admin/transaction/index.css";

/**
 * Thanh phân trang thống nhất (pattern admin-disputes):
 * trái: "{totalCount} {nounPhrase} · Page {page}/{totalPages}", phải: ‹ ›
 */
export default function AdminPaginationBar({
  totalCount,
  page,
  totalPages,
  setPage,
  /** Ví dụ: "disputes", "listing(s)", "transactions", "reports", "member(s)" */
  nounPhrase,
  className,
  style,
  /** Mặc định xám; truyền (vd. #0f172a) khi cần khớp footer trang admin */
  labelColor = "#64748b",
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      className={className}
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 12,
        ...style,
      }}
    >
      <span style={{ color: labelColor, fontSize: 13 }}>
        {totalCount} {nounPhrase} · Page {page}/{totalPages}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          type="button"
          className="admin-tx-page-btn"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        <button
          type="button"
          className="admin-tx-page-btn"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

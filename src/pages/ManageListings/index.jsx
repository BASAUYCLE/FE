import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Table,
  Tabs,
  Input,
  Button,
  Tag,
  Typography,
  Space,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Switch,
} from "antd";
import {
  Search,
  Plus,
  Pencil,
  Rocket,
  Trash2,
  MoreVertical,
  RotateCcw,
  Send,
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { usePostings } from "../../contexts/PostingContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../contexts/useNotifications";
import {
  POSTING_STATUS,
  POSTING_STATUS_LABEL,
  POSTING_STATUS_TAG_COLOR,
} from "../../constants/postingStatus";
import postService from "../../services/postService";
import "./index.css";

const BREADCRUMB_ITEMS = [
  { label: "Account", path: "/account" },
  { label: "Listing Management" },
];

/* Tab theo luồng: PENDING → ADMIN_APPROVED → AVAILABLE | REJECTED; + VERIFIED, DEPOSITED, SOLD, DRAFTED */
const TAB_KEYS = {
  ALL: "all",
  PENDING: POSTING_STATUS.PENDING,
  ADMIN_APPROVED: POSTING_STATUS.ADMIN_APPROVED,
  AVAILABLE: POSTING_STATUS.AVAILABLE,
  VERIFIED: POSTING_STATUS.VERIFIED,
  DEPOSITED: POSTING_STATUS.DEPOSITED,
  REJECTED: POSTING_STATUS.REJECTED,
  SOLD: POSTING_STATUS.SOLD,
  DRAFTED: POSTING_STATUS.DRAFTED,
};

const TAB_ITEMS = [
  { key: TAB_KEYS.ALL, label: "All" },
  { key: TAB_KEYS.PENDING, label: "Pending approval" },
  { key: TAB_KEYS.ADMIN_APPROVED, label: "Pending inspection" },
  { key: TAB_KEYS.AVAILABLE, label: "Available" },
  { key: TAB_KEYS.VERIFIED, label: "Verified" },
  { key: TAB_KEYS.DEPOSITED, label: "Deposited" },
  { key: TAB_KEYS.REJECTED, label: "Rejected" },
  { key: TAB_KEYS.SOLD, label: "Sold" },
  { key: TAB_KEYS.DRAFTED, label: "Drafts" },
];

import { formatDate } from "../../utils/date";

const POSTING_STATUS_STORAGE_KEY = "basauycle-posting-status-prev";

function getStatusLabel(status) {
  return POSTING_STATUS_LABEL[status] ?? status;
}

export default function ManageListings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { postings, updatePostingStatus, deletePosting, loadMyListings } =
    usePostings();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState(TAB_KEYS.ALL);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [hideDrafts, setHideDrafts] = useState(false);
  const [submittingDraftId, setSubmittingDraftId] = useState(null);

  const sellerId = user?.userId ?? user?.user_id ?? user?.id ?? null;

  const fetchMyPostings = useCallback(async () => {
    let effectiveSellerId = sellerId;
    if (!effectiveSellerId && user) {
      try {
        const { userService } = await import("../../services");
        const profile = await userService.getProfile();
        effectiveSellerId =
          profile?.userId ?? profile?.user_id ?? profile?.id ?? null;
      } catch {
        // ignore
      }
    }
    if (!effectiveSellerId || !loadMyListings) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      await loadMyListings(effectiveSellerId);
    } catch (err) {
      const msg = err?.message ?? err?.data?.message ?? "";
      const isNoPosts = /user has no posts|no posts|chưa có tin/i.test(
        String(msg),
      );
      if (!isNoPosts) {
        console.error("[ManageListings] fetchMyPostings:", err);
        message.error(msg || "Failed to load listings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId, user, loadMyListings]);

  useEffect(() => {
    fetchMyPostings();
  }, [fetchMyPostings]);

  // Thông báo cho member khi bài đăng chuyển sang đã duyệt (ADMIN_APPROVED), hiển thị (AVAILABLE) hoặc bị từ chối (REJECTED). Dùng localStorage để nhớ trạng thái trước, nhận thông báo dù mở Home hay Quản lý tin đăng.
  useEffect(() => {
    if (!postings.length || !addNotification) return;
    let prev = {};
    try {
      const raw = localStorage.getItem(POSTING_STATUS_STORAGE_KEY);
      if (raw) prev = JSON.parse(raw);
    } catch (_) {}
    for (const p of postings) {
      const id = p.id;
      const status = p.status;
      const prevStatus = prev[id];
      const name = p.bikeName || "Listing";
      if (
        status === POSTING_STATUS.ADMIN_APPROVED &&
        prevStatus === POSTING_STATUS.PENDING
      ) {
        addNotification({
          title: "Listing approved",
          message: `"${name}" has been approved and is pending inspection.`,
          type: "success",
        });
      } else if (
        status === POSTING_STATUS.AVAILABLE &&
        (prevStatus === POSTING_STATUS.PENDING ||
          prevStatus === POSTING_STATUS.ADMIN_APPROVED)
      ) {
        addNotification({
          title: "Listing is live",
          message: `"${name}" has passed inspection and is now on Marketplace.`,
          type: "success",
        });
      } else if (
        status === POSTING_STATUS.REJECTED &&
        prevStatus &&
        prevStatus !== POSTING_STATUS.REJECTED
      ) {
        addNotification({
          title: "Listing rejected",
          message: p.rejectionReason
            ? `"${name}" was rejected: ${p.rejectionReason}`
            : `"${name}" has been rejected.`,
          type: "warning",
        });
      }
    }
    try {
      localStorage.setItem(
        POSTING_STATUS_STORAGE_KEY,
        JSON.stringify(
          Object.fromEntries(postings.map((p) => [p.id, p.status])),
        ),
      );
    } catch (_) {}
  }, [postings, addNotification]);

  const filteredByTab = useMemo(() => {
    // Chỉ hiển thị bài thuộc về seller hiện tại (phòng trường hợp postings có lẫn dữ liệu cũ)
    const mySellerId = sellerId;
    let list = postings;
    if (mySellerId != null) {
      list = list.filter((p) => {
        const ownerId =
          p.sellerId ??
          p.seller_id ??
          p.seller?.id ??
          p.seller?.userId ??
          null;
        return ownerId == mySellerId;
      });
    }
    if (activeTab === TAB_KEYS.ALL) {
      if (hideDrafts) list = list.filter((p) => p.status !== POSTING_STATUS.DRAFTED);
    } else {
      list = list.filter((p) => p.status === activeTab);
    }
    return list;
  }, [postings, activeTab, hideDrafts]);

  const filteredBySearch = useMemo(() => {
    if (!searchText.trim()) return filteredByTab;
    const q = searchText.trim().toLowerCase();
    return filteredByTab.filter(
      (p) =>
        (p.bikeName && p.bikeName.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.postingId && p.postingId.toLowerCase().includes(q)),
    );
  }, [filteredByTab, searchText]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBySearch.slice(start, start + pageSize);
  }, [filteredBySearch, page, pageSize]);

  const handleDelete = (id) => {
    const posting = postings.find(
      (p) => p.id === id || p.id === Number(id) || p.backendPostId === id || p.backendPostId === Number(id),
    );
    if (posting) setDeleteModal({ open: true, id, name: posting.bikeName });
  };

  const handleRelist = (record) => {
    updatePostingStatus(record.id, POSTING_STATUS.ACTIVE);
    addNotification({
      title: "Listing relisted",
      message: `"${record.bikeName}" has been relisted and is now available.`,
      type: "success",
      status: "Available",
    });
    message.success("Listing has been relisted.");
  };

  const handleSubmitDraft = async (record) => {
    const id = record.id ?? record.backendPostId;
    if (!id) return;
    setSubmittingDraftId(id);
    try {
      await postService.submitDraft(id);
      addNotification({
        title: "Submitted for review",
        message: `"${record.bikeName}" has been sent for admin/inspector approval.`,
        type: "success",
      });
      message.success("Draft submitted for review. Awaiting approval.");
      await fetchMyPostings();
    } catch (err) {
      const msg = err?.message ?? err?.data?.message ?? "Submit for review failed.";
      message.error(msg);
    } finally {
      setSubmittingDraftId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const name = deleteModal.name;
    const idToDelete = deleteModal.id;
    setDeleting(true);
    try {
      await deletePosting(idToDelete);
      addNotification({
        title: "Listing deleted",
        message: name
          ? `"${name}" has been deleted.`
          : "Listing has been deleted.",
        type: "info",
        status: "Deleted",
      });
      message.success("Listing deleted.");
      setDeleteModal({ open: false, id: null, name: "" });
      setPage(1);
    } catch (err) {
      const msg =
        err?.message ??
        err?.data?.message ??
        "Cannot delete this listing. It may have been already deleted or you do not have permission.";
      message.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: "PRODUCT",
      dataIndex: "bikeName",
      key: "product",
      width: 280,
      render: (_, record) => {
        const canViewDetail =
          record.status === POSTING_STATUS.AVAILABLE ||
          record.status === POSTING_STATUS.ADMIN_APPROVED ||
          record.status === POSTING_STATUS.VERIFIED ||
          record.status === POSTING_STATUS.PENDING ||
          record.status === POSTING_STATUS.DRAFTED ||
          record.status === POSTING_STATUS.DEPOSITED ||
          record.status === POSTING_STATUS.REJECTED ||
          record.status === POSTING_STATUS.SOLD;
        const productName = (
          <Typography.Text strong className="manage-listings-product-name">
            {record.bikeName}
          </Typography.Text>
        );
        return (
          <div className="manage-listings-product">
            <div className="manage-listings-thumb">
              {record.imageUrl ? (
                <img src={record.imageUrl} alt={record.bikeName} />
              ) : (
                <div className="manage-listings-thumb-placeholder">Image</div>
              )}
            </div>
            <div className="manage-listings-product-info">
              {canViewDetail ? (
                <Link
                  to={`/product/${record.id}`}
                  className="manage-listings-product-name-link"
                >
                  {productName}
                </Link>
              ) : (
                productName
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "PRICE",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (val, record) => (
        <span className="manage-listings-price">
          {record.priceDisplay ||
            (val != null && val !== "" ? String(val) : "—")}
        </span>
      ),
    },
    {
      title: "POST DATE",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (val) => formatDate(val, { locale: "en-US" }) || "—",
    },
    {
      title: "VIEWS",
      dataIndex: "views",
      key: "views",
      width: 100,
      render: (v) => (v != null ? Number(v).toLocaleString("en-US") : "0"),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status, record) => {
        const tag = (
          <Tag color={POSTING_STATUS_TAG_COLOR[status] ?? "default"}>
            {getStatusLabel(status)}
          </Tag>
        );
        if (status === POSTING_STATUS.REJECTED && record.rejectionReason) {
          return (
            <Tooltip title={record.rejectionReason} placement="topLeft">
              <span>{tag}</span>
            </Tooltip>
          );
        }
        return tag;
      },
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 160,
      render: (_, record) => {
        const isSold = record.status === POSTING_STATUS.SOLD;
        const isDraftRow = record.status === POSTING_STATUS.DRAFTED;
        const actionItems = [
          {
            key: "edit",
            icon: <Pencil size={14} />,
            label: "Edit",
            onClick: () => navigate(`/post?edit=${record.id}`),
          },
          ...(isDraftRow
            ? [
                {
                  key: "submitDraft",
                  icon: <Send size={14} />,
                  label: "Submit for review",
                  onClick: () => handleSubmitDraft(record),
                },
              ]
            : []),
          ...(record.status === POSTING_STATUS.AVAILABLE
            ? [
                {
                  key: "promote",
                  icon: <Rocket size={14} />,
                  label: "Promote",
                  onClick: () =>
                    message.info("Promote feature is under development"),
                },
              ]
            : []),
          ...(isSold
            ? [
                {
                  key: "relist",
                  icon: <RotateCcw size={14} />,
                  label: "Relist",
                  onClick: () => handleRelist(record),
                },
              ]
            : []),
          {
            key: "delete",
            icon: <Trash2 size={14} />,
            label: "Delete",
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        const isDraft = record.status === POSTING_STATUS.DRAFTED;

        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<Pencil size={14} />}
              onClick={() => navigate(`/post?edit=${record.id}`)}
              title="Edit"
            />
            {isDraft && (
              <Tooltip title="Submit for review (admin/inspector will approve)">
                <Button
                  type="primary"
                  size="small"
                  icon={<Send size={14} />}
                  loading={submittingDraftId === (record.id ?? record.backendPostId)}
                  onClick={() => handleSubmitDraft(record)}
                  title="Submit for review"
                >
                  Gửi duyệt
                </Button>
              </Tooltip>
            )}
            {record.status === POSTING_STATUS.AVAILABLE && (
              <Button
                type="text"
                size="small"
                icon={<Rocket size={14} />}
                onClick={() =>
                  message.info("Promote feature is under development")
                }
                title="Promote"
              />
            )}
            {isSold && (
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => handleRelist(record)}
                title="Relist"
              />
            )}
            <Dropdown
              menu={{
                items: actionItems.map(
                  ({ key, icon, label, danger, onClick }) => ({
                    key,
                    icon,
                    label,
                    danger,
                    onClick,
                  }),
                ),
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreVertical size={14} />}
                title="More"
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const tabCounts = useMemo(() => {
    const counts = { [TAB_KEYS.ALL]: postings.length };
    TAB_ITEMS.filter((t) => t.key !== TAB_KEYS.ALL).forEach((t) => {
      counts[t.key] = postings.filter((p) => p.status === t.key).length;
    });
    return counts;
  }, [postings]);

  return (
    <div className="manage-listings-page">
      <Header showSearch={false} />
      <main className="manage-listings-main">
        <div className="manage-listings-container">
          <PageBreadcrumb items={BREADCRUMB_ITEMS} />
          <div className="manage-listings-header">
            <div>
              <Typography.Title level={2} className="manage-listings-title">
                Listing Management
              </Typography.Title>
              <Typography.Text
                type="secondary"
                className="manage-listings-subtitle"
              >
                Track, edit and promote your listings in one place.
              </Typography.Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => navigate("/post")}
              className="manage-listings-btn-post"
            >
              Post new listing
            </Button>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(k) => {
              setActiveTab(k);
              setPage(1);
            }}
            className="manage-listings-tabs"
            items={TAB_ITEMS.map((t) => ({
              key: t.key,
              label: (
                <span>
                  {t.label} ({tabCounts[t.key] ?? 0})
                </span>
              ),
            }))}
          />

          <div className="manage-listings-toolbar">
            <Input
              placeholder="Search by bike name, brand or ID..."
              prefix={<Search size={16} color="#94a3b8" />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              allowClear
              className="manage-listings-search"
            />
            <Space align="center" className="manage-listings-hide-drafts">
              <Typography.Text type="secondary">Hide draft</Typography.Text>
              <Switch
                checked={hideDrafts}
                onChange={setHideDrafts}
                size="small"
              />
            </Space>
          </div>

          <div className="manage-listings-table-wrap">
            <Table
              dataSource={paginatedData}
              columns={columns}
              rowKey="id"
              pagination={false}
              loading={loading}
              locale={{
                emptyText: loading ? "Loading..." : "No listings in this tab.",
              }}
            />
            {filteredBySearch.length > 0 && (
              <div className="manage-listings-pagination">
                <Typography.Text type="secondary">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredBySearch.length)} of{" "}
                  {filteredBySearch.length} listing(s)
                </Typography.Text>
                <Space>
                  <Button
                    size="small"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from(
                    { length: Math.ceil(filteredBySearch.length / pageSize) },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === page ||
                        n === Math.ceil(filteredBySearch.length / pageSize) ||
                        Math.abs(n - page) <= 1,
                    )
                    .map((n, idx, arr) => (
                      <span key={n}>
                        {idx > 0 && arr[idx - 1] !== n - 1 && " … "}
                        <Button
                          type={page === n ? "primary" : "default"}
                          size="small"
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </Button>
                      </span>
                    ))}
                  <Button
                    size="small"
                    disabled={
                      page >= Math.ceil(filteredBySearch.length / pageSize)
                    }
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <Modal
        title="Confirm delete"
        open={deleteModal.open}
        onOk={confirmDelete}
        onCancel={() => !deleting && setDeleteModal({ open: false, id: null, name: "" })}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={deleting}
      >
        Are you sure you want to delete &quot;{deleteModal.name}&quot;? This
        action cannot be undone.
      </Modal>
    </div>
  );
}

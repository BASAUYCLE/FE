import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import {
  Search,
  Plus,
  Pencil,
  Rocket,
  Trash2,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import PageBreadcrumb from "../../components/PageBreadcrumb";
import { usePostings } from "../../contexts/PostingContext";
import { useNotifications } from "../../contexts/useNotifications";
import {
  POSTING_STATUS,
  POSTING_STATUS_LABEL,
  POSTING_STATUS_LABEL_VI,
  POSTING_STATUS_TAG_COLOR,
} from "../../constants/postingStatus";
import "./index.css";

const BREADCRUMB_ITEMS = [
  { label: "Tài khoản", path: "/account" },
  { label: "Quản lý tin đăng" },
];

const TAB_KEYS = {
  ALL: "all",
  ACTIVE: POSTING_STATUS.ACTIVE,
  VERIFIED: POSTING_STATUS.VERIFIED,
  REJECTED: POSTING_STATUS.REJECTED,
  DRAFT: POSTING_STATUS.DRAFT,
};

const TAB_ITEMS = [
  { key: TAB_KEYS.ALL, label: "Tất cả" },
  { key: TAB_KEYS.ACTIVE, label: "Đang hiển thị" },
  { key: TAB_KEYS.VERIFIED, label: "Đã qua kiểm định" },
  { key: TAB_KEYS.REJECTED, label: "Bị từ chối" },
  { key: TAB_KEYS.DRAFT, label: "Bản nháp" },
];

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  return (
    POSTING_STATUS_LABEL_VI[status] ?? POSTING_STATUS_LABEL[status] ?? status
  );
}

export default function ManageListings() {
  const navigate = useNavigate();
  const { postings, updatePostingStatus, deletePosting } = usePostings();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState(TAB_KEYS.ALL);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });

  const filteredByTab = useMemo(() => {
    if (activeTab === TAB_KEYS.ALL) return postings;
    return postings.filter((p) => p.status === activeTab);
  }, [postings, activeTab]);

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
    const posting = postings.find((p) => p.id === id);
    if (posting) setDeleteModal({ open: true, id, name: posting.bikeName });
  };

  const handleRelist = (record) => {
    updatePostingStatus(record.id, POSTING_STATUS.ACTIVE);
    addNotification({
      title: "Đã đăng lại tin",
      message: `"${record.bikeName}" đã được đăng lại và đang hiển thị.`,
      type: "success",
      status: "Đang hiển thị",
    });
    message.success("Đã đăng lại tin đăng.");
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      const name = deleteModal.name;
      deletePosting(deleteModal.id);
      addNotification({
        title: "Đã xóa tin đăng",
        message: name ? `Tin "${name}" đã được xóa.` : "Tin đăng đã được xóa.",
        type: "info",
        status: "Đã xóa",
      });
      message.success("Đã xóa tin đăng");
      setDeleteModal({ open: false, id: null, name: "" });
      setPage(1);
    }
  };

  const columns = [
    {
      title: "SẢN PHẨM",
      dataIndex: "bikeName",
      key: "product",
      width: 280,
      render: (_, record) => (
        <div className="manage-listings-product">
          <div className="manage-listings-thumb">
            {record.imageUrl ? (
              <img src={record.imageUrl} alt={record.bikeName} />
            ) : (
              <div className="manage-listings-thumb-placeholder">Ảnh</div>
            )}
          </div>
          <div className="manage-listings-product-info">
            <Typography.Text strong className="manage-listings-product-name">
              {record.bikeName}
            </Typography.Text>
            <Typography.Text
              type="secondary"
              className="manage-listings-product-id"
            >
              ID: {record.postingId}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "GIÁ",
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
      title: "NGÀY ĐĂNG",
      dataIndex: "createdAt",
      key: "date",
      width: 120,
      render: (val) => formatDate(val),
    },
    {
      title: "LƯỢT XEM",
      dataIndex: "views",
      key: "views",
      width: 100,
      render: (v) => (v != null ? Number(v).toLocaleString("vi-VN") : "0"),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => (
        <Tag color={POSTING_STATUS_TAG_COLOR[status] ?? "default"}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "THAO TÁC",
      key: "actions",
      width: 160,
      render: (_, record) => {
        const isSold = record.status === POSTING_STATUS.SOLD;
        const actionItems = [
          {
            key: "edit",
            icon: <Pencil size={14} />,
            label: "Chỉnh sửa",
            onClick: () => navigate(`/post?edit=${record.id}`),
          },
          ...(record.status === POSTING_STATUS.ACTIVE ||
          record.status === POSTING_STATUS.VERIFIED
            ? [
                {
                  key: "promote",
                  icon: <Rocket size={14} />,
                  label: "Quảng bá",
                  onClick: () =>
                    message.info("Tính năng quảng bá đang phát triển"),
                },
              ]
            : []),
          ...(isSold
            ? [
                {
                  key: "relist",
                  icon: <RotateCcw size={14} />,
                  label: "Đăng lại",
                  onClick: () => handleRelist(record),
                },
              ]
            : []),
          {
            key: "delete",
            icon: <Trash2 size={14} />,
            label: "Xóa",
            danger: true,
            onClick: () => handleDelete(record.id),
          },
        ];

        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<Pencil size={14} />}
              onClick={() => navigate(`/post?edit=${record.id}`)}
              title="Chỉnh sửa"
            />
            {(record.status === POSTING_STATUS.ACTIVE ||
              record.status === POSTING_STATUS.VERIFIED) && (
              <Button
                type="text"
                size="small"
                icon={<Rocket size={14} />}
                onClick={() =>
                  message.info("Tính năng quảng bá đang phát triển")
                }
                title="Quảng bá"
              />
            )}
            {isSold && (
              <Button
                type="text"
                size="small"
                icon={<RotateCcw size={14} />}
                onClick={() => handleRelist(record)}
                title="Đăng lại"
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
                title="Thêm"
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
      <Header />
      <main className="manage-listings-main">
        <div className="manage-listings-container">
          <PageBreadcrumb items={BREADCRUMB_ITEMS} />
          <div className="manage-listings-header">
            <div>
              <Typography.Title level={2} className="manage-listings-title">
                Quản lý tin đăng
              </Typography.Title>
              <Typography.Text
                type="secondary"
                className="manage-listings-subtitle"
              >
                Theo dõi, chỉnh sửa và quảng bá tin đăng xe của bạn tại một nơi.
              </Typography.Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => navigate("/post")}
              className="manage-listings-btn-post"
            >
              Đăng xe mới
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

          <Input
            placeholder="Tìm tin theo tên xe, hãng hoặc ID..."
            prefix={<Search size={16} color="#94a3b8" />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            allowClear
            className="manage-listings-search"
          />

          <div className="manage-listings-table-wrap">
            <Table
              dataSource={paginatedData}
              columns={columns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: "Chưa có tin đăng nào trong mục này." }}
            />
            {filteredBySearch.length > 0 && (
              <div className="manage-listings-pagination">
                <Typography.Text type="secondary">
                  Hiển thị {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredBySearch.length)} trong
                  tổng số {filteredBySearch.length} tin
                </Typography.Text>
                <Space>
                  <Button
                    size="small"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Trước
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
                    Sau
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <Modal
        title="Xác nhận xóa"
        open={deleteModal.open}
        onOk={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, name: "" })}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        Bạn có chắc muốn xóa tin đăng &quot;{deleteModal.name}&quot;? Hành động
        này không thể hoàn tác.
      </Modal>
    </div>
  );
}

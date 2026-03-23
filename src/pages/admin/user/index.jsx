import "./index.css";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { message, Modal, Dropdown, Input } from "antd";
import userService from "../../../services/userService";
import { confirmCrud } from "../../../utils/confirmCrud";
import {
  ChevronDown,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

const statsConfig = [
  {
    key: "members",
    label: "Total Members",
    tone: "green",
    icon: <Users />,
    filter: "All",
  },
  {
    key: "verified",
    label: "Verified",
    tone: "green",
    icon: <ShieldCheck />,
    filter: "Verified",
  },
  {
    key: "pending",
    label: "Pending",
    tone: "red",
    icon: <UserCheck />,
    filter: "Pending",
  },
  {
    key: "rejected",
    label: "Rejected",
    tone: "gray",
    icon: <Users />,
    filter: "Rejected",
  },
  {
    key: "hidden",
    label: "Hidden",
    tone: "orange",
    icon: <Users />,
    filter: "Hidden",
  },
];

const PAGE_SIZE = 10;

function normalizeUser(row) {
  const id = row.id ?? row.userId ?? row.user_id;
  const name =
    row.name ??
    row.fullName ??
    row.full_name ??
    row.user_full_name ??
    row.email ??
    "—";
  const email = row.email ?? row.user_email ?? "—";
  const role = row.role ?? row.userRole ?? row.user_role ?? "MEMBER";
  // Database: is_verified = "VERIFIED" | "PENDING" | "REJECTED" | "HIDDEN"
  const rawStatus =
    row.is_verified ??
    row.isVerified ??
    row.status ??
    row.accountStatus ??
    row.account_status;
  let status = "Pending";
  if (
    rawStatus === "VERIFIED" ||
    rawStatus === true ||
    rawStatus === "true" ||
    rawStatus === "Active"
  ) {
    status = "Active";
  } else if (rawStatus === "REJECTED") {
    status = "Rejected";
  } else if (rawStatus === "HIDDEN") {
    status = "Hidden";
  }
  const joined =
    row.joined ?? row.createdAt ?? row.created_at ?? row.user_created_at ?? "—";
  const cccdFront =
    row.cccd_front ?? row.cccdFront ?? row.cccd_front_url ?? null;
  const cccdBack = row.cccd_back ?? row.cccdBack ?? row.cccd_back_url ?? null;
  return {
    id,
    name:
      typeof name === "string"
        ? name
        : name?.firstName
          ? `${name.firstName} ${name.lastName || ""}`.trim()
          : String(id),
    email,
    role: String(role).toUpperCase(),
    joined:
      typeof joined === "string"
        ? joined
        : joined
          ? new Date(joined).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "—",
    status,
    cccdFront: cccdFront && typeof cccdFront === "string" ? cccdFront : null,
    cccdBack: cccdBack && typeof cccdBack === "string" ? cccdBack : null,
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [viewIdCardUser, setViewIdCardUser] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [hideModalOpen, setHideModalOpen] = useState(false);
  const [userToHide, setUserToHide] = useState(null);
  const [hideReason, setHideReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAdminUsers();
      const data = res?.data ?? res?.result ?? res?.content ?? res;
      const list = Array.isArray(data)
        ? data
        : (data?.content ?? data?.users ?? []);
      const normalized = list.map(normalizeUser).map((u) => ({
        ...u,
        displayId: `#USR-${String(u.id).padStart(5, "0")}`,
      }));
      if (normalized.length > 0) setUsers(normalized);
    } catch (err) {
      try {
        const res = await userService.getAllUsers();
        const data = res?.data ?? res?.result ?? res?.content ?? res;
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.users ?? []);
        const normalized = list.map(normalizeUser).map((u) => ({
          ...u,
          displayId: `#USR-${String(u.id).padStart(5, "0")}`,
        }));
        if (normalized.length > 0) setUsers(normalized);
      } catch (e) {
        console.warn("UserManagement: load users failed", e?.message);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerify = async (user) => {
    const id = user.id;
    if (id == null) return;
    setVerifyingId(id);
    try {
      await userService.verifyUser(id, "APPROVE");
      message.success(`Account ${user.email} has been verified.`);
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Verification failed. Please try again.";
      message.error(msg);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = (user) => {
    setUserToReject(user);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    const user = userToReject;
    const id = user?.id;
    if (id == null) return;
    const reason = rejectReason.trim();
    if (!reason) {
      message.warning("Please enter a rejection reason.");
      return;
    }
    const ok = await confirmCrud({
      title: "Từ chối và gửi thông báo?",
      content: `Tài khoản ${user.email} sẽ bị từ chối theo lý do đã nhập. Thao tác này thường không hoàn tác.`,
      okText: "Gửi từ chối",
      danger: true,
    });
    if (!ok) return;
    setVerifyingId(id);
    try {
      // Send rejection email via API with reason
      // Backend will automatically delete the user after sending rejection email
      await userService.verifyUser(id, "REJECT", reason);
      message.success(
        `Account ${user.email} has been rejected and deleted. Rejection email sent.`,
      );
      setRejectModalOpen(false);
      setUserToReject(null);
      setRejectReason("");
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.message ??
        err?.response?.data?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Rejection failed. Please try again.";
      message.error(msg);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleHide = (user) => {
    setUserToHide(user);
    setHideReason("");
    setHideModalOpen(true);
  };

  const handleHideConfirm = async () => {
    const user = userToHide;
    const id = user?.id;
    if (id == null) return;
    const reason = hideReason.trim();
    if (!reason) {
      message.warning("Please enter a reason for hiding this account.");
      return;
    }
    const ok = await confirmCrud({
      title: "Khóa / ẩn tài khoản?",
      content: `Người dùng ${user.email} sẽ không thể đăng nhập. Email thông báo sẽ được gửi.`,
      okText: "Xác nhận khóa",
      danger: true,
    });
    if (!ok) return;
    setVerifyingId(id);
    try {
      // Send hide email via API with reason and block login
      await userService.hideUser(id, reason);
      message.success(
        `Account ${user.email} has been hidden. User cannot login. Notification email sent.`,
      );
      setHideModalOpen(false);
      setUserToHide(null);
      setHideReason("");
      await fetchUsers();
    } catch (err) {
      const msg =
        err?.message ??
        err?.response?.data?.message ??
        err?.data?.message ??
        err?.data?.msg ??
        "Hide account failed. Please try again.";
      message.error(msg);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (user) => {
    const id = user.id;
    if (id == null) return;
    Modal.confirm({
      title: "Delete Account",
      content: `Are you sure you want to delete the account for ${user.email}? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeletingId(id);
        try {
          await userService.deleteUser(id);
          message.success(`Account ${user.email} has been deleted.`);
          await fetchUsers();
        } catch (err) {
          const msg =
            err?.message ??
            err?.data?.message ??
            err?.data?.msg ??
            "Delete failed. Please try again.";
          message.error(msg);
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const memberUsers = users.filter(
    (u) => (u.role || "").toUpperCase() === "MEMBER",
  );

  const searchValue = search.trim().toLowerCase();
  const searchFilteredUsers = searchValue
    ? memberUsers.filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const displayId = u.displayId ? String(u.displayId).toLowerCase() : "";
        return (
          name.includes(searchValue) ||
          email.includes(searchValue) ||
          displayId.includes(searchValue)
        );
      })
    : memberUsers;

  const pendingCount = memberUsers.filter((u) => u.status === "Pending").length;
  const rejectedCount = memberUsers.filter(
    (u) => u.status === "Rejected",
  ).length;
  const hiddenCount = memberUsers.filter((u) => u.status === "Hidden").length;

  const filteredUsers =
    statusFilter === "All"
      ? searchFilteredUsers
      : searchFilteredUsers.filter((u) => {
          if (statusFilter === "Verified") {
            return u.status === "Active";
          }
          return u.status === statusFilter;
        });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, users.length]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <AdminLayout>
      <div className="user-management-page">
        <main className="user-content">
          <section className="user-header">
            <div className="user-header-spacer" />
          </section>

          <section className="user-stats">
            {statsConfig.map((item) => {
              const value =
                item.key === "members"
                  ? memberUsers.length
                  : item.key === "verified"
                    ? memberUsers.filter((u) => u.status === "Active").length
                    : item.key === "pending"
                      ? pendingCount
                      : item.key === "rejected"
                        ? rejectedCount
                        : hiddenCount;
              const isActive = item.filter === statusFilter;
              return (
                <div
                  className={`stat-card ${isActive ? "stat-card--active" : ""}`}
                  key={item.key}
                  onClick={() => setStatusFilter(item.filter)}
                >
                  <div className="stat-icon">{item.icon}</div>
                  <div className="stat-meta">
                    <div className="stat-label">{item.label}</div>
                    <div className="stat-row">
                      <span className="stat-value">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="user-table-card">
            <div className="user-table-toolbar">
              <div className="search-input">
                <Search />
                <input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="user-table-toolbar-meta">
                <span
                  className={`user-filter-pill ${
                    statusFilter === "All" ? "user-filter-pill--muted" : ""
                  }`}
                >
                  {statusFilter === "All"
                    ? "Showing all members"
                    : statusFilter === "Verified"
                      ? "Showing verified (Active) members"
                      : `Showing ${statusFilter.toLowerCase()} members`}
                </span>
              </div>
            </div>
            <div className="user-table">
              <div className="user-table-row header">
                <div>User</div>
                <div>Email Address</div>
                <div>Role</div>
                <div>Joined</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {loading ? (
                <div className="user-table-row">
                  <div
                    style={{
                      padding: "24px",
                      gridColumn: "1 / -1",
                      textAlign: "center",
                    }}
                  >
                    Loading users...
                  </div>
                </div>
              ) : (
                pageUsers.map((user) => (
                  <div
                    className="user-table-row"
                    key={user.id ?? user.displayId}
                  >
                    <div className="user-cell">
                      <div className="user-avatar">{(user.name || "?")[0]}</div>
                      <div>
                        <div className="user-name">{user.name}</div>
                        {user.displayId && (
                          <div className="user-id">{user.displayId}</div>
                        )}
                      </div>
                    </div>
                    <div className="user-email">{user.email}</div>
                    <div>
                      <span
                        className={`role-badge ${(user.role || "").toLowerCase()}`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div>{user.joined}</div>
                    <div className="status-cell">
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: "Active",
                              label: "Active",
                              onClick: () =>
                                user.status === "Pending" && handleVerify(user),
                            },
                            {
                              key: "Pending",
                              label: "Pending",
                              onClick: () => {},
                            },
                            {
                              key: "Hidden",
                              label: "Hide Account",
                              onClick: () =>
                                user.status !== "Hidden" && handleHide(user),
                            },
                            {
                              key: "Rejected",
                              label: "Reject",
                              danger: true,
                              onClick: () =>
                                user.status !== "Rejected" &&
                                handleReject(user),
                            },
                          ],
                        }}
                        trigger={["click"]}
                      >
                        <span
                          className={`status-pill status-pill--dropdown ${(user.status || "").toLowerCase()}`}
                        >
                          {user.status}
                          <ChevronDown
                            className="status-pill-chevron"
                            size={14}
                          />
                        </span>
                      </Dropdown>
                    </div>
                    <div className="user-actions">
                      {(user.cccdFront || user.cccdBack) && (
                        <button
                          type="button"
                          className="outline-btn view-id-btn"
                          onClick={() => setViewIdCardUser(user)}
                        >
                          View ID
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="user-table-footer">
              <span>
                Showing {pageUsers.length} / {filteredUsers.length} filtered
                member(s)
              </span>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    type="button"
                    className="admin-tx-page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ‹
                  </button>
                  <span style={{ color: "#64748b", fontSize: 13 }}>
                    Page {page}/{totalPages}
                  </span>
                  <button
                    type="button"
                    className="admin-tx-page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <Modal
        title={`ID card – ${viewIdCardUser?.name ?? viewIdCardUser?.email ?? "User"}`}
        open={!!viewIdCardUser}
        onCancel={() => setViewIdCardUser(null)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        <div className="cccd-modal-content">
          <div className="cccd-modal-row">
            <div className="cccd-modal-item">
              <div className="cccd-modal-label">Front (ID card front)</div>
              {viewIdCardUser?.cccdFront ? (
                <a
                  href={viewIdCardUser.cccdFront}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cccd-modal-link"
                >
                  <img
                    src={viewIdCardUser.cccdFront}
                    alt="CCCD front"
                    className="cccd-modal-img"
                    referrerPolicy="no-referrer"
                  />
                </a>
              ) : (
                <div className="cccd-modal-placeholder">No image</div>
              )}
            </div>
            <div className="cccd-modal-item">
              <div className="cccd-modal-label">Back (ID card back)</div>
              {viewIdCardUser?.cccdBack ? (
                <a
                  href={viewIdCardUser.cccdBack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cccd-modal-link"
                >
                  <img
                    src={viewIdCardUser.cccdBack}
                    alt="CCCD back"
                    className="cccd-modal-img"
                    referrerPolicy="no-referrer"
                  />
                </a>
              ) : (
                <div className="cccd-modal-placeholder">No image</div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title="Reject User Account"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setUserToReject(null);
          setRejectReason("");
        }}
        onOk={handleRejectConfirm}
        okText="Reject"
        okType="danger"
        cancelText="Cancel"
        okButtonProps={{ loading: verifyingId === userToReject?.id }}
        destroyOnHidden
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8, color: "#64748b" }}>
            Are you sure you want to reject{" "}
            <strong>{userToReject?.email}</strong>?
          </p>
          <p style={{ marginBottom: 16, color: "#64748b" }}>
            They will receive a rejection email with your reason and their
            account will be deleted. They can register again later.
          </p>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Rejection Reason <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Input.TextArea
            placeholder="e.g., CCCD images are not clear, Invalid ID card, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      <Modal
        title="Hide User Account"
        open={hideModalOpen}
        onCancel={() => {
          setHideModalOpen(false);
          setUserToHide(null);
          setHideReason("");
        }}
        onOk={handleHideConfirm}
        okText="Hide Account"
        okType="primary"
        cancelText="Cancel"
        okButtonProps={{ loading: verifyingId === userToHide?.id }}
        destroyOnHidden
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8, color: "#64748b" }}>
            Are you sure you want to hide <strong>{userToHide?.email}</strong>?
          </p>
          <p style={{ marginBottom: 16, color: "#64748b" }}>
            They will receive an email notification with your reason. Their
            account will be hidden and they cannot login. The account will not
            be deleted.
          </p>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Hide Reason <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Input.TextArea
            placeholder="e.g., Suspicious activity, Policy violation, etc."
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </AdminLayout>
  );
}

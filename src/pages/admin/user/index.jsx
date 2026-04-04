import "./index.css";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import AdminPaginationBar from "../../../components/admin/AdminPaginationBar";
import AdminToolbarFilters from "../../../components/admin/AdminToolbarFilters";
import { message, Modal, Dropdown, Input } from "antd";
import userService from "../../../services/userService";
import { confirmCrud } from "../../../utils/confirmCrud";
import { getAvatarSrc } from "../../../utils/avatar";
import {
  ChevronDown,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserX,
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
    icon: <UserX />,
    filter: "Rejected",
  },
  {
    key: "hidden",
    label: "Hidden",
    tone: "orange",
    icon: <UserMinus />,
    filter: "Hidden",
  },
];

const PAGE_SIZE = 10;

/** Full email + Enter triggers GET /users/email/{email} */
const LOOKS_LIKE_FULL_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USER_STATUS_FILTER_OPTIONS = [
  { value: "All", label: "All members" },
  { value: "Verified", label: "Verified (Active)" },
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
  { value: "Hidden", label: "Hidden" },
];

function formatJoinedDate(value) {
  if (value == null || value === "") return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

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
  const s =
    rawStatus == null
      ? ""
      : typeof rawStatus === "string"
        ? rawStatus.trim()
        : String(rawStatus);
  const upper = s.toUpperCase();
  if (
    rawStatus === true ||
    rawStatus === "true" ||
    upper === "VERIFIED" ||
    upper === "ACTIVE" ||
    s === "Active"
  ) {
    status = "Active";
  } else if (upper === "REJECTED") {
    status = "Rejected";
  } else if (upper === "HIDDEN") {
    status = "Hidden";
  } else if (upper === "PENDING" || s === "") {
    status = "Pending";
  }
  const joinedRaw =
    row.updated_at ??
    row.updatedAt ??
    row.user_updated_at ??
    row.joined ??
    row.createdAt ??
    row.created_at ??
    row.user_created_at ??
    null;
  const cccdFront =
    row.cccd_front ?? row.cccdFront ?? row.cccd_front_url ?? null;
  const cccdBack = row.cccd_back ?? row.cccdBack ?? row.cccd_back_url ?? null;
  const avatarUrl = getAvatarSrc(row);
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
    joined: formatJoinedDate(joinedRaw),
    status,
    avatarUrl,
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
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [emailLookupOpen, setEmailLookupOpen] = useState(false);
  const [emailLookupData, setEmailLookupData] = useState(null);

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
    } catch {
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

  const lookupUserByExactEmail = async (emailRaw) => {
    const email = emailRaw.trim();
    if (!email) {
      message.warning("Enter an email address.");
      return;
    }
    setEmailLookupData(null);
    try {
      const res = await userService.getUserByEmail(email);
      const data = res?.result ?? res?.data ?? res;
      setEmailLookupData(
        data && typeof data === "object" ? data : { raw: data },
      );
      setEmailLookupOpen(true);
    } catch (lookupErr) {
      const msg =
        lookupErr?.message ??
        lookupErr?.data?.message ??
        lookupErr?.data?.msg ??
        "User not found or access denied.";
      message.error(msg);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const q = search.trim();
    if (!LOOKS_LIKE_FULL_EMAIL.test(q)) return;
    e.preventDefault();
    lookupUserByExactEmail(q);
  };

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
      title: "Reject and send notification?",
      content: `Account ${user.email} will be rejected based on the provided reason. This action is usually irreversible.`,
      okText: "Send rejection",
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
      <div className="user-management-page admin-toolbar-page">
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
                  className={`stat-card stat-card--${item.key} ${
                    isActive ? "stat-card--active" : ""
                  }`}
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
              <AdminToolbarFilters
                searchValue={search}
                onSearchChange={setSearch}
                onSearchKeyDown={handleSearchKeyDown}
                searchPlaceholder="Search by name, email or ID — press Enter for exact email lookup"
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={USER_STATUS_FILTER_OPTIONS}
                idPrefix="admin-users-status"
                filterAriaLabel="Filter by member status"
              />
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
                    data-deleting={deletingId === user.id ? "true" : undefined}
                  >
                    <div className="user-cell">
                      <div
                        className="user-avatar"
                        style={
                          user.avatarUrl
                            ? {
                                backgroundImage: `url(${user.avatarUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                color: "transparent",
                              }
                            : undefined
                        }
                      >
                        {(user.name || "?")[0]}
                      </div>
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
                              key: "Rejected",
                              label: "Reject",
                              danger: true,
                              onClick: () =>
                                user.status !== "Rejected" &&
                                handleReject(user),
                            },
                            {
                              key: "hide",
                              label: "Hide account (not on API yet)",
                              danger: true,
                              disabled: true,
                            },
                            {
                              key: "delete",
                              label: "Delete account",
                              danger: true,
                              onClick: () => handleDelete(user),
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
              {totalPages <= 1 ? (
                <span>
                  Showing {pageUsers.length} / {filteredUsers.length} filtered
                  member(s)
                </span>
              ) : (
                <AdminPaginationBar
                  totalCount={filteredUsers.length}
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                  nounPhrase="member(s)"
                />
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
        title="User by email"
        open={emailLookupOpen}
        onCancel={() => {
          setEmailLookupOpen(false);
          setEmailLookupData(null);
        }}
        footer={null}
        width={520}
        destroyOnHidden
      >
        {emailLookupData && (
          <pre
            style={{
              margin: 0,
              padding: 12,
              background: "#f8fafc",
              borderRadius: 8,
              fontSize: 13,
              overflow: "auto",
              maxHeight: 360,
            }}
          >
            {JSON.stringify(emailLookupData, null, 2)}
          </pre>
        )}
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
        <div style={{ marginBottom: 18 }}>
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
    </AdminLayout>
  );
}

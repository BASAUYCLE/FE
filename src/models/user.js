// User: chuẩn hóa từ API (backend có thể trả camelCase hoặc snake_case)
export const USER_FIELDS = [
  "id", "userId", "email", "fullName", "avatar", "phone", "address", "role", "isVerified",
  "createdAt", "updatedAt",
];

// Object user rỗng (cho initial state)
export function getDefaultUser() {
  return {
    id: null,
    userId: null,
    email: "",
    fullName: "",
    avatar: "",
    phone: "",
    address: "",
    role: "",
    isVerified: false,
    createdAt: null,
    updatedAt: null,
  };
}

// Chuẩn hóa user từ response API
export function normalizeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: raw.id ?? raw.userId ?? raw.user_id,
    userId: raw.userId ?? raw.user_id ?? raw.id,
    email: raw.email ?? "",
    fullName: raw.fullName ?? raw.full_name ?? raw.name ?? "",
    avatar: raw.avatar ?? raw.avatarUrl ?? raw.avatar_url ?? "",
    phone: raw.phone ?? "",
    address: raw.address ?? "",
    role: raw.role ?? raw.userRole ?? raw.user_role ?? "",
    isVerified: raw.isVerified ?? raw.is_verified ?? false,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
  };
}

export default normalizeUser;

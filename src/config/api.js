// Cấu hình API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  AUTH_SERVER: import.meta.env.VITE_AUTH_SERVER || 'http://localhost:8080',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  TIMEOUT: 15000, // 15 giây
};

// Endpoint API theo backend thực tế
export const API_ENDPOINTS = {
  // Xác thực
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // User – BE: /users/myinfo, /users, /users/{userId}, /users/email/{email}
  USER: {
    MY_INFO: '/users/myinfo',
    UPDATE_MY_INFO: '/users/myinfo',
    LIST: '/users',
    BY_ID: (id) => `/users/${id}`,
    BY_EMAIL: (email) => `/users/email/${encodeURIComponent(email)}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    BOOKINGS: '/api/users/bookings',
    WALLET: '/api/users/wallet',
    WISHLIST: '/api/users/wishlist',
    WISHLIST_ITEM: (id) => `/api/users/wishlist/${id}`,
  },
  
  // Upload
  UPLOAD: {
    IMAGE: '/api/upload/image',          // POST - Upload hình ảnh
  },

  // Marketplace (Bài đăng) – BE: /posts, /posts/{postId}, /posts/seller/{id}, /posts/category/{id}, /posts/size/{size}, /posts/search
  POSTS: {
    LIST: "/posts",
    CREATE: "/posts",
    DRAFT: "/posts/draft",
    MY_POSTS: "/posts/my-posts",
    DRAFTS: "/posts/drafts",
    DRAFT_SUBMIT: (postId) => `/posts/draft/${postId}/submit`,
    BY_ID: (postId) => `/posts/${postId}`,
    UPDATE: (postId) => `/posts/${postId}`,
    DELETE: (postId) => `/posts/${postId}`,
    BY_SELLER: (sellerId) => `/posts/seller/${sellerId}`,
    BY_BRAND: (brandId) => `/posts/brand/${brandId}`,
    BY_CATEGORY: (categoryId) => `/posts/category/${categoryId}`,
    BY_SIZE: (size) => `/posts/size/${encodeURIComponent(size)}`,
    BY_STATUS: (status) => `/posts/status/${status}`,
    SEARCH_BY_PRICE: "/posts/search",
  },

  IMAGES: {
    CREATE: "/images",
    /** BE có thể dùng POST /posts/{postId}/images (postId trong URL, tránh 404 NOT FOUND) */
    CREATE_BY_POST: (postId) => `/posts/${postId}/images`,
    /** Fallback khi BE dùng context-path /api */
    CREATE_API: "/api/images",
    BY_POST: (postId) => `/images/post/${postId}`,
    BY_ID: (imageId) => `/images/${imageId}`,
    UPDATE: (imageId) => `/images/${imageId}`,
    DELETE: (imageId) => `/images/${imageId}`,
  },

  /** Admin posts – BE: GET /admin/posts/pending, PUT /admin/posts/{id}/approve, PUT /admin/posts/{id}/reject */
  ADMIN_POSTS: {
    LIST: "/admin/posts",
    BY_STATUS: (status) => `/admin/posts/status/${status}`,
    PENDING: "/admin/posts/pending",
    APPROVE: (postId) => `/admin/posts/${postId}/approve`,
    REJECT: (postId) => `/admin/posts/${postId}/reject`,
    HIDE: (postId) => `/admin/posts/${postId}/hide`,
  },

  /** Inspector – BE: GET /inspection/pending, POST /inspection/{postId}/submit */
  INSPECTION: {
    PENDING: "/inspection/pending",
    SUBMIT: (postId) => `/inspection/${postId}/submit`,
    COMPLETED: "/inspection/completed",
    REPORT: (postId) => `/inspection/${postId}/report`,
  },

  /** Disputes – BE: DisputeController @ /disputes */
  DISPUTES: {
    BASE: "/disputes",
    BY_ID: (id) => `/disputes/${id}`,
    MY_DISPUTES: "/disputes/my-disputes",
    /** INSPECTOR — danh sách dispute (bài đăng inspector đã kiểm định) */
    INSPECTOR_MY_DISPUTES: "/disputes/inspector/my-disputes",
    INSPECTOR_NOTE: (id) => `/disputes/${id}/inspector-note`,
    /** ADMIN — toàn bộ dispute (không lọc theo user) */
    ADMIN_ALL: "/disputes/admin/all",
    ADMIN_APPROVE: (id) => `/disputes/admin/${id}/approve`,
    ADMIN_REJECT: (id) => `/disputes/admin/${id}/reject`,
    SHIPPING_INFO: (id) => `/disputes/${id}/shipping-info`,
    CONFIRM_RETURN: (id) => `/disputes/${id}/confirm-return-receipt`,
  },

  BRANDS: {
    LIST: "/brands",
    BY_ID: (brandId) => `/brands/${brandId}`,
  },

  CATEGORIES: {
    LIST: "/categories",
    BY_ID: (categoryId) => `/categories/${categoryId}`,
  },

  // Wallet & Payment
  WALLET: {
    GET: "/wallet",
    TOP_UP: "/wallet/top-up",
  },

  TRANSACTIONS: {
    LIST: "/transactions",
    BY_ID: (transactionId) => `/transactions/${transactionId}`,
  },

  // System Configuration
  SYSTEM_CONFIG: {
    LIST: "/system-config",
    BY_KEY: (key) => `/system-config/${key}`,
  },

  // Orders (escrow between buyer/seller)
  ORDERS: {
    CREATE: "/orders",
    BY_ID: (orderId) => `/orders/${orderId}`,
    MY_ORDERS: "/orders/my-orders",
    MY_SALES: "/orders/my-sales",
    PAY_REMAINING: (orderId) => `/orders/${orderId}/pay`,
    CONFIRM_SHIPPING: (orderId) => `/orders/${orderId}/shipping`,
    CONFIRM_DELIVERY: (orderId) => `/orders/${orderId}/confirm-delivery`,
    CANCEL: (orderId) => `/orders/${orderId}/cancel`,
  },

  // Addresses
  ADDRESSES: {
    BY_USER: (userId) => `/users/${userId}/addresses`,
    CREATE: (userId) => `/users/${userId}/addresses`,
    UPDATE: (userId, addressId) => `/users/${userId}/addresses/${addressId}`,
    DELETE: (userId, addressId) => `/users/${userId}/addresses/${addressId}`,
  },

  // Locations (Tỉnh/Thành phố, Xã/Phường)
  LOCATIONS: {
    PROVINCES: "/locations/provinces",
    COMMUNES: (provinceCode) => `/locations/provinces/${provinceCode}/communes`,
  },

  // Wishlist
  WISHLIST: {
    LIST: "/wishlist",
    ADD: (postId) => `/wishlist/${postId}`,
    REMOVE: (postId) => `/wishlist/${postId}`,
    CHECK: (postId) => `/wishlist/check/${postId}`,
  },

  /** Metadata cho form đăng tin: size, loại ảnh, groupset, brake type (BE trả về) */
  METADATA: {
    POST_FORM: "/metadata/post-form",
    FRAME_SIZES: "/metadata/frame-sizes",
    PHOTO_CATEGORIES: "/metadata/photo-categories",
    GROUPSETS: "/metadata/groupsets",
    BRAKE_TYPES: "/metadata/brake-types",
  },
  
  // Xe đạp (backend sẽ implement)
  BIKES: {
    LIST: '/api/bikes',
    BY_ID: (id) => `/api/bikes/${id}`,
    SEARCH: '/api/bikes/search',
    FEATURED: '/api/bikes/featured',
    CATEGORIES: '/api/bikes/categories',
    CREATE: '/api/bikes',
    UPDATE: (id) => `/api/bikes/${id}`,
    DELETE: (id) => `/api/bikes/${id}`,
    AVAILABILITY: (id) => `/api/bikes/${id}/availability`,
  },
  
  // Đặt chỗ (backend sẽ implement)
  BOOKINGS: {
    CREATE: '/api/bookings',
    LIST: '/api/bookings',
    BY_ID: (id) => `/api/bookings/${id}`,
    CANCEL: (id) => `/api/bookings/${id}/cancel`,
    UPDATE_STATUS: (id) => `/api/bookings/${id}/status`,
    STATS: '/api/bookings/stats',
    EXTEND: (id) => `/api/bookings/${id}/extend`,
    RATE: (id) => `/api/bookings/${id}/rate`,
  },

  // Thanh toán (backend sẽ implement)
  PAYMENTS: {
    CREATE: '/api/payments',
    BY_ID: (id) => `/api/payments/${id}`,
    VERIFY: '/api/payments/verify',
    HISTORY: '/api/payments/history',
    REFUND: (id) => `/api/payments/${id}/refund`,
    METHODS: '/api/payments/methods',
  },
  
  /** Admin users – BE: GET /admin/users, GET /admin/users/pending, POST /admin/users/verify */
  ADMIN: {
    USERS: '/admin/users',
    USERS_PENDING: '/admin/users/pending',
    USER_BY_ID: (userId) => `/admin/users/${userId}`,
    VERIFY_USER: '/admin/users/verify',
    HIDE_USER: '/admin/users/hide',
    BOOKINGS: '/admin/bookings',
    REPORTS: '/admin/reports',
    STATS: '/admin/stats',
    REVENUE_STATS: (period) => `/admin/stats/revenue?period=${period}`,
    INSPECTION_REPORTS: '/admin/inspection/reports',
    TRANSACTIONS: '/admin/transactions',
  },
};

export default API_CONFIG;

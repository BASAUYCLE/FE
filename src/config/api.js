// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  AUTH_SERVER: import.meta.env.VITE_AUTH_SERVER || 'http://localhost:8080',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true' || false,
  TIMEOUT: 15000, // 15 seconds
};

// API Endpoints based on actual backend
export const API_ENDPOINTS = {
  // Authentication
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
  
  // User
  USER: {
    MY_INFO: '/users/myinfo',
    UPDATE_MY_INFO: '/users/myinfo',
    LIST: '/users',
    BY_ID: (id) => `/users/${id}`,
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

  // Marketplace (Bicycle Posts)
  POSTS: {
    LIST: "/posts",
    CREATE: "/posts",
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
    BY_POST: (postId) => `/images/post/${postId}`,
    BY_ID: (imageId) => `/images/${imageId}`,
    UPDATE: (imageId) => `/images/${imageId}`,
    DELETE: (imageId) => `/images/${imageId}`,
  },

  /** Admin: bài đăng chờ duyệt & duyệt bài */
  ADMIN_POSTS: {
    PENDING: "/admin/posts/pending",
    APPROVE: (postId) => `/admin/posts/${postId}/approve`,
  },

  /** Inspector: danh sách chờ kiểm định & nộp kết quả */
  INSPECTION: {
    PENDING: "/inspection/pending",
    SUBMIT: (postId) => `/inspection/${postId}/submit`,
  },

  BRANDS: {
    LIST: "/brands",
    BY_ID: (brandId) => `/brands/${brandId}`,
  },

  CATEGORIES: {
    LIST: "/categories",
    BY_ID: (categoryId) => `/categories/${categoryId}`,
  },
  
  // Bikes/Vehicles (to be implemented by backend)
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
  
  // Bookings (to be implemented by backend)
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

  // Payments (to be implemented by backend)
  PAYMENTS: {
    CREATE: '/api/payments',
    BY_ID: (id) => `/api/payments/${id}`,
    VERIFY: '/api/payments/verify',
    HISTORY: '/api/payments/history',
    REFUND: (id) => `/api/payments/${id}/refund`,
    METHODS: '/api/payments/methods',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    REPORTS: '/admin/reports',
    STATS: '/admin/stats',
  },
};

export default API_CONFIG;

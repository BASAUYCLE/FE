# Báo cáo chi tiết code và chức năng từng file

**Project:** BASAUYCLE  
**Phạm vi:** Toàn bộ file code (`.js`, `.jsx`), không bao gồm file `.css`.

Mỗi file được mô tả theo: **Mục đích**, **Import**, **Export**, **Biến/Hằng**, **Hàm/Component chính**, **Luồng xử lý** (nếu có), **Ghi chú**.

---

## 1. Điểm vào và Ứng dụng (Entry & App)

### 1.1 `src/main.jsx`

| Mục          | Nội dung                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| **Mục đích** | Điểm vào ứng dụng: gắn React vào DOM, bật StrictMode.                                   |
| **Import**   | `react` (StrictMode), `react-dom/client` (createRoot), `./index.css`, `./App.jsx`.      |
| **Export**   | Không (chỉ hiệu ứng phụ).                                                               |
| **Logic**    | `createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)`. |

---

### 1.2 `src/App.jsx`

| Mục | Nội dung  
| **Mục đích** | Cấu hình toàn app: theme (MUI + Ant Design), router, providers, định nghĩa route, lazy load trang. |
| **Import** | react (lazy, Suspense), react-router-dom, AuthProvider, WishlistProvider, NotificationProvider, PostingProvider, OrderProvider, ConfigProvider/AntApp (antd), ThemeProvider/createTheme/CssBaseline (MUI), ProtectedRoute, usePostingStatusNotifications, theme (fontFamily, antdToken). |
| **Export** | `App` (default). |
| **Biến/hằng** | `muiTheme` (createTheme: palette light, typography fontFamily); lazy components: Login, Register, Home, Payment, Wallet, PostBike, ManageListings, Wishlist, Account, ProductDetail, Marketplace, ForgotPassword, Orders, Unauthorized, CategoryManagement, AdminDashboard, AdminReports, AdminUsers, AdminListings, AdminApprovedListings, AdminRevenue, AdminInspectionReports, AdminTransactions, InspectorDashboard, InspectorDetail, InspectorDetailsList, InspectorCompleted, InspectorDisputes. |
| **Component nội bộ** | `PageFallback()` – div "Đang tải..."; `PostingStatusEffect()` – gọi `usePostingStatusNotifications()`, return null; `App()` – kết xuất cây provider + Routes. |
| **Luồng** | ThemeProvider → ConfigProvider → AntApp → BrowserRouter → AuthProvider → WishlistProvider → PostingProvider → OrderProvider → NotificationProvider → PostingStatusEffect + Suspense(Routes). Route công khai: /, /marketplace, /login, /register, /forgot-password. Route ProtectedRoute: /payment, /post, /manage-listings, /account, /wallet, /orders. Chuyển hướng: /postings → /manage-listings, /user-detail và /set-profile → /account, /admin-listing → /admin-listings, /admin/category → /admin-categories. Admin: /admin-dashboard, /admin-users, /admin-listings, /admin-approved-listings, /admin-revenue, /admin-inspection-reports, /admin-transactions, /admin-categories, /admin-reports. Inspector: /inspector, /inspector/details, /inspector/completed, /inspector/disputes, /inspector/:id. |
| **Ghi chú** | Trang Wishlist không bọc ProtectedRoute. Route Admin/Inspector chưa kiểm tra role trong App (có thể thêm ProtectedRoute với requiredRole). |

---

## 2. Config

### 2.1 `src/config/api.js`

| Mục               | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mục đích**      | Cấu hình base URL, timeout và toàn bộ endpoint API (auth, user, posts, admin, inspection, bikes, bookings, payments, brands, categories).                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Import**        | Không (chỉ dùng import.meta.env).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Export**        | `API_CONFIG`, `API_ENDPOINTS`, default `API_CONFIG`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **API_CONFIG**    | BASE_URL (VITE_API_BASE_URL hoặc localhost:8080), AUTH_SERVER, GOOGLE_CLIENT_ID, TIMEOUT 15000.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **API_ENDPOINTS** | AUTH (LOGIN, REGISTER, LOGOUT, VERIFY, REFRESH, FORGOT_PASSWORD, RESET_PASSWORD, CHANGE_PASSWORD); USER (MY_INFO, UPDATE_MY_INFO, LIST, BY_ID, UPDATE, DELETE, BOOKINGS, WALLET, WISHLIST, WISHLIST_ITEM); UPLOAD (IMAGE); POSTS (LIST, CREATE, BY_ID, UPDATE, DELETE, BY_SELLER, BY_BRAND, BY_CATEGORY, BY_SIZE, BY_STATUS, SEARCH_BY_PRICE); IMAGES (CREATE, CREATE_BY_POST, BY_POST, BY_ID, UPDATE, DELETE); ADMIN_POSTS (PENDING, APPROVE, REJECT); INSPECTION (PENDING, SUBMIT); BRANDS, CATEGORIES; BIKES, BOOKINGS, PAYMENTS, ADMIN (USERS, VERIFY_USER, BOOKINGS, REPORTS, STATS). |

---

### 2.2 `src/config/adminNav.js`

| Mục                    | Nội dung                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**           | Menu sidebar admin và hàm xác định item active theo pathname.                                                        |
| **Export**             | `ADMIN_NAV_LINKS`, `getAdminActiveLink(pathname)`.                                                                   |
| **ADMIN_NAV_LINKS**    | Mảng { label, href }: Dashboard, Users, Listings, Approved, Revenue, Inspections, Categories, Transactions, Reports. |
| **getAdminActiveLink** | Map pathname → label (Dashboard, Users, Listings, …); path /product/\* → "Listings".                                 |

---

### 2.3 `src/config/headerConfig.js`

| Mục                    | Nội dung                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Mục đích**           | Nav link chính (Home, Marketplace, Sell, Wishlist) và logic theo role; xác định link đang active. |
| **Export**             | `NAV_LINKS`, `getNavLinksForRole(role)`, `getActiveLink(pathname)`.                               |
| **getNavLinksForRole** | role ADMIN/INSPECTOR → bỏ Sell và Wishlist; còn lại trả NAV_LINKS đầy đủ.                         |
| **getActiveLink**      | pathname → label từ PATH_TO_ACTIVE_LABEL; /product/\* → null.                                     |

---

### 2.4 `src/config/inspectorNav.js`

| Mục                        | Nội dung                                                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**               | Menu inspector và item active theo pathname.                                                                                                                                |
| **Export**                 | `INSPECTOR_NAV_LINKS`, `getInspectorActiveLink(pathname)`.                                                                                                                  |
| **getInspectorActiveLink** | /inspector/disputes → "Dispute Center"; /inspector/details\* → "Inspection Details"; /inspector/completed → "Completed"; /inspector/:id → "Inspection Details" hoặc từ map. |

---

### 2.5 `src/config/theme.js`

| Mục           | Nội dung                                            |
| ------------- | --------------------------------------------------- |
| **Mục đích**  | Token giao diện dùng chung cho MUI và Ant Design.   |
| **Export**    | `fontFamily`, `antdToken`.                          |
| **antdToken** | colorPrimary "#1ABC9C", borderRadius 8, fontFamily. |

---

## 3. Hằng số (Constants)

### 3.1 `src/constants/storageKeys.js`

| Mục        | Nội dung                                                      |
| ---------- | ------------------------------------------------------------- |
| **Export** | `STORAGE_KEYS` (TOKEN: "ev_token", USER: "ev_user"), default. |

---

### 3.2 `src/constants/postingStatus.js`

| Mục                   | Nội dung                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Export**            | POSTING_STATUS, POSTING_STATUS_LABEL, POSTING_STATUS_LABEL_VI, POSTING_STATUS_TAG_COLOR, OVERALL_CONDITION, OVERALL_CONDITION_LABEL. |
| **POSTING_STATUS**    | PENDING, ADMIN_APPROVED, AVAILABLE, REJECTED, ACTIVE, VERIFIED, PENDING_REVIEW, SOLD, DRAFT, DRAFTED, DEPOSITED, HIDDEN, EXPIRED.    |
| **OVERALL_CONDITION** | EXCELLENT, GOOD, FAIR, POOR (dùng cho inspector).                                                                                    |
| **Ghi chú**           | Đã sửa: thêm khai báo object OVERALL_CONDITION trước OVERALL_CONDITION_LABEL.                                                        |

---

### 3.3 `src/constants/orderStatus.js`

| Mục        | Nội dung                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| **Export** | ORDER_STATUS (DEPOSIT_AWAITING, FULL_PAYMENT, EXPIRED, PAID), ORDER_STATUS_LABEL, ORDER_STATUS_TAG_COLOR. |

---

### 3.4 `src/constants/inspectionStatus.js`

| Mục        | Nội dung                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Export** | INSPECTION_STATUS (PENDING, IN_PROGRESS, OVERDUE, COMPLETED, REJECTED), INSPECTION_STATUS_LABEL, INSPECTION_STATUS_TAG_COLOR. |

---

### 3.5 `src/constants/bikeTypes.js`

| Mục        | Nội dung                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| **Export** | BIKE_TYPE_OPTIONS: mảng { value, label } (Road Bike, Mountain Bike, Gravel Bike, City Bike, E-Bike, Others). |

---

## 4. Ngữ cảnh (Contexts)

### 4.1 `src/contexts/AuthContext.jsx`

| Mục             | Nội dung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**    | Quản lý đăng nhập, đăng xuất, token và user; chuẩn hóa role; kiểm tra tài khoản PENDING; cung cấp login, register, updateProfile, changePassword, logout.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Import**      | createContext, useContext, useState, useEffect, useMemo; authService, userService; STORAGE_KEYS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Export**      | `useAuth`, `AuthProvider`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Hàm nội bộ**  | `normalizeUser(userObj)` – chuẩn hóa role (role ?? userRole ?? user_role ?? "MEMBER"), trả object với role uppercase. `isPendingVerification(user)` – true nếu status === "PENDING".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **State**       | user (từ localStorage, normalizeUser), token, loading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **useEffect**   | (1) Khi có token + user.email: gọi getProfile; nếu PENDING thì xóa token/user và set null; không thì setUser(normalize) và lưu localStorage. (2) setLoading(false) lúc mount.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **API context** | login(credentials): authService.login → nếu có token+user thì getProfile, check PENDING → return { success, data, user } hoặc { success: false, message }. loginWithSession(userData, userToken): set state + localStorage. register(userData): authService.register, nếu response có token+user thì set state + localStorage; return { success, data } hoặc { success: false, message }. updateProfile(userData): userService.updateProfile, setUser(normalize). changePassword(passwordData): authService.changePassword. logout: authService.logout (catch vẫn xóa token/user), setUser null, setToken null, xóa localStorage. isAuthenticated: () => !!token && !!user. |

---

### 4.2 `src/contexts/PostingContext.jsx`

| Mục                                | Nội dung                                                                                                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mục đích**                       | State bài đăng (postings, publicPostings); thêm/sửa/xóa bài; map API → posting; cache localStorage theo sellerId; load theo seller và load public.                                                                                         |
| **Import**                         | createContext, useContext, useState, useCallback, useMemo; POSTING_STATUS; postService; formatCurrency.                                                                                                                                    |
| **Export**                         | `PostingProvider`, `usePostings`.                                                                                                                                                                                                          |
| **Hằng/hàm nội bộ**                | STORAGE_KEY_PREFIX "basauycle-postings"; getStorageKey(sellerId); savePostingsToStorage(sellerId, list); loadPostingsFromStorage(sellerId); generatePostingId(); buildPosting(payload, status, sellerId) – tạo object posting từ form/API. |
| **State**                          | postings, publicPostings.                                                                                                                                                                                                                  |
| **extractListFromResponse(res)**   | Trích mảng từ res (array, res.result, res.data, res.content, res.data.content).                                                                                                                                                            |
| **mapRowToPosting(row)**           | Map row API (images, bicycleName, price, postStatus, …) sang buildPosting.                                                                                                                                                                 |
| **loadPostingsBySeller(sellerId)** | Gọi getPostsBySeller; map list; merge với cache và state theo id; sort theo createdAt; save cache; lỗi thì dùng cache.                                                                                                                     |
| **loadPublicPostings()**           | Thử getPosts() → filter status AVAILABLE/ADMIN_APPROVED; không đủ thì getPostsByStatus(AVAILABLE) và getPostsByStatus(ADMIN_APPROVED), merge, setPublicPostings.                                                                           |
| **getPostingById(id)**             | Tìm trong postings hoặc publicPostings (so khớp id number/string).                                                                                                                                                                         |
| **Value context**                  | postings, publicPostings, addPosting, updatePostingStatus, updatePostingStatusOnServer, updatePosting, deletePosting, loadPostingsBySeller, loadPublicPostings, getPostingById.                                                            |

---

### 4.3 `src/contexts/WishlistContext.jsx`

| Mục                               | Nội dung                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**                      | Wishlist theo user; sync API khi VITE_USE_WISHLIST_API=true, không thì chỉ localStorage.                                                      |
| **Import**                        | createContext, useContext, useState, useCallback, useEffect, useMemo; useAuth; userService.                                                   |
| **Export**                        | `WishlistProvider`, `useWishlist`.                                                                                                            |
| **State**                         | wishlist, loading. authenticated = isAuthenticated?.() ?? !!(token && user).                                                                  |
| **useEffect**                     | Khi không authenticated: clear wishlist và storage. Khi authenticated: load cache; nếu useWishlistApi thì getWishlist() → setWishlist + save. |
| **addToWishlist(product)**        | Nếu không API: thêm vào state + save storage. Nếu API: addToWishlist(id), getWishlist(), set state + save.                                    |
| **removeFromWishlist(productId)** | Tương tự (filter hoặc API).                                                                                                                   |
| **isInWishlist(productId)**       | wishlist.some(p => p.id === productId hoặc String).                                                                                           |
| **Value**                         | wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist, isAuthenticated (authenticated).                                          |

---

### 4.4 `src/contexts/OrderContext.jsx`

| Mục                            | Nội dung                                                                                                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**                   | Danh sách order (demo từ getPendingOrders); thêm order từ product, đánh dấu đã thanh toán.                                                                                                                 |
| **Import**                     | createContext, useContext, useState, useCallback, useMemo; ORDER_STATUS; getPendingOrders (data/orders); parsePriceString.                                                                                 |
| **Export**                     | `OrderProvider`, `useOrders`.                                                                                                                                                                              |
| **Hàm nội bộ**                 | USD_TO_VND 25000; generateOrderId(); buildOrderFromProduct(product): orderId, bikeId, bikeName, image, status DEPOSIT_AWAITING, amountDue (parsePriceString(product.price) \* USD_TO_VND), expiresAt +24h. |
| **State**                      | orders (khởi tạo từ getPendingOrders()).                                                                                                                                                                   |
| **addOrder(product)**          | buildOrderFromProduct, unshift vào orders.                                                                                                                                                                 |
| **markOrderAsPaid(orderId)**   | Cập nhật order có orderId sang status PAID.                                                                                                                                                                |
| **getOrderByOrderId(orderId)** | Tìm trong orders.                                                                                                                                                                                          |
| **Value**                      | orders, addOrder, markOrderAsPaid, getOrderByOrderId.                                                                                                                                                      |

---

### 4.5 `src/contexts/NotificationContext.jsx`

| Mục                                                                                               | Nội dung                                                                                              |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Mục đích**                                                                                      | Danh sách thông báo (localStorage), thêm/đọc/xóa.                                                     |
| **Export**                                                                                        | NotificationContext, NotificationProvider.                                                            |
| **State**                                                                                         | notifications (từ localStorage hoặc demo 1 item). saveToStorage(items).                               |
| **addNotification(notification)**                                                                 | Tạo item (id, title, message, type, read: false, createdAt), unshift, slice(0,50), save.              |
| **markAsRead(id)**, **markAllAsRead()**, **removeNotification(id)**, **clearAll()**. unreadCount. |
| **Value**                                                                                         | notifications, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll, unreadCount. |

---

### 4.6 `src/contexts/useNotifications.js`

| Mục          | Nội dung                                                |
| ------------ | ------------------------------------------------------- |
| **Mục đích** | Hook re-export từ NotificationContext.                  |
| **Export**   | `useNotifications()` – useContext(NotificationContext). |

---

### 4.7 `src/contexts/usePostingStatusNotifications.js`

| Mục           | Nội dung                                                                                                                                                                                                                                  |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**  | So sánh trạng thái tin đăng với snapshot localStorage; khi chuyển sang ADMIN_APPROVED, AVAILABLE hoặc REJECTED thì addNotification; sau đó lưu snapshot.                                                                                  |
| **Import**    | useEffect; useAuth; usePostings; useNotifications; POSTING_STATUS.                                                                                                                                                                        |
| **Export**    | `usePostingStatusNotifications()`.                                                                                                                                                                                                        |
| **Hằng**      | STORAGE_KEY "basauycle-posting-status-prev".                                                                                                                                                                                              |
| **useEffect** | Phụ thuộc user, postings, addNotification. Đọc prev từ localStorage; for từng posting: so sánh status với prevStatus, nếu chuyển trạng thái thì addNotification (title/message/type); sau đó localStorage.setItem snapshot (id → status). |

---

## 5. Dịch vụ (Services)

### 5.1 `src/services/index.js`

| Mục        | Nội dung                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Export** | axiosInstance, api (từ axiosConfig); authService, userService, bikeService, bookingService, paymentService, postService, adminPostService, inspectionService (default từ từng file). |

---

### 5.2 `src/services/axiosConfig.js`

| Mục                       | Nội dung                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích**              | Tạo axios instance, interceptor request (Bearer token, FormData bỏ Content-Type), interceptor response (trả data, 401 xóa token + redirect /login, lấy message lỗi).                                 |
| **Import**                | axios; API_CONFIG; STORAGE_KEYS.                                                                                                                                                                     |
| **Export**                | default axios instance.                                                                                                                                                                              |
| **getErrorMessage(data)** | data.message ?? data.msg ?? data.error hoặc từ result/data bên trong.                                                                                                                                |
| **Request interceptor**   | Authorization Bearer token từ STORAGE_KEYS.TOKEN; nếu data là FormData thì delete Content-Type.                                                                                                      |
| **Response**              | success: return response.data. error: network → reject message; 401 → remove USER/TOKEN, redirect /login (trừ path login/register/forgot-password), reject; khác → reject { status, message, data }. |

---

### 5.3 `src/services/requestHelpers.js`

| Mục        | Nội dung                                                                              |
| ---------- | ------------------------------------------------------------------------------------- |
| **Export** | `formDataOptions(_data)` – return {} (giữ signature cho postService.uploadPostImage). |

---

### 5.4 `src/services/authService.js`

| Mục                                                                                                                    | Nội dung                                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mục đích**                                                                                                           | Gọi API auth: register, login, logout, verifyToken, refreshToken, forgotPassword, resetPassword, changePassword; đọc/ghi token và user từ response (nhiều dạng backend); lưu/xóa localStorage.                     |
| **Import**                                                                                                             | axiosInstance; API_ENDPOINTS; STORAGE_KEYS.                                                                                                                                                                        |
| **Export**                                                                                                             | default authService.                                                                                                                                                                                               |
| **Hàm nội bộ**                                                                                                         | getToken(obj), getUser(obj), normalizeLoginResponse(response) – trích token và user từ nhiều cấu trúc response.                                                                                                    |
| **login(credentials)**                                                                                                 | POST AUTH.LOGIN; chuẩn hóa result/result.token/result.authenticated; nếu thiếu user thì tạo từ credentials.email; lưu token và user vào localStorage; return { token, user }; catch trả message (401/403 pending). |
| **register(userData)**                                                                                                 | POST AUTH.REGISTER (FormData hoặc JSON).                                                                                                                                                                           |
| **logout**                                                                                                             | POST AUTH.LOGOUT; luôn xóa token/user localStorage (kể cả khi lỗi).                                                                                                                                                |
| **verifyToken**, **refreshToken**, **forgotPassword**, **resetPassword**, **changePassword** – gọi endpoint tương ứng. |

---

### 5.5 `src/services/userService.js`

| Mục          | Nội dung                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích** | API user: getProfile, updateProfile, getWishlist, addToWishlist, removeFromWishlist, getUsers (admin). Dùng API_ENDPOINTS.USER. |
| **Export**   | default userService (getMyInfo, updateMyInfo, getWishlist, addToWishlist, removeFromWishlist, getUsers, …).                     |

---

### 5.6 `src/services/postService.js`

| Mục          | Nội dung                                                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích** | API bài đăng và ảnh: getBrands, getCategories; createPost, getPostById, updatePost, updatePostStatus; getPostsBySeller, getPostsByStatus, getPosts, deletePost; uploadPostImage (FormData: postId, image, imageType, isThumbnail). |
| **Import**   | axiosInstance; API_ENDPOINTS; formDataOptions.                                                                                                                                                                                     |
| **Export**   | default postService.                                                                                                                                                                                                               |

---

### 5.7 `src/services/adminPostService.js`

| Mục          | Nội dung                                                                                |
| ------------ | --------------------------------------------------------------------------------------- |
| **Mục đích** | Admin duyệt/từ chối: getPendingPosts(), approvePost(postId), rejectPost(postId, body?). |
| **Export**   | default adminPostService.                                                               |

---

### 5.8 `src/services/inspectionService.js`

| Mục          | Nội dung                                                             |
| ------------ | -------------------------------------------------------------------- |
| **Mục đích** | Inspector: getPendingInspections(), submitInspection(postId, body?). |
| **Export**   | default inspectionService.                                           |

---

### 5.9 `src/services/bikeService.js`, `bookingService.js`, `paymentService.js`

| Mục          | Nội dung                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Mục đích** | CRUD/search/featured (bike); create/list/cancel/status (booking); create/verify/history/refund (payment). Gọi API_ENDPOINTS tương ứng. |
| **Export**   | default service object.                                                                                                                |

---

## 6. Tiện ích (Utils)

### 6.1 `src/utils/date.js`

| Mục        | Nội dung                                                                                                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | `formatDate(isoString, opts)` – Date toLocaleDateString (locale, day, month, year từ opts; mặc định vi-VN). `formatDateTime(isoString)` – toLocaleString en-US (day, month, year, hour, minute). Trả "" nếu invalid. |

---

### 6.2 `src/utils/formatCurrency.js`

| Mục        | Nội dung                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Export** | `formatCurrency(amount, locale='vnd')` – number format VND hoặc USD. `parsePriceString(price)` – bỏ $ và dấu phẩy, parseFloat. |

---

### 6.3 `src/utils/orderHelpers.js`

| Mục        | Nội dung                                                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | `isOrderExpired(order)` – so expiresAt với now. `getExpirationLabel(expiresAt)` – "Expires in Xh/Xd" hoặc "Expired Xd ago". `getEffectiveStatus(order)` – PAID giữ PAID; hết hạn → EXPIRED; còn lại → order.status hoặc DEPOSIT_AWAITING. |

---

## 7. Mô hình dữ liệu (Models)

### 7.1 `src/models/index.js`

| Mục        | Nội dung                                                                                                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | Re-export từ user (normalizeUser, getDefaultUser, USER_FIELDS), post (mapApiPostToPosting, getDefaultPost, POST_FIELDS, POSTING_STATUS), bike (normalizeBike, getDefaultBike, BIKE_FIELDS), booking (normalizeBooking, getDefaultBooking, BOOKING_FIELDS), payment (normalizePayment, getDefaultPayment, PAYMENT_FIELDS). |

---

### 7.2 `src/models/user.js`

| Mục        | Nội dung                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **Export** | USER_FIELDS (mảng tên field), getDefaultUser() (object rỗng), normalizeUser(raw) (chuẩn hóa role và key camel/snake). |

---

### 7.3 `src/models/post.js`

| Mục        | Nội dung                                                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | POST_FIELDS, getDefaultPost(), mapApiPostToPosting(row, formatCurrency), POSTING_STATUS. mapApiPostToPosting: trích postId, images, thumb, price, status, bicycleName, brand, category, … từ row (camel/snake), trả object thống nhất. |

---

### 7.4 `src/models/bike.js`, `booking.js`, `payment.js`

| Mục        | Nội dung                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| **Export** | normalizeX(raw), getDefaultX(), X_FIELDS (Bike/Booking/Payment). Chuẩn hóa key camel/snake, giá trị mặc định. |

---

## 8. Dữ liệu mẫu (Data mock)

### 8.1 `src/data/orders.js`

| Mục        | Nội dung                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | `getPendingOrders()` – gọi buildPendingOrders(). buildPendingOrders: tạo 3 order mẫu (ord-1, ord-2, ord-3) với bikeId, status, amountDue, expiresAt; map qua getProductById để lấy bikeName, image. |

---

### 8.2 `src/data/products.js`

| Mục        | Nội dung                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Export** | `productsById` (object id → product), `getProductById(id)`. Product có id, name, brand, year, price, image, images, category, badge, specs, seller, veloHealthScore, description, history, inspection. |

---

### 8.3 `src/data/marketplaceBikes.js`

| Mục        | Nội dung                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | `marketplaceBikes` (mảng 6 xe mẫu với id, name, price, category, image, badge, specs, location, size), `TOTAL_MARKETPLACE_COUNT` 1402. |

---

### 8.4 `src/data/inspections.js`

| Mục        | Nội dung                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Export** | mockInspections (hàng đợi kiểm định), mockDisputes, mockDisputeCases, mockCompletedReports, mockCompletedOrders; `getInspectionReport(inspectionId)` – trả object report (reportId, checklist, completionPercent, inspectorNotes, reportStatus, …). |

---

## 9. Thành phần giao diện (Components) – Tóm tắt chi tiết

### 9.1 `src/components/ProtectedRoute.jsx`

- **Thuộc tính (Props):** children, requiredRole = null.
- **Logic:** useAuth; role = user?.role ?? user?.userRole ?? user?.user_role ?? "MEMBER". Chưa đăng nhập → chuyển tới /login (state.from). Có requiredRole và role khác requiredRole → chuyển tới /unauthorized. Ngược lại → hiển thị children.

---

### 9.2 `src/components/PageBreadcrumb/index.jsx`

- **Thuộc tính:** items = [] ({ path, label }).
- **Hiển thị:** Breadcrumb antd, dấu phân cách ChevronRight; item có path và không phải item cuối → Link, còn lại → span (fontWeight 600 cho item cuối).

---

### 9.3 `src/components/filters/FilterBar.jsx`

- **Thuộc tính:** items = [] (key, label, value, onChange, options, icon), onMoreFilters, moreLabel = "Thêm bộ lọc".
- **Hiển thị:** Mỗi item: nhãn + Select(value, onChange, options, suffixIcon). Nếu có onMoreFilters: nút "Thêm bộ lọc".

---

### 9.4 `src/components/StepProgress/index.jsx`

- **Thuộc tính:** currentStep = 0, completedSections = [], onStepClick.
- **Các bước (STEPS):** Thông tin cơ bản, Thông số kỹ thuật, Ảnh/Video, Giá (icon tương ứng).
- **Hiển thị:** div step-progress-tabs; mỗi bước: div (className active/completed), onClick/onKeyDown gọi onStepClick(index).

---

### 9.5 `src/components/card/index.jsx` (BikeCard)

- **Thuộc tính:** bike (id, name, price, category, image, badge, specs?.weight, specs?.groupset, specs?.motorPower, sellerId).
- **Context:** useWishlist, useOrders, useAuth. isOwnListing: so sánh sellerId với user.id/userId/user_id/email.
- **Xử lý:** handleFavoriteClick (thêm/xóa wishlist hoặc chuyển login); handleBuy → addOrder(bike), chuyển /orders. getBadgeStyle(badge) – màu theo NEW ARRIVAL, NEW, INSPECTED, …
- **Hiển thị:** Card ảnh, Tag badge, nút tim (ẩn nếu là tin của mình), category, giá, tên, thông số (optional chaining), hành động: link "Tin của bạn" hoặc "Mua ngay" + "Xem chi tiết".
- **Ghi chú:** Đã bổ sung import HeartOutlined, HeartFilled, AppstoreOutlined, SettingOutlined, ThunderboltOutlined.

---

### 9.6 `src/components/header/index.jsx`

- **Thuộc tính:** navLinks, activeLink, navVariant, showSearch, showSellButton, showLogin, showAvatar, showWishlistIcon, showNotificationIcon.
- **Context:** useAuth, useWishlist, useNotifications. getNavLinksForRole(role), getActiveLink(pathname), getMenuItemsForRole(role) (MEMBER: Yêu thích, Ví, Đơn hàng, Quản lý tin, Tài khoản; ADMIN: Trang quản trị, Tài khoản; INSPECTOR: Kiểm định, Tài khoản).
- **Trạng thái:** userMenuAnchor, wishlistAnchor, notifAnchor.
- **Hiển thị:** StyledAppBar: LogoLink, NavLinks, ô tìm (Enter → marketplace?q=), bên phải: icon Yêu thích (Badge số lượng), icon Thông báo (chỉ MEMBER), nút Bán xe (ẩn với Admin/Inspector), Đăng nhập hoặc Avatar + Menu (các mục + Đăng xuất). Dropdown Yêu thích (5 mục đầu, link Xem tất cả). Dropdown Thông báo (đánh dấu đã đọc, xóa, formatDateTime).

---

### 9.7 `src/components/footer/index.jsx`

- **Thuộc tính:** marketplaceLinks, servicesLinks, companyLinks, bottomLinks (mảng { label, href }).
- **Hiển thị:** footer: logo, mô tả, icon mạng xã hội, 3 cột link, dưới cùng copyright + link.

---

### 9.8 `src/components/admin/AdminTopNav/index.jsx`

- **NAV_ITEMS:** Trang chủ quản trị, Quản lý người dùng, Tin đăng, Danh mục, Giao dịch, Báo cáo (to).
- **Hiển thị:** nav NavLink, className active khi isActive.

---

### 9.9 `src/components/admin/category/index.jsx` (CategoryFilter)

- **Trạng thái:** activeCategory "all". categories: Tất cả xe, Mountain, Road, Gravel, E-Bikes (Icon MUI).
- **Hiển thị:** FilterSection → FilterContainer → PillChipsWrapper → StyledToggleButton (selected, onClick).

---

### 9.10 `src/components/postings/PostingCard.jsx`

- **Thuộc tính:** posting. usePostings: updatePostingStatus. status → isActive, isVerified, isDraft, isSold, isExpired, isPending, isRejected.
- **Xử lý:** handleMarkSold → updatePostingStatus(posting.id, SOLD).
- **Hiển thị:** Card ảnh, Tag trạng thái, bikeName, postingId, formatDate(createdAt), priceDisplay, nút Sửa/Đánh dấu đã bán/Đang duyệt/Từ chối Sửa/Đã bán/Gia hạn/Xem theo status.

---

### 9.11 `src/components/wishlist/index.jsx` (WishlistCard)

- **Thuộc tính:** bike, onRemove. badges từ bike.badges hoặc bike.badge. specEntries từ specs (frame, groupset, size, weight). handleRemove → onRemove(bike.id).
- **Hiển thị:** Box ảnh, badges, nút xóa, tên, brand·năm, giá, specEntries map, Nút XEM CHI TIẾT hoặc KHÔNG CÒN (đã bán).

---

### 9.12 `src/components/featuredbikes/index.jsx`

- **Context:** usePostings (postings, publicPostings, loadPublicPostings, loadPostingsBySeller), useAuth (user). postingToBike(p): id, name, price, category, image, badge, specs, sellerId.
- **useEffect:** loadPublicPostings(); khi có user loadPostingsBySeller(sellerId).
- **allFeaturedBikes:** publicPostings + postings filter AVAILABLE/ADMIN_APPROVED, merge theo id, map postingToBike, concat featuredBikes mock.
- **Hiển thị:** SectionTitle, SectionDescription, ViewGalleryLink, CarouselWrapper: nút mũi tên trái/phải, CarouselScroll ref: map allFeaturedBikes → CarouselCardSlot → BikeCard.

---

### 9.13 `src/components/hero/index.jsx`

- **Hiển thị:** HeroOuter → HeroSection (HeroBg, HeroOverlay, HeroContent: HeroBadge "SÀN PREMIUM", HeroTitle "Tìm Chiếc Xe Hiệu Năng Tiếp Theo.", HeroDescription, HeroButtons: Link Khám phá Marketplace + Nút phụ Xe đã kiểm định), SearchWrapper → SearchCard → SearchBar.

---

### 9.14 `src/components/searchbar/index.jsx`

- **Trạng thái:** searchValue, bikeType "Tất cả loại", priceRange "Mọi giá". BIKE_TYPE_CHOICES từ BIKE_TYPE_OPTIONS. priceRanges: Mọi giá, Dưới $2,000, …
- **handleSearch:** URLSearchParams q, type, price → navigate /marketplace?...
- **Hiển thị:** ConfigProvider customTheme → div search-bar: Input (placeholder, onPressEnter handleSearch), Select loại xe, Select khoảng giá, Nút "Tìm xe".

---

### 9.15 `src/components/features/index.jsx`

- **features:** Kiểm định 36 điểm, Giao hàng cao cấp, Giao dịch an toàn (icon + tiêu đề + mô tả).
- **Hiển thị:** FeaturesSection → Container → Grid 3 FeatureCard (IconWrapper, IconBox, Typography title/body2).

---

### 9.16 `src/components/CTA/index.jsx`

- **Hiển thị:** CTASection (nền #00ccad), CTATitle "Sẵn sàng nâng cấp xe?", CTADescription, CTAButton "Đăng tin bán xe ngay" → navigate('/post').

---

### 9.17 `src/components/Button.jsx`

- **Thuộc tính:** children, variant = "primary", icon, iconPosition = "left", ...props. StyledButton (MUI) với variant primary/outline/dark (màu khác nhau). Hiển thị icon + children theo iconPosition.

---

### 9.18 `src/components/orders/OrderFilters.jsx`

- **Thuộc tính:** dateRange, amount, onDateRangeChange, onAmountChange, onMoreFilters. DATE_OPTIONS (30/14/7 ngày), AMOUNT_OPTIONS (all, 0-1m, 1m-5m, 5m+). Hiển thị FilterBar với 2 mục (icon Lịch, icon Đô la).

---

### 9.19 `src/components/orders/PendingOrderCard.jsx`

- **Thuộc tính:** order. getEffectiveStatus, getExpirationLabel, formatCurrency, ORDER_STATUS_LABEL/TAG_COLOR.
- **Xử lý:** handlePayNow → navigate /payment?orderId=...
- **Hiển thị:** Card ảnh, Tag trạng thái, bikeName, orderId, nhãn hết hạn, số tiền cần thanh toán, nút Thanh toán ngay / Đã thanh toán / Hết hạn.

---

### 9.20 `src/components/inspector/InspectionQueueTable/index.jsx`

- **Thuộc tính:** inspections = [], loading = false. PAGE_SIZE = 10.
- **Trạng thái:** search, page. filteredInspections (tìm theo id, bicycleName, bicycleType). pageItems = slice phân trang.
- **Hiển thị:** section: thanh công cụ (ô tìm, nút Bộ lọc), header bảng (THÔNG TIN XE, NGƯỜI BÁN, NGÀY YÊU CẦU, TRẠNG THÁI, HÀNH ĐỘNG), map pageItems: ảnh, tên xe, id, loại xe, tên người bán, địa điểm, formatDateTime(ngày yêu cầu), Tag trạng thái, nút Xem (navigate /inspector/:id), nút Chưa kiểm định/Đã kiểm định. Phân trang prev/số/next.
- **Ghi chú:** Đã thêm const PAGE_SIZE = 10.

---

### 9.21 `src/components/inspector/ActiveDisputesCard/index.jsx`

- **Thuộc tính:** disputes = [], onResolve, onViewAll. Hiển thị admin-card: tiêu đề "Tranh chấp đang xử lý", map disputes (reportId, mô tả, nút Giải quyết), nút Xem tất cả phiếu hỗ trợ.

---

### 9.22 `src/components/inspector/shared/index.jsx` (StatCard)

- **Thuộc tính:** label, value, trend, trendType, icon, tone = "blue". Hiển thị admin-stat-card: hộp icon, span trend, tiêu đề, giá trị.

---

## 10. Các trang (Pages) – Tóm tắt chi tiết

### 10.1 `src/pages/Login/index.jsx`

- **Trạng thái:** form (Form.useForm), isSubmitting. useAuth: login, loading. location.state?.from.
- **onFinish:** login({ email, password }). result.success → message thành công; role = result.user.role (chữ hoa); chuyển trang: Admin → /admin-dashboard, Inspector → /inspector, còn lại → from || /. result.success false → message lỗi(result.message). catch → message lỗi theo status 401/403/khác.
- **Hiển thị:** auth-page: logo Link, Form (email, mật khẩu, checkbox Nhớ đăng nhập, nút gửi), link Quên mật khẩu + Tạo tài khoản, link footer.

---

### 10.2 `src/pages/Marketplace/index.jsx`

- **Context:** usePostings (postings, publicPostings, loadPublicPostings, loadPostingsBySeller), useAuth (user). useSearchParams: typeFromUrl.
- **Trạng thái:** bikeType "all", priceRange [PRICE_MIN, PRICE_MAX], minPriceStr/maxPriceStr, minPriceFocused/maxPriceFocused, sortBy "newest", viewMode "grid".
- **useEffect:** loadPublicPostings(); khi user có sellerId thì loadPostingsBySeller. typeFromUrl hợp lệ → setBikeType(typeFromUrl).
- **allBikes:** publicPostings + postings lọc AVAILABLE/ADMIN_APPROVED, gộp theo id, map postingToBike, concat marketplaceBikes. displayedBikes: bikeType === "all" ? allBikes : lọc theo biketype.
- **Xử lý:** clearFilters; handleMinPriceChange/handleMaxPriceChange; onMinFocus/onMaxFocus; commitMinPrice/commitMaxPrice (giới hạn, set priceRange).
- **Hiển thị:** Header; layout sidebar (Bộ lọc, Select loại xe, Khoảng giá input + Slider) + main (Số kết quả tìm kiếm, select sắp xếp, chuyển grid/list, grid/list BikeCard, Xem thêm + số lượng); Footer với marketplaceLinks/servicesLinks.

---

### 10.3 `src/pages/Post/index.jsx` (PostBike)

- **Context:** usePostings (addPosting, getPostingById, updatePosting), useAuth (user), useNotifications (addNotification). postService, userService. searchParams editId.
- **Trạng thái:** sellerId, currentStep, completedSections; form: bikeName, brandId, categoryId, frameSize, frameMaterial, groupset, brakeType, modelYear, color, description, price; brandOptions, categoryOptions, dropdownLoading, dropdownError; requiredPhotos (slot → fileList), requiredPhotoFiles, requiredPhotoDataUrls, defectFiles, defectImageDataUrls. sectionIds ["basic-info", "technical-specs", "photos-videos", "pricing"].
- **useEffect:** tải brands/categories; setSellerId từ user; getProfile khi có token nhưng chưa có sellerId; khi editId: getPostingById hoặc getPostById(editId) → applyPosting (set toàn bộ field + requiredPhotos); IntersectionObserver set currentStep; completedSections từ điều kiện từng section (basic, technical, photos 6 slot, price).
- **handleStepClick:** cuộn tới section. beforeUploadRequired (slotKey, file): tối đa 5MB, set requiredPhotos/requiredPhotoFiles/requiredPhotoDataUrls. buildPayload: imageUrls từ requiredPhotoDataUrls, primaryImage. handleSaveDraft: addPosting(buildPayload(), DRAFT), addNotification, chuyển manage-listings. handlePublish: validate → run(): sanitizeVnd(price), updatePayload; editId ? updatePost : createPost; upload 6 ảnh (IMAGE_TYPE_BY_SLOT) + defectFiles; getPostById → updatePosting hoặc addPosting; addNotification; chuyển manage-listings.
- **Hiển thị:** Header; Breadcrumb; StepProgress(currentStep, completedSections, onStepClick); form các section Thông tin cơ bản (bikeName, brand, category), Thông số kỹ thuật (frameSize, frameMaterial, groupset, brakeType, modelYear, color, description), Ảnh (6 Upload bắt buộc + Upload điểm lỗi), Giá (price); Nút Lưu nháp, Đăng tin. Footer.

---

### 10.4 `src/pages/ManageListings/index.jsx`

- **Context:** usePostings (postings, updatePostingStatus, deletePosting, loadPostingsBySeller), useAuth (user), useNotifications (addNotification). BREADCRUMB_ITEMS, TAB_KEYS/TAB_ITEMS (all, PENDING, ADMIN_APPROVED, AVAILABLE, REJECTED, DRAFTED). POSTING_STATUS_STORAGE_KEY "basauycle-posting-status-prev".
- **Trạng thái:** activeTab, searchText, page, pageSize 10, loading, deleteModal { open, id, name }. sellerId từ user.
- **fetchMyPostings:** loadPostingsBySeller(sellerId hoặc từ getProfile). useEffect: fetchMyPostings; useEffect thông báo: so sánh postings với snapshot localStorage (giống usePostingStatusNotifications), addNotification khi APPROVED/AVAILABLE/REJECTED, lưu snapshot.
- **filteredByTab → filteredBySearch (tìm bikeName, brand, postingId) → paginatedData.** handleDelete: setDeleteModal. handleRelist: updatePostingStatus(id, ACTIVE), addNotification. confirmDelete: deletePosting(deleteModal.id), addNotification, setDeleteModal.
- **Cột bảng:** SẢN PHẨM (thumb, bikeName, postingId), GIÁ (priceDisplay), NGÀY ĐĂNG (formatDate), LƯỢT XEM, TRẠNG THÁI (Tag + Tooltip rejectionReason), HÀNH ĐỘNG (Sửa, Quảng bá nếu AVAILABLE, Đăng lại nếu SOLD, Xóa, Dropdown).
- **Hiển thị:** Header; PageBreadcrumb; tiêu đề + Nút "Đăng tin mới"; Tabs (tabCounts); Ô tìm kiếm; Bảng columns paginatedData; phân trang tùy chỉnh; Modal xác nhận xóa. Footer.
- **Ghi chú:** Đã thêm const POSTING_STATUS_STORAGE_KEY.

---

### 10.5 `src/pages/ProductDetail/index.jsx`

- **useParams:** id. useAuth, usePostings (getPostingById), useWishlist, useOrders. getProductById (data/products). adminPostService, postService. mapApiPostToPosting(row), postingToProduct(p).
- **Trạng thái:** fetchedPosting, loadingDetail; selectedImageIndex; rejectModalOpen, rejectReason, approvingId, rejectingId. role → isStaffView, isAdminView. posting: staff dùng fetchedPosting (getPostById); member dùng locationState.posting hoặc getPostingById(id). product = posting ? postingToProduct(posting) : getProductById(id). images = product.images hoặc 6 ảnh product.image.
- **useEffect:** isStaffView && id → getPostById(id) → setFetchedPosting(mapApiPostToPosting). isOwnListing: so sánh sellerId với user. canAdminApproveReject = isAdminView && postingStatus === PENDING.
- **handleAdminApprove:** adminPostService.approvePost(postId), message thành công, chuyển admin-listings. handleAdminRejectConfirm: rejectPost(postId, { rejectionReason }), message thành công, đóng modal, chuyển admin-listings. handleWishlistClick, handleBuyNow (addOrder, chuyển orders).
- **Hiển thị:** Header (staff dùng ADMIN_NAV_LINKS, pill, ẩn search/wishlist); Breadcrumbs (staff: TRANG CHỦ, ADMIN, TIN ĐĂNG, #id; member: TRANG CHỦ, category, tên sản phẩm); grid 2 cột: ảnh chính + gallery 6 ảnh; tóm tắt: badge, nút yêu thích, tên, giá, Tin của bạn / Về danh sách Admin + Duyệt+Từ chối / Mua ngay; khối người bán; veloHealthScore; thông số (frame, groupset, wheelset, weight, size, motorPower); Lịch sử sở hữu (description, history); thẻ báo cáo kiểm định (condition, carbonFrame, drivetrainLife, brakingPower, mechanicVerdict, Tải PDF). Modal Từ chối (textarea lý do). Footer.

---

### 10.6 `src/pages/admin/listing/index.jsx` (ListingApproval)

- **Trạng thái:** search, listings, loading, approvingId, rejectingId, rejectModalOpen, rejectPostId, rejectReason. adminPostService.getPendingPosts() → setListings. handleApprove(postId): approvePost(postId), fetchPending. openRejectModal(postId). handleRejectSubmit: rejectPost(rejectPostId, { rejectionReason }), fetchPending. getThumbnailUrl(item). flaggedItems, moderationHistory, guidelines (mock).
- **Hiển thị:** Header nav admin; admin-listings-stats (Số chờ duyệt, Đã duyệt hôm nay —, Tỷ lệ từ chối —); hàng đợi: Nút Lọc, Làm mới, bảng THÔNG TIN XE (thumb, bicycleName, postId), NGƯỜI BÁN, DANH MỤC, GIÁ (formatCurrency), NGÀY GỬI (formatDate), TRẠNG THÁI (Tag), HÀNH ĐỘNG (Xem → navigate /product/:id state.posting, Duyệt, Từ chối); các thẻ dưới: Cần kiểm tra, Lịch sử duyệt, Hướng dẫn Admin; Modal từ chối (TextArea lý do). Footer.

---

## 11. Các trang còn lại (mô tả ngắn)

- **Home:** Header, Hero, FeaturedBikes, Features, CTA, Footer.
- **Register:** Form đăng ký, authService.register, chuyển hướng.
- **ForgotPassword:** Form email, authService.forgotPassword.
- **Unauthorized:** Trang 403 (không có quyền).
- **Wishlist:** Header, lưới WishlistCard từ useWishlist, Footer.
- **Account:** Trang tài khoản (thông tin, đổi mật khẩu).
- **Wallet:** Trang ví (số dư, lịch sử).
- **Orders:** OrderFilters, danh sách PendingOrderCard (useOrders), link Thanh toán.
- **Payment:** Chọn đơn (orderId từ query), số tiền cần thanh toán, breadcrumb.
- **UserDetail, SetProfile:** Xem/sửa hồ sơ (SetProfile chuyển /account trong App).
- **admin/dashboard:** AdminTopNav, StatCard hoặc thống kê.
- **admin/user:** Bảng người dùng, lọc member, duyệt/từ chối.
- **admin/approved-listings:** Tin đã duyệt chờ kiểm định.
- **admin/inspection-reports:** Báo cáo kiểm định.
- **admin/revenue, transaction, reports:** Doanh thu, giao dịch, báo cáo.
- **admin/category:** Quản lý danh mục.
- **inspector/dashboard:** InspectionQueueTable(mockInspections), ActiveDisputesCard(mockDisputes), StatCard.
- **inspector/detail:** getInspectionReport(id), form nộp kết quả, formatDate.
- **inspector/details-list:** Danh sách chi tiết kiểm định.
- **inspector/completed:** mockCompletedOrders hoặc API.
- **inspector/disputes:** mockDisputeCases, bảng tranh chấp, formatDate.

---

## 12. Lỗi đã sửa trong quá trình rà soát

| File                           | Lỗi                                                    | Cách sửa                                                                                                      |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| postingStatus.js               | Thiếu khai báo object OVERALL_CONDITION (chỉ có value) | Thêm `export const OVERALL_CONDITION = { EXCELLENT, GOOD, FAIR, POOR };` trước OVERALL_CONDITION_LABEL.       |
| card/index.jsx                 | Thiếu import icon Ant Design                           | Thêm HeartOutlined, HeartFilled, AppstoreOutlined, SettingOutlined, ThunderboltOutlined từ @ant-design/icons. |
| InspectionQueueTable/index.jsx | Biến PAGE_SIZE chưa được định nghĩa                    | Thêm `const PAGE_SIZE = 10;`.                                                                                 |
| ManageListings/index.jsx       | POSTING_STATUS_STORAGE_KEY chưa được định nghĩa        | Thêm `const POSTING_STATUS_STORAGE_KEY = "basauycle-posting-status-prev";`.                                   |

---

_Báo cáo chi tiết code và chức năng từng file (trừ file .css) – Dự án BASAUYCLE._

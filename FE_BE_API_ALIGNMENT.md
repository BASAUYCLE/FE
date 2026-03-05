# Đối chiếu API FE – BE (BASAUYCLE)

Tài liệu BE: [FE_API_TESTING_GUIDE.md](https://github.com/BASAUYCLE/BE/blob/main/FE_API_TESTING_GUIDE.md)

Base URL: `http://localhost:8080` (hoặc `VITE_API_BASE_URL`)

---

## Đã khớp BE

| Nhóm            | Endpoint FE                                                                                                                                                                                            | Ghi chú BE                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**        | `POST /auth/login`, `POST /auth/register`                                                                                                                                                              | Body login: `{ email, password }`. Register: `multipart/form-data` (email, password, fullName, phoneNumber, cccdFront, cccdBack). BE có thêm `POST /auth/introspect` (kiểm tra token).                                                    |
| **User**        | `GET/PUT /users/myinfo`, `GET /users`, `GET /users/{id}`, `PUT/DELETE /users/{id}`                                                                                                                     | BE có thêm `GET /users/email/{email}`.                                                                                                                                                                                                    |
| **Posts**       | `GET /posts`, `GET /posts/{id}`, `POST /posts`, `PUT/DELETE /posts/{id}`, `GET /posts/seller/{id}`, `GET /posts/brand/{id}`, `GET /posts/category/{id}`, `GET /posts/size/{size}`, `GET /posts/search` | Body create/update: sellerId, brandId, categoryId, bicycleName, bicycleColor, price, bicycleDescription, groupset, frameMaterial, brakeType, size, modelYear. BE có thêm `POST /posts/draft`, `GET /posts/my-posts`, `GET /posts/drafts`. |
| **Images**      | `POST /images`, `GET /images/post/{postId}`, `GET /images/{imageId}`, `PUT/DELETE /images/{imageId}`                                                                                                   | Upload: `multipart/form-data` với **imageFile** (không phải `image`), postId, imageType (`GENERAL` \| `THUMBNAIL`), isThumbnail.                                                                                                          |
| **Brands**      | `GET /brands`, `GET /brands/{id}`                                                                                                                                                                      | Khớp.                                                                                                                                                                                                                                     |
| **Categories**  | `GET /categories`, `GET /categories/{id}`                                                                                                                                                              | Khớp.                                                                                                                                                                                                                                     |
| **Admin posts** | `GET /admin/posts/pending`, `PUT /admin/posts/{id}/approve`, `PUT /admin/posts/{id}/reject`                                                                                                            | BE có thêm `GET /admin/posts`, `GET /admin/posts/status/{status}`, `PUT /admin/posts/{id}/hide`.                                                                                                                                          |
| **Admin users** | `GET /admin/users`, `POST /admin/users/verify`                                                                                                                                                         | Body verify: `{ userId, action: "APPROVE" \| "REJECT", reason? }`. BE có thêm `GET /admin/users/pending`, `GET /admin/users/{userId}`.                                                                                                    |
| **Inspector**   | `GET /inspection/pending`, `POST /inspection/{postId}/submit`                                                                                                                                          | Body submit: `{ result: "PASS" \| "FAIL", overallCondition: "EXCELLENT" \| "GOOD" \| "FAIR" \| "POOR", notes }`.                                                                                                                          |
| **Wishlist**    | `POST /wishlist/{postId}`, `DELETE /wishlist/{postId}`, `GET /wishlist`, `GET /wishlist/check/{postId}`                                                                                               | Thêm/xóa khỏi danh sách yêu thích, lấy danh sách, kiểm tra. Khớp.                                                                                                                                                                        |
| **Addresses**   | `GET /users/{userId}/addresses`, `POST /users/{userId}/addresses`, `PUT /users/{userId}/addresses/{addressId}`, `DELETE /users/{userId}/addresses/{addressId}`                                         | CRUD địa chỉ giao hàng. Khớp.                                                                                                                                                                                                            |
| **Locations**   | `GET /locations/provinces`, `GET /locations/provinces/{code}/communes`                                                                                                                                  | Danh sách tỉnh/thành, xã/phường. Khớp.                                                                                                                                                                                                   |
| **Wallet**      | `GET /wallet`, `POST /wallet/top-up`                                                                                                                                                                    | Xem ví, nạp tiền (trả VNPay URL). Khớp.                                                                                                                                                                                                  |
| **Transactions**| `GET /transactions`, `GET /transactions/{id}`                                                                                                                                                           | Lịch sử giao dịch, chi tiết giao dịch. Khớp.                                                                                                                                                                                             |

---

## FE có, BE chưa nêu trong guide

- **Auth:** `LOGOUT`, `VERIFY`, `REFRESH`, `FORGOT_PASSWORD`, `RESET_PASSWORD`, `CHANGE_PASSWORD` – có thể BE chưa implement hoặc path khác.
- **Posts:** `GET /posts/status/{status}` – BE chỉ nêu `GET /posts` (trả về AVAILABLE, DEPOSITED, SOLD). Nếu BE không có endpoint status thì FE có thể dùng `GET /posts` rồi lọc.
- **Metadata:** `GET /metadata/post-form`, frame-sizes, photo-categories, groupsets, brake-types – FE gọi và fallback default nếu 404.
- **Admin:** `REVENUE_STATS`, `INSPECTION_REPORTS` – FE có fallback/empty.
- **Inspector:** `DISPUTES`, `COMPLETED`, `REPORT(postId)` – FE có fallback/empty.

---

## Đã chỉnh trong FE

### 1. **`src/config/api.js`**
   - Thêm `POSTS.DRAFT_SUBMIT(postId)` = `/posts/draft/{postId}/submit`.
   - Thêm `WALLET`, `TRANSACTIONS`, `ADDRESSES`, `LOCATIONS`, `WISHLIST` endpoints.
   - Cập nhật comments với endpoint BE thực tế.

### 2. **Tạo các services mới**
   - **`src/services/walletService.js`**: `GET /wallet`, `POST /wallet/top-up`.
   - **`src/services/transactionService.js`**: `GET /transactions`, `GET /transactions/{id}`.
   - **`src/services/wishlistService.js`**: Wishlist CRUD + check.
   - **`src/services/addressService.js`**: Address CRUD theo user.
   - **`src/services/locationService.js`**: Lấy tỉnh, xã theo tỉnh.

### 3. **`src/services/postService.js`**
   - Upload ảnh: đổi field từ `image` sang **`imageFile`** đúng với BE.
   - Thêm `submitDraft()`, `createDraftPost()`, `getMyDrafts()`.
   - Thêm `searchPostsByPrice()`.
   - Thêm image CRUD methods.

### 4. **`src/services/adminPostService.js`**
   - Thêm `getAllPosts()`, `getPostsByStatus()`, `hidePost()`.

### 5. **`src/services/userService.js`**
   - Xóa wishlist methods (dùng wishlistService thay thế).
   - Thêm `getPendingUsers()`, cập nhật `verifyUser()`.

### 6. **`src/services/inspectionService.js`**
   - Thêm params cho các methods.

### 7. **`src/contexts/WishlistContext.jsx`**
   - Import `wishlistService` thay vì `userService`.
   - Cập nhật userId field names (hỗ trợ `user.userId`).

### 8. **`src/services/index.js`**
   - Export 5 services mới.

### 9. **`src/services/authService.js`**
   - Đơn giản hóa `login()` method.
   - User info từ /users/myinfo, không phải từ login response.

---

## Response BE (trích từ guide)

- Success: `{ "code": 0, "result": ... }` hoặc `{ "result": ... }`.
- Login: `result.token`, `result.authenticated` (boolean).
- Create post: `result.postId`, `result.postStatus` (PENDING).
- Upload image: `result.imageId`, `result.imageUrl`, `result.imageType`, `result.isThumbnail`.
- Wishlist: `result` là array WishlistResponse hoặc single object.
- Wallet: `result` là WalletResponse.
- Transactions: `result` là list TransactionResponse.

FE đã xử lý `res?.data ?? res?.result ?? res` ở các service qua axiosConfig interceptor.

---

## Upload ảnh bài đăng (BicycleImages)

- **BE thực tế:** `BicycleImageController` POST `/images`, `@ModelAttribute BicycleImageCreateRequest` — request class có field **`MultipartFile image`** (tên binding là **`image`**), `Long postId`, `String imageType`, `Boolean isThumbnail`. (FE_API_TESTING_GUIDE ghi `imageFile` nhưng code BE dùng `image`.)
- **FE gửi:** `POST /images` (multipart/form-data). Field: `postId`, **`image`** (file), `imageType` (THUMBNAIL | GENERAL), `isThumbnail` ("true" | "false"). Nếu 400 thì fallback thử `imageFile`.
- **DB:** Bảng ảnh riêng (BicycleImages) với FK tới BicyclePosts. Sau khi tạo bài bằng `POST /posts`, FE lấy `result.postId` rồi gọi `POST /images` nhiều lần (mỗi ảnh một request) với cùng `postId`.

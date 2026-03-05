import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { ORDER_STATUS } from "../constants/orderStatus";
import orderService from "../services/orderService";
import postService from "../services/postService";
import { useAuth } from "./AuthContext";

const OrderContext = createContext(null);

/**
 * Map BE OrderStatus (string) → FE ORDER_STATUS constant.
 * BE statuses: DEPOSITED | PAID | SHIPPING | COMPLETED | CANCELLED
 */
function mapStatus(raw) {
  const s = (raw || "").toString().toUpperCase();
  if (s === "DEPOSITED")  return ORDER_STATUS.DEPOSITED;
  if (s === "PAID")       return ORDER_STATUS.PAID;
  if (s === "SHIPPING")   return ORDER_STATUS.SHIPPING;
  if (s === "COMPLETED")  return ORDER_STATUS.COMPLETED;
  if (s === "CANCELLED")  return ORDER_STATUS.CANCELLED;
  return ORDER_STATUS.DEPOSITED; // safe default
}

/**
 * Trích xuất URL ảnh thumbnail từ nhiều dạng dữ liệu mà BE có thể trả về.
 */
function extractImage(row) {
  if (row.thumbnailUrl) return row.thumbnailUrl;
  if (row.imageUrl)     return row.imageUrl;
  if (row.image)        return row.image;
  if (row.image_url)    return row.image_url;

  const post = row.post ?? row.postInfo ?? null;
  if (post) {
    if (post.thumbnailUrl) return post.thumbnailUrl;
    if (post.imageUrl)     return post.imageUrl;
    const postImgs = post.images ?? post.bicycleImages ?? [];
    if (Array.isArray(postImgs) && postImgs.length > 0) {
      const t = postImgs.find((i) => i?.isThumbnail) ?? postImgs[0];
      const u = t?.imageUrl ?? t?.image_url ?? t?.url;
      if (u) return u;
    }
  }

  const imgs = row.images ?? row.bicycleImages ?? row.imageList ?? [];
  if (Array.isArray(imgs) && imgs.length > 0) {
    const t = imgs.find((i) => i?.isThumbnail) ?? imgs[0];
    const u = t?.imageUrl ?? t?.image_url ?? t?.url ?? t;
    if (typeof u === "string") return u;
  }
  return null;
}

/**
 * Ghép địa chỉ giao hàng từ nhiều field khác nhau mà BE có thể trả về.
 */
function buildShippingAddress(row) {
  if (!row || typeof row !== "object") return null;

  // Nếu BE đã trả sẵn full string
  const direct =
    row.shippingAddress ??
    row.shipping_address ??
    row.deliveryAddress ??
    row.delivery_address ??
    row.addressLine ??
    row.address_line ??
    row.fullAddress ??
    row.full_address;
  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  // Nếu BE trả về object address/shippingAddress
  const addrObj =
    (typeof row.shippingAddress === "object" && row.shippingAddress) ||
    (typeof row.address === "object" && row.address) ||
    (typeof row.deliveryAddress === "object" && row.deliveryAddress) ||
    null;

  if (addrObj) {
    const parts = [
      addrObj.streetAddress ?? addrObj.street ?? addrObj.addressLine,
      addrObj.communeName ?? addrObj.wardName ?? addrObj.commune,
      addrObj.districtName ?? addrObj.district,
      addrObj.provinceName ?? addrObj.city ?? addrObj.province,
    ]
      .map((p) => (typeof p === "string" ? p.trim() : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
    if (typeof addrObj.fullAddress === "string") return addrObj.fullAddress;
  }

  return null;
}

/** Chuẩn hóa một row từ BE → shape order FE. */
function normalizeOrder(row) {
  if (!row || typeof row !== "object") return null;

  const rawId = row.orderId ?? row.id ?? row.order_id ?? row.bookingId;
  const postId = row.postId ?? row.post_id ?? row.bikeId ?? row.productId;

  const totalPrice   = Number(row.totalPrice   ?? row.total_price   ?? 0);
  const depositAmount = Number(row.depositAmount ?? row.deposit_amount ?? 0);
  const status = mapStatus(row.orderStatus ?? row.status);

  // amountDue: số tiền cần trả tiếp theo
  let amountDue = 0;
  if (status === ORDER_STATUS.DEPOSITED) {
    // Đã cọc, còn lại phần full payment
    amountDue = Math.max(0, totalPrice - depositAmount);
  }
  // PAID/SHIPPING/COMPLETED/CANCELLED → amountDue = 0

  return {
    id:      rawId != null ? String(rawId) : null,
    orderId: rawId != null ? String(rawId) : "",
    bikeId:  postId ?? null,
    bikeName:
      row.postTitle ?? row.post_title ?? row.bikeName ?? row.productName ?? "—",
    image:   extractImage(row),
    shippingAddress: buildShippingAddress(row),
    status,
    totalPrice,
    depositAmount,
    amountDue,
    // Shipping info
    shippingMethod:        row.shippingMethod        ?? row.shipping_method         ?? null,
    shippingTrackingNumber: row.shippingTrackingNumber ?? row.shipping_tracking_number ?? null,
    proofImage:            row.proofImage            ?? row.proof_image             ?? null,
    shippedAt:             row.shippedAt             ?? row.shipped_at              ?? null,
    // Timestamps
    expiresAt:  row.expiresAt  ?? "",
    createdAt:  row.createdAt  ?? row.created_at  ?? "",
  };
}

/** Với orders chưa có ảnh nhưng có bikeId, fetch ảnh từ /images/post/{postId}. */
async function enrichImages(orders) {
  const missing = orders.filter((o) => !o.image && o.bikeId);
  if (!missing.length) return orders;

  const results = await Promise.allSettled(
    missing.map((o) => postService.getPostImages(o.bikeId)),
  );

  const map = {};
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const arr = Array.isArray(r.value?.result ?? r.value?.data ?? r.value)
      ? (r.value?.result ?? r.value?.data ?? r.value)
      : [];
    const t = arr.find((img) => img?.isThumbnail) ?? arr[0];
    const url = t?.imageUrl ?? t?.image_url ?? t?.url ?? null;
    if (url) map[String(missing[i].bikeId)] = url;
  });

  return orders.map((o) =>
    !o.image && o.bikeId && map[String(o.bikeId)]
      ? { ...o, image: map[String(o.bikeId)] }
      : o,
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function OrderProvider({ children }) {
  const [orders, setOrders]   = useState([]);   // buyer's orders
  const [sales,  setSales]    = useState([]);   // seller's sales
  const { user } = useAuth();

  const hasUser = !!(
    user &&
    (user.userId != null || user.id != null || user.user_id != null)
  );

  /** Fetch buyer orders */
  const fetchOrders = useCallback(async () => {
    if (!hasUser) { setOrders([]); return; }
    try {
      const res = await orderService.getMyOrders();
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
      const list = Array.isArray(raw) ? raw : raw?.orders ?? raw?.content ?? [];
      const normalized = list.map(normalizeOrder).filter(Boolean);
      const enriched = await enrichImages(normalized);
      setOrders(enriched);
    } catch (err) {
      if (err?.status !== 404 && err?.status !== 401)
        console.warn("OrderContext: getMyOrders failed", err?.message);
      setOrders([]);
    }
  }, [hasUser]);

  /** Fetch seller sales */
  const fetchSales = useCallback(async () => {
    if (!hasUser) { setSales([]); return; }
    try {
      const res = await orderService.getMySales();
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
      const list = Array.isArray(raw) ? raw : raw?.orders ?? raw?.content ?? [];
      const normalized = list.map(normalizeOrder).filter(Boolean);
      const enriched = await enrichImages(normalized);
      setSales(enriched);
    } catch (err) {
      if (err?.status !== 404 && err?.status !== 401)
        console.warn("OrderContext: getMySales failed", err?.message);
      setSales([]);
    }
  }, [hasUser]);

  useEffect(() => { fetchOrders(); fetchSales(); }, [fetchOrders, fetchSales]);

  // ── Actions ──────────────────────────────────────────────────────────────

  /** B1/B2: Tạo order mới (cọc hoặc full) */
  const addOrder = useCallback(async (product, options = {}) => {
    if (!product?.id) return null;
    const res = await orderService.createOrder({
      postId:    product.id,
      addressId: options.addressId ?? null,
      payFull:   !!options.payFull,
    });
    const data  = res?.result ?? res?.data ?? res;
    let order = normalizeOrder(data);

    // Nếu BE không trả ảnh trong order mới, dùng luôn ảnh & tên từ product hiện tại
    if (order) {
      if (!order.image && product.image) {
        order = {
          ...order,
          image: product.image,
        };
      }
      if (!order.bikeName && product.name) {
        order = {
          ...order,
          bikeName: product.name,
        };
      }
      if (!order.bikeId && product.id) {
        order = {
          ...order,
          bikeId: product.id,
        };
      }
      setOrders((prev) => [order, ...prev]);
    }
    return order;
  }, []);

  /** B3: Buyer trả phần còn lại */
  const payRemaining = useCallback(async (orderId) => {
    await orderService.payRemaining(orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: ORDER_STATUS.PAID, amountDue: 0 } : o,
      ),
    );
  }, []);

  /** B4: Seller xác nhận giao hàng */
  const confirmShipping = useCallback(
    async (orderId, { shippingMethod, shippingTrackingNumber, proofImageFile }) => {
      const res = await orderService.confirmShipping(orderId, {
        shippingMethod,
        shippingTrackingNumber,
        proofImageFile,
      });
      const updated = normalizeOrder(res?.result ?? res?.data ?? res);
      const patch = updated
        ? {
            status: ORDER_STATUS.SHIPPING,
            shippingMethod:         updated.shippingMethod,
            shippingTrackingNumber: updated.shippingTrackingNumber,
            proofImage:             updated.proofImage,
            shippedAt:              updated.shippedAt,
          }
        : { status: ORDER_STATUS.SHIPPING };
      setSales((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
      );
    },
    [],
  );

  /** B5: Buyer xác nhận nhận hàng */
  const confirmDelivery = useCallback(async (orderId) => {
    await orderService.confirmDelivery(orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: ORDER_STATUS.COMPLETED } : o,
      ),
    );
  }, []);

  /** B6/B7: Hủy đơn (buyer hoặc seller) */
  const cancelOrder = useCallback(async (orderId, { isSeller = false } = {}) => {
    await orderService.cancelOrder(orderId);
    const cancel = (o) =>
      o.orderId === orderId ? { ...o, status: ORDER_STATUS.CANCELLED } : o;
    if (isSeller) setSales ((prev) => prev.map(cancel));
    else          setOrders((prev) => prev.map(cancel));
  }, []);

  // ── Legacy compat ─────────────────────────────────────────────────────────
  const markOrderAsPaid = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: ORDER_STATUS.PAID, amountDue: 0 } : o,
      ),
    );
  }, []);

  const getOrderByOrderId = useCallback(
    (orderId) => orders.find((o) => o.orderId === orderId) ?? null,
    [orders],
  );

  const value = useMemo(
    () => ({
      orders,
      sales,
      addOrder,
      payRemaining,
      confirmShipping,
      confirmDelivery,
      cancelOrder,
      markOrderAsPaid,
      getOrderByOrderId,
      refreshOrders: fetchOrders,
      refreshSales:  fetchSales,
    }),
    [
      orders, sales,
      addOrder, payRemaining, confirmShipping, confirmDelivery, cancelOrder,
      markOrderAsPaid, getOrderByOrderId, fetchOrders, fetchSales,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}

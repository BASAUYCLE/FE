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
 * BE có thể trả snake_case, alias (IN_TRANSIT, SHIPPED, …), hoặc enum khác tên.
 */
function mapStatus(raw) {
  const s = (raw || "").toString().trim().toUpperCase().replace(/-/g, "_");
  const aliases = {
    DEPOSITED: ORDER_STATUS.DEPOSITED,
    PAID: ORDER_STATUS.PAID,
    SHIPPING: ORDER_STATUS.SHIPPING,
    IN_TRANSIT: ORDER_STATUS.SHIPPING,
    INTRANSIT: ORDER_STATUS.SHIPPING,
    SHIPPED: ORDER_STATUS.SHIPPING,
    OUT_FOR_DELIVERY: ORDER_STATUS.SHIPPING,
    DELIVERED: ORDER_STATUS.DELIVERED,
    DISPUTED: ORDER_STATUS.DISPUTED,
    DISPUTE: ORDER_STATUS.DISPUTED,
    COMPLETED: ORDER_STATUS.COMPLETED,
    COMPLETE: ORDER_STATUS.COMPLETED,
    CANCELLED: ORDER_STATUS.CANCELLED,
    CANCELED: ORDER_STATUS.CANCELLED,
  };
  if (aliases[s]) return aliases[s];
  if (Object.values(ORDER_STATUS).includes(s)) return s;
  return ORDER_STATUS.DEPOSITED;
}

/**
 * Trích xuất URL ảnh thumbnail từ nhiều dạng dữ liệu mà BE có thể trả về.
 */
function extractImage(row) {
  if (row.thumbnailUrl) return row.thumbnailUrl;
  if (row.imageUrl) return row.imageUrl;
  if (row.image) return row.image;
  if (row.image_url) return row.image_url;

  const post = row.post ?? row.postInfo ?? null;
  if (post) {
    if (post.thumbnailUrl) return post.thumbnailUrl;
    if (post.imageUrl) return post.imageUrl;
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

/**
 * Số điện thoại người mua (Users.user_phone_number trong DB — join qua Orders.buyer_id).
 * BE có thể trả camelCase userPhoneNumber, nested buyer, hoặc alias khác.
 */
function extractBuyerPhone(row) {
  if (!row || typeof row !== "object") return null;

  const pick = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

  const fromUserLike = (u) =>
    u && typeof u === "object"
      ? pick(
          u.userPhoneNumber ??
            u.user_phone_number ??
            u.phoneNumber ??
            u.phone ??
            u.phone_number ??
            u.mobile,
        )
      : null;

  const direct = pick(
    row.buyerPhone ??
      row.buyer_phone ??
      row.buyerPhoneNumber ??
      row.buyer_phone_number ??
      row.userPhoneNumber ??
      row.user_phone_number ??
      row.recipientPhone ??
      row.recipient_phone ??
      row.contactPhone ??
      row.contact_phone ??
      row.deliveryPhone ??
      row.delivery_phone,
  );
  if (direct) return direct;

  const buyer =
    row.buyer ?? row.buyerInfo ?? row.buyerUser ?? row.buyerDetails ?? null;
  const fromBuyer = fromUserLike(buyer);
  if (fromBuyer) return fromBuyer;

  const nestedUser =
    row.buyer?.user ?? row.buyerUser?.user ?? row.buyerInfo?.user ?? null;
  const fromNested = fromUserLike(nestedUser);
  if (fromNested) return fromNested;

  const addrObj =
    (typeof row.shippingAddress === "object" && row.shippingAddress) ||
    (typeof row.deliveryAddress === "object" && row.deliveryAddress) ||
    (typeof row.address === "object" && row.address) ||
    null;
  if (addrObj) {
    const p = pick(
      addrObj.phoneNumber ??
        addrObj.phone ??
        addrObj.phone_number ??
        addrObj.recipientPhone ??
        addrObj.userPhoneNumber ??
        addrObj.user_phone_number,
    );
    if (p) return p;
  }

  return pick(row.phoneNumber ?? row.phone_number);
}

/** Chuẩn hóa một row từ BE → shape order FE. */
function normalizeOrder(row) {
  if (!row || typeof row !== "object") return null;

  const rawId = row.orderId ?? row.id ?? row.order_id ?? row.bookingId;
  const postId = row.postId ?? row.post_id ?? row.bikeId ?? row.productId;

  const totalPrice = Number(row.totalPrice ?? row.total_price ?? 0);
  const depositAmount = Number(row.depositAmount ?? row.deposit_amount ?? 0);
  const rawStatus =
    row.orderStatus ??
    row.order_status ??
    row.status ??
    row.orderState ??
    row.order_state;
  let status = mapStatus(rawStatus);

  /**
   * Đơn đặt cọc: sau khi đã có tiền cọc (depositAmount > 0), không chờ tab "Awaiting payment"
   * — chuyển sang PAID (Awaiting shipment) để seller được Ship; phần còn lại xử lý khi giao/COD theo BE.
   */
  if (status === ORDER_STATUS.DEPOSITED && depositAmount > 0) {
    status = ORDER_STATUS.PAID;
  }

  // amountDue: số tiền cần trả tiếp theo
  let amountDue = 0;
  if (status === ORDER_STATUS.DEPOSITED) {
    // Đã cọc, còn lại phần full payment
    amountDue = Math.max(0, totalPrice - depositAmount);
  }
  // PAID/SHIPPING/COMPLETED/CANCELLED → amountDue = 0

  return {
    id: rawId != null ? String(rawId) : null,
    orderId: rawId != null ? String(rawId) : "",
    bikeId: postId ?? null,
    bikeName:
      row.postTitle ?? row.post_title ?? row.bikeName ?? row.productName ?? "—",
    image: extractImage(row),
    shippingAddress: buildShippingAddress(row),
    buyerPhone: extractBuyerPhone(row),
    status,
    totalPrice,
    depositAmount,
    amountDue,
    // Shipping info
    shippingMethod: row.shippingMethod ?? row.shipping_method ?? null,
    shippingTrackingNumber:
      row.shippingTrackingNumber ?? row.shipping_tracking_number ?? null,
    shippingPhone: row.shippingPhone ?? row.shipping_phone ?? null,
    proofImage: row.proofImage ?? row.proof_image ?? null,
    shippedAt: row.shippedAt ?? row.shipped_at ?? null,
    deliveredAt: row.deliveredAt ?? row.delivered_at ?? null,
    // Timestamps
    expiresAt: row.expiresAt ?? "",
    createdAt: row.createdAt ?? row.created_at ?? "",
  };
}

/** Đồng bộ ảnh mới nhất theo postId cho Orders/My Sales. */
async function enrichImages(orders) {
  const postIds = [
    ...new Set(
      orders
        .map((o) => o?.bikeId)
        .filter((id) => id != null && String(id).trim() !== ""),
    ),
  ];
  if (!postIds.length) return orders;

  const results = await Promise.allSettled(
    postIds.map((postId) => postService.getPostImages(postId)),
  );

  const map = {};
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return;
    const arr = Array.isArray(r.value?.result ?? r.value?.data ?? r.value)
      ? (r.value?.result ?? r.value?.data ?? r.value)
      : [];
    const t = arr.find((img) => img?.isThumbnail) ?? arr[0];
    const url = t?.imageUrl ?? t?.image_url ?? t?.url ?? null;
    if (url) {
      const updatedAt =
        t?.updatedAt ??
        t?.updated_at ??
        t?.createdAt ??
        t?.created_at ??
        Date.now();
      // cache-bust để FE luôn thấy ảnh mới khi user vừa thay đổi ảnh
      map[String(postIds[i])] =
        `${url}${String(url).includes("?") ? "&" : "?"}v=${encodeURIComponent(String(updatedAt))}`;
    }
  });

  return orders.map((o) => {
    if (!o?.bikeId) return o;
    const latest = map[String(o.bikeId)];
    return latest ? { ...o, image: latest } : o;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]); // buyer's orders
  const [sales, setSales] = useState([]); // seller's sales
  const { user } = useAuth();

  const hasUser = !!(
    user &&
    (user.userId != null || user.id != null || user.user_id != null)
  );

  /** Fetch buyer orders */
  const fetchOrders = useCallback(async () => {
    if (!hasUser) {
      setOrders([]);
      return;
    }
    try {
      const res = await orderService.getMyOrders();
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
      const list = Array.isArray(raw)
        ? raw
        : (raw?.orders ?? raw?.content ?? []);
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
    if (!hasUser) {
      setSales([]);
      return;
    }
    try {
      const res = await orderService.getMySales();
      const raw = res?.result ?? res?.data ?? res?.content ?? res;
      const list = Array.isArray(raw)
        ? raw
        : (raw?.orders ?? raw?.content ?? []);
      const normalized = list.map(normalizeOrder).filter(Boolean);
      const enriched = await enrichImages(normalized);
      setSales(enriched);
    } catch (err) {
      if (err?.status !== 404 && err?.status !== 401)
        console.warn("OrderContext: getMySales failed", err?.message);
      setSales([]);
    }
  }, [hasUser]);

  useEffect(() => {
    fetchOrders();
    fetchSales();
  }, [fetchOrders, fetchSales]);

  // Keep order/sales in sync so status-change notifications can appear
  // without requiring a hard refresh.
  useEffect(() => {
    if (!hasUser) return;
    const timer = setInterval(() => {
      fetchOrders();
      fetchSales();
    }, 30000);
    return () => clearInterval(timer);
  }, [hasUser, fetchOrders, fetchSales]);

  // ── Actions ──────────────────────────────────────────────────────────────

  /** B1/B2: Tạo order mới (cọc hoặc full) */
  const addOrder = useCallback(async (product, options = {}) => {
    if (!product?.id) return null;
    const payFull = !!options.payFull;
    const res = await orderService.createOrder({
      postId: product.id,
      addressId: options.addressId ?? null,
      payFull,
    });
    let data = res?.result ?? res?.data ?? res;
    if (data && typeof data === "object" && !payFull) {
      const d = Number(data.depositAmount ?? data.deposit_amount ?? 0);
      if (
        (d <= 0 || Number.isNaN(d)) &&
        typeof options.expectedDepositAmount === "number" &&
        options.expectedDepositAmount > 0
      ) {
        data = { ...data, depositAmount: options.expectedDepositAmount };
      }
    }
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
        o.orderId === orderId
          ? { ...o, status: ORDER_STATUS.PAID, amountDue: 0 }
          : o,
      ),
    );
  }, []);

  /** B4: Seller xác nhận giao hàng */
  const confirmShipping = useCallback(
    async (
      orderId,
      { shippingMethod, shippingTrackingNumber, shippingPhone, proofImageFile },
    ) => {
      const res = await orderService.confirmShipping(orderId, {
        shippingMethod,
        shippingTrackingNumber,
        shippingPhone,
        proofImageFile,
      });
      const updated = normalizeOrder(res?.result ?? res?.data ?? res);
      const patch = updated
        ? {
            status: ORDER_STATUS.SHIPPING,
            shippingMethod: updated.shippingMethod,
            shippingTrackingNumber: updated.shippingTrackingNumber,
            shippingPhone: updated.shippingPhone,
            proofImage: updated.proofImage,
            shippedAt: updated.shippedAt,
          }
        : { status: ORDER_STATUS.SHIPPING };
      setSales((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
      );
    },
    [],
  );

  /** B5: Buyer xác nhận nhận hàng → BE đặt DELIVERED (sau đó scheduler có thể COMPLETED). */
  const confirmDelivery = useCallback(async (orderId) => {
    const res = await orderService.confirmDelivery(orderId);
    const updated = normalizeOrder(res?.result ?? res?.data ?? res);
    const patch = updated
      ? {
          status: updated.status ?? ORDER_STATUS.DELIVERED,
          deliveredAt: updated.deliveredAt ?? null,
        }
      : { status: ORDER_STATUS.DELIVERED };
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
    );
    setSales((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
    );
  }, []);

  /** Buyer completes the ordered explicitly */
  const completeOrder = useCallback(async (orderId) => {
    const res = await orderService.completeOrder(orderId);
    const updated = normalizeOrder(res?.result ?? res?.data ?? res);
    const patch = updated
      ? {
          status: updated.status ?? ORDER_STATUS.COMPLETED,
        }
      : { status: ORDER_STATUS.COMPLETED };
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
    );
    setSales((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o)),
    );
  }, []);

  /** B6/B7: Hủy đơn (buyer hoặc seller) */
  const cancelOrder = useCallback(
    async (orderId, { isSeller = false } = {}) => {
      await orderService.cancelOrder(orderId);
      const cancel = (o) =>
        o.orderId === orderId ? { ...o, status: ORDER_STATUS.CANCELLED } : o;
      if (isSeller) setSales((prev) => prev.map(cancel));
      else setOrders((prev) => prev.map(cancel));
    },
    [],
  );

  // ── Legacy compat ─────────────────────────────────────────────────────────
  const markOrderAsPaid = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? { ...o, status: ORDER_STATUS.PAID, amountDue: 0 }
          : o,
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
      completeOrder,
      cancelOrder,
      markOrderAsPaid,
      getOrderByOrderId,
      refreshOrders: fetchOrders,
      refreshSales: fetchSales,
    }),
    [
      orders,
      sales,
      addOrder,
      payRemaining,
      confirmShipping,
      confirmDelivery,
      completeOrder,
      cancelOrder,
      markOrderAsPaid,
      getOrderByOrderId,
      fetchOrders,
      fetchSales,
    ],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}

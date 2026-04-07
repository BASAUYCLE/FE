import { useEffect, useMemo, useContext } from "react";
import { ORDER_STATUS_LABEL } from "../constants/orderStatus";
import { useAuthOptional } from "./AuthContext";
import { useOrders } from "./OrderContext";
import { NotificationContext } from "./NotificationContextBase";

const STORAGE_KEY_PREFIX = "basauycle-order-status-prev";
const KNOWN_KEY_PREFIX = "basauycle-order-known";

function normalizeUserId(user) {
  return user?.id ?? user?.userId ?? user?.user_id ?? user?.email ?? null;
}

function getStorageKey(userId) {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

function getKnownKey(userId) {
  return userId ? `${KNOWN_KEY_PREFIX}-${userId}` : KNOWN_KEY_PREFIX;
}

function orderStatusMessage(status, role, bikeName) {
  const label = ORDER_STATUS_LABEL[status] ?? status ?? "Updated";
  const itemName = bikeName?.trim() || "your order";

  if (role === "seller") {
    if (status === "PAID") return `Buyer has paid for "${itemName}".`;
    if (status === "DELIVERED") return `Buyer confirmed delivery for "${itemName}".`;
    if (status === "COMPLETED") return `Order for "${itemName}" is completed.`;
    if (status === "DISPUTED") return `A dispute was opened for "${itemName}".`;
    if (status === "CANCELLED") return `Order for "${itemName}" was cancelled.`;
    return `Sale "${itemName}" changed to ${label}.`;
  }

  if (status === "SHIPPING") return `Seller started shipping "${itemName}".`;
  if (status === "DELIVERED") return `"${itemName}" was marked delivered.`;
  if (status === "COMPLETED") return `Order "${itemName}" is completed.`;
  if (status === "DISPUTED") return `Order "${itemName}" is under dispute.`;
  if (status === "CANCELLED") return `Order "${itemName}" was cancelled.`;
  return `Order "${itemName}" changed to ${label}.`;
}

function pushOrderStatusNotification(addNotification, order, role) {
  const status = String(order?.status ?? "").toUpperCase();
  if (!status) return;
  addNotification({
    type: status === "CANCELLED" ? "warning" : status === "DISPUTED" ? "error" : "info",
    title: role === "seller" ? "Sale status updated" : "Order status updated",
    message: orderStatusMessage(status, role, order?.bikeName),
    meta: {
      orderId: order?.orderId ?? order?.id ?? null,
      role,
      status,
    },
  });
}

function getOrderPaymentMethodLabel(order) {
  const total = Number(order?.totalPrice ?? 0);
  const deposit = Number(order?.depositAmount ?? 0);
  if (deposit > 0 && total > deposit) return "deposit payment";
  if (total > 0 && deposit >= total) return "full payment";
  // Fallback from status when amounts are not reliable
  const status = String(order?.status ?? "").toUpperCase();
  if (status === "DEPOSITED" || status === "PAID") return "deposit payment";
  return "payment";
}

function pushNewSaleNotification(addNotification, order) {
  const itemName = order?.bikeName?.trim() || "your listing";
  const paymentMethod = getOrderPaymentMethodLabel(order);
  addNotification({
    type: "info",
    title: "New order received",
    message: `Your listing "${itemName}" has been ordered with ${paymentMethod}.`,
    meta: {
      orderId: order?.orderId ?? order?.id ?? null,
      role: "seller",
      kind: "new_sale",
      paymentMethod,
    },
  });
}

export function useOrderStatusNotifications() {
  const auth = useAuthOptional();
  const user = auth?.user ?? null;
  const userId = normalizeUserId(user);
  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const knownKey = useMemo(() => getKnownKey(userId), [userId]);
  const notifCtx = useContext(NotificationContext) ?? null;
  const addNotification = notifCtx?.addNotification ?? null;
  const { orders, sales } = useOrders();

  useEffect(() => {
    if (!user || !addNotification) return;

    let prevMap = {};
    let knownIds = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) prevMap = JSON.parse(raw);
    } catch {
      prevMap = {};
    }
    try {
      const rawKnown = localStorage.getItem(knownKey);
      if (rawKnown) knownIds = JSON.parse(rawKnown);
    } catch {
      knownIds = {};
    }

    const currentMap = {};
    const currentKnownIds = {};
    const buyerOrders = Array.isArray(orders) ? orders : [];
    const sellerOrders = Array.isArray(sales) ? sales : [];
    const hasKnownSnapshot = Object.keys(knownIds ?? {}).length > 0;

    for (const order of buyerOrders) {
      const id = order?.orderId ?? order?.id;
      if (!id) continue;
      const key = `buyer-${id}`;
      const nextStatus = String(order?.status ?? "").toUpperCase();
      if (nextStatus) currentMap[key] = nextStatus;
      const prevStatus = prevMap[key];
      if (prevStatus && nextStatus && prevStatus !== nextStatus) {
        pushOrderStatusNotification(addNotification, order, "buyer");
      }
    }

    for (const order of sellerOrders) {
      const id = order?.orderId ?? order?.id;
      if (!id) continue;
      const key = `seller-${id}`;
      currentKnownIds[key] = true;
      const nextStatus = String(order?.status ?? "").toUpperCase();
      if (nextStatus) currentMap[key] = nextStatus;
      const prevStatus = prevMap[key];
      if (!prevStatus && hasKnownSnapshot && !knownIds[key]) {
        pushNewSaleNotification(addNotification, order);
      }
      if (prevStatus && nextStatus && prevStatus !== nextStatus) {
        pushOrderStatusNotification(addNotification, order, "seller");
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(currentMap));
      localStorage.setItem(knownKey, JSON.stringify(currentKnownIds));
    } catch {
      // ignore storage errors
    }
  }, [user, orders, sales, addNotification, storageKey, knownKey]);
}

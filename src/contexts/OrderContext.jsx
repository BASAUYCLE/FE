import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { ORDER_STATUS } from "../constants/orderStatus";
import { getPendingOrders } from "../data/orders";
import { parsePriceString } from "../utils/formatCurrency";

const OrderContext = createContext(null);

/** Demo: 1 USD = 25000 VND for amountDue */
const USD_TO_VND = 25000;

function generateOrderId() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `ORD-2024-${n}`;
}

/**
 * Build order from product (card or ProductDetail). Product: { id, name, price, image }.
 */
function buildOrderFromProduct(product) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const usd = parsePriceString(product.price);
  const amountDueVnd = Math.round(usd * USD_TO_VND);
  return {
    id: `ord-${product.id}-${Date.now()}`,
    orderId: generateOrderId(),
    bikeId: product.id,
    bikeName: product.name,
    image: product.image ?? null,
    status: ORDER_STATUS.DEPOSIT_AWAITING,
    amountDue: amountDueVnd,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => getPendingOrders());

  const addOrder = useCallback((product) => {
    if (!product?.id) return;
    const order = buildOrderFromProduct(product);
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const markOrderAsPaid = useCallback((orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId ? { ...o, status: ORDER_STATUS.PAID } : o,
      ),
    );
  }, []);

  const getOrderByOrderId = useCallback(
    (orderId) => orders.find((o) => o.orderId === orderId) ?? null,
    [orders],
  );

  const value = useMemo(
    () => ({ orders, addOrder, markOrderAsPaid, getOrderByOrderId }),
    [orders, addOrder, markOrderAsPaid, getOrderByOrderId],
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

import { getProductById } from "./products";
import { ORDER_STATUS } from "../constants/orderStatus";

/**
 * Mock pending orders for the current user.
 * Replace with API call (e.g. getOrdersByUser()) when backend is ready.
 */
function buildPendingOrders() {
  const now = new Date();
  const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const in2d = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const raw = [
    {
      id: "ord-1",
      orderId: "ORD-2024-8842",
      bikeId: 1,
      status: ORDER_STATUS.DEPOSIT_AWAITING,
      amountDue: 875000,
      expiresAt: in12h.toISOString(),
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ord-2",
      orderId: "ORD-2024-8843",
      bikeId: 3,
      status: ORDER_STATUS.FULL_PAYMENT,
      amountDue: 4200000,
      expiresAt: in2d.toISOString(),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ord-3",
      orderId: "ORD-2024-8844",
      bikeId: 2,
      status: ORDER_STATUS.FULL_PAYMENT,
      amountDue: 6500000,
      expiresAt: yesterday.toISOString(),
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return raw.map((o) => {
    const product = getProductById(o.bikeId);
    return {
      ...o,
      bikeName: product?.name ?? "Bike",
      image: product?.image ?? null,
    };
  });
}

/** Get pending orders (mock). Swap for API when ready. */
export function getPendingOrders() {
  return buildPendingOrders();
}

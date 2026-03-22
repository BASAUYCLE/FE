import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  App,
} from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import DisputeSummaryRow from "../../components/disputes/DisputeSummaryRow";
import { useAuth } from "../../contexts/AuthContext";
import { useOrders } from "../../contexts/OrderContext";
import disputeService from "../../services/disputeService";
import { DISPUTE_STATUS } from "../../constants/disputeStatus";
import ReturnShippingReceiptFormItem from "../../components/disputes/ReturnShippingReceiptUpload";
import { resolveShippingReceiptUrl } from "../../utils/returnShippingReceiptUpload";
import "../Orders/index.css";
import "./index.css";

export default function MyDisputesPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshOrders, refreshSales } = useOrders();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get("orderId");

  const myId = user?.userId ?? user?.id ?? user?.user_id ?? null;

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shipModal, setShipModal] = useState({ open: false, dispute: null });
  const [shipLoading, setShipLoading] = useState(false);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await disputeService.getMyDisputes();
      const raw = res?.result ?? res?.data ?? res;
      setList(Array.isArray(raw) ? raw : []);
    } catch (e) {
      message.error(e?.message || "Could not load disputes.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => {
    const arr = [...list];
    if (highlightOrderId) {
      arr.sort((a, b) => {
        const ah = String(a.orderId) === String(highlightOrderId) ? 0 : 1;
        const bh = String(b.orderId) === String(highlightOrderId) ? 0 : 1;
        return ah - bh;
      });
    }
    return arr;
  }, [list, highlightOrderId]);

  const openShipModal = (d) => {
    setShipModal({ open: true, dispute: d });
    form.resetFields();
  };

  const submitShipping = async () => {
    const d = shipModal.dispute;
    if (!d) return;
    try {
      const v = await form.validateFields();
      setShipLoading(true);
      let shippingReceiptUrl;
      try {
        shippingReceiptUrl = await resolveShippingReceiptUrl(v.shippingReceipt);
      } catch (upErr) {
        message.error(upErr?.message || "Upload ảnh thất bại.");
        setShipLoading(false);
        return;
      }
      await disputeService.updateShippingInfo(d.disputeId, {
        shippingProvider: v.shippingProvider,
        trackingCode: v.trackingCode,
        shippingReceiptUrl,
      });
      message.success("Return shipping info saved.");
      setShipModal({ open: false, dispute: null });
      await load();
      refreshOrders?.();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e?.message || "Update failed.");
    } finally {
      setShipLoading(false);
    }
  };

  const confirmReturn = async (disputeId) => {
    try {
      await disputeService.confirmReturnReceipt(disputeId);
      message.success(
        "Return confirmed. Refund flow continues per platform rules.",
      );
      await load();
      refreshSales?.();
      refreshOrders?.();
    } catch (e) {
      message.error(e?.message || "Could not confirm.");
    }
  };

  return (
    <div className="orders-page">
      <Header />
      <main className="orders-main">
        <div className="orders-container">
          <Typography.Title level={2} className="title">
            My disputes
          </Typography.Title>
          <Typography.Text type="secondary" className="orders-subtitle">
            Cases where you are the buyer or seller.{" "}
            <Link to="/orders">Back to orders</Link>
          </Typography.Text>

          <div
            className="my-disputes-list my-disputes-list--bars"
            style={{ marginTop: 24 }}
          >
            {loading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin />
              </div>
            ) : sorted.length === 0 ? (
              <Empty
                description="No disputes yet"
                style={{ padding: "40px 0" }}
              />
            ) : (
              sorted.map((d) => {
                const isBuyer =
                  myId != null && String(d.buyerId) === String(myId);
                const isSeller =
                  myId != null && String(d.sellerId) === String(myId);
                const highlight =
                  highlightOrderId &&
                  String(d.orderId) === String(highlightOrderId);
                return (
                  <DisputeSummaryRow
                    key={d.disputeId}
                    dispute={d}
                    highlight={highlight}
                    actions={
                      <>
                        <Button
                          type="primary"
                          onClick={() =>
                            navigate(`/my-disputes/${d.disputeId}`)
                          }
                        >
                          View details
                        </Button>
                        {isBuyer && d.status === DISPUTE_STATUS.APPROVED && (
                          <Button onClick={() => openShipModal(d)}>
                            Add return shipping info
                          </Button>
                        )}
                        {isSeller &&
                          d.status === DISPUTE_STATUS.RETURN_SHIPPED && (
                            <Button onClick={() => confirmReturn(d.disputeId)}>
                              Confirm return received
                            </Button>
                          )}
                      </>
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      </main>

      <Modal
        title="Return shipping details"
        open={shipModal.open}
        onCancel={() => setShipModal({ open: false, dispute: null })}
        onOk={submitShipping}
        confirmLoading={shipLoading}
        destroyOnHidden
        centered
        zIndex={1300}
        styles={{
          body: {
            maxHeight: "min(70vh, 520px)",
            overflowY: "auto",
            paddingTop: 8,
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="shippingProvider"
            label="Carrier"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g. GHTK, GHN" />
          </Form.Item>
          <Form.Item
            name="trackingCode"
            label="Tracking code"
            rules={[{ required: true, message: "Required" }]}
          >
            <Input />
          </Form.Item>
          <ReturnShippingReceiptFormItem />
        </Form>
      </Modal>

      <Footer />
    </div>
  );
}

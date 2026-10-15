import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const stages = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
export default function OrderDetails() {
  const { id } = useParams(); const navigate = useNavigate();
  const [order, setOrder] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [statusBusy, setStatusBusy] = useState(false);
  const loadOrder = useCallback(async () => { setLoading(true); setError(""); try { const { data } = await api.get(`/orders/${id}`); setOrder(data.order); } catch (err) { setError(err.response?.data?.message || "Unable to load this order."); } finally { setLoading(false); } }, [id]);
  useEffect(() => { loadOrder(); }, [loadOrder]);
  const progressStatus = async () => { const index = stages.indexOf(order.status); if (index < 0 || index >= stages.length - 1) return; setStatusBusy(true); try { const { data } = await api.patch(`/orders/${id}/status`, { status: stages[index + 1] }); setOrder(data.order); } catch (err) { setError(err.response?.data?.message || "Could not update status."); } finally { setStatusBusy(false); } };
  if (loading) return <main className="lab-page"><p className="lab-state">Loading order…</p></main>;
  if (error && !order) return <main className="lab-page"><section className="lab-card"><h1>Order details</h1><p className="lab-error">{error}</p><button className="lab-primary" onClick={() => navigate("/orders")}>Back to My Orders</button></section></main>;
  const paid = order.paymentStatus === "PAID";
  return <main className="lab-page"><header className="lab-header"><button className="lab-back" onClick={() => navigate("/orders")}>← My Orders</button><p className="products-eyebrow">ORDER CONFIRMATION</p><div className="lab-success-icon">{paid ? "✓" : "!"}</div><h1>{paid ? "Order placed successfully" : "Order pending payment"}</h1><p>{paid ? "Your order has been saved successfully." : "Payment has not been verified yet."}</p></header>
    <section className="lab-card lab-detail-card"><div className="lab-order-card-top"><div><p className="lab-muted">ORDER ID</p><h2>{order._id}</h2></div><span className={`lab-status ${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div><div className="lab-detail-items">{order.items.map((item, i) => <div className="lab-order-item" key={`${item.name}-${i}`}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><span>{item.quantity} × {money(item.price)}</span></div><b>{money(item.price * item.quantity)}</b></div>)}</div><div className="lab-total-row lab-total"><strong>Total paid</strong><strong>{money(order.totalAmount)}</strong></div><div className="lab-address"><h3>Shipping address</h3><p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p><p>{order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p></div><div className="lab-detail-actions"><button className="lab-primary" onClick={() => navigate("/orders")}>View My Orders</button><button className="lab-secondary" onClick={() => navigate("/products")}>Continue shopping</button></div>
    {error && <p className="lab-error">{error}</p>}{paid && import.meta.env.DEV && order.status !== "DELIVERED" && <div className="lab-bonus"><p><strong>Development bonus:</strong> simulate the next order status (disabled in production).</p><button className="lab-secondary" disabled={statusBusy} onClick={progressStatus}>{statusBusy ? "Updating…" : `Advance to ${stages[stages.indexOf(order.status) + 1] || "DELIVERED"}`}</button></div>}</section>
  </main>;
}

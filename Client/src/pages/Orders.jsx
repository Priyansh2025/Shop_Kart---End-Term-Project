import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const loadOrders = useCallback(async () => { setLoading(true); setError(""); try { const { data } = await api.get("/orders"); setOrders(data.orders || []); } catch (err) { setError(err.response?.data?.message || "Unable to load your orders."); } finally { setLoading(false); } }, []);
  useEffect(() => { loadOrders(); }, [loadOrders]);
  return <main className="lab-page"><header className="lab-header"><button className="lab-back" onClick={() => navigate("/home")}>← Continue shopping</button><p className="products-eyebrow">YOUR SHOPKART HISTORY</p><h1>My Orders</h1><p>All your saved orders, newest first.</p></header>
    {loading ? <p className="lab-state">Loading your orders…</p> : error ? <section className="lab-card"><p className="lab-error">{error}</p><button className="lab-primary" onClick={loadOrders}>Try again</button></section> : orders.length === 0 ? <section className="lab-card lab-empty"><div className="lab-success-icon">📦</div><h2>You have not placed any orders yet.</h2><p>Your completed orders will appear here.</p><button className="lab-primary" onClick={() => navigate("/products")}>Start shopping</button></section> : <div className="lab-orders-list">{orders.map(order => <article className="lab-card lab-order-card" key={order._id}><div className="lab-order-card-top"><div><p className="lab-muted">ORDER #{order._id.slice(-8).toUpperCase()}</p><h2>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</h2></div><span className={`lab-status ${order.status.toLowerCase()}`}>{order.status.replaceAll("_", " ")}</span></div><div className="lab-order-items-preview">{order.items.map((item, index) => <p key={`${item.name}-${index}`}>{item.name} × {item.quantity}</p>)}</div><div className="lab-order-card-bottom"><div><span className="lab-muted">Total</span><strong>{money(order.totalAmount)}</strong></div><button className="lab-primary" onClick={() => navigate(`/order-success/${order._id}`)}>View details</button></div></article>)}</div>}
  </main>;
}

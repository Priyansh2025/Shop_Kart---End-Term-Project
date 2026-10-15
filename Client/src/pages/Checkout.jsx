import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const initialAddress = { fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" };
const money = value => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const loadRazorpay = () => new Promise(resolve => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, totalItems, clearCartView, refreshCart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    const errors = {};
    for (const [key, value] of Object.entries(address)) if (!value.trim()) errors[key] = "This field is required.";
    if (address.phone.trim() && !/^[6-9]\d{9}$/.test(address.phone.trim())) errors.phone = "Enter a valid 10-digit Indian phone number.";
    if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) errors.pincode = "Pincode must contain exactly 6 digits.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async event => {
    event.preventDefault(); setMessage("");
    if (!validate()) return;
    if (!cartItems.length) { setMessage("Your cart is empty. Add a product before checkout."); return; }
    setBusy(true);
    try {
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error("Razorpay Checkout could not load. Check your internet connection and try again.");
      const { data } = await api.post("/orders/create-payment-order", { shippingAddress: address });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: `Order ${String(data.shopKartOrderId).slice(-8)}`,
        order_id: data.razorpayOrderId,
        prefill: { name: address.fullName, contact: address.phone },
        theme: { color: "#2563eb" },
        handler: async response => {
          try {
            const verified = await api.post("/orders/verify-payment", {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (!verified.data.success) throw new Error("Payment could not be verified.");
            clearCartView();
            await refreshCart();
            navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
          } catch (verifyError) {
            setMessage(verifyError.response?.data?.message || verifyError.message || "Payment verification failed. Your cart has not been cleared.");
          } finally { setBusy(false); }
        },
        modal: { ondismiss: () => { setBusy(false); setMessage("Checkout was closed. Your cart is still saved."); } },
      };
      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", response => {
        setBusy(false);
        setMessage(response.error?.description || "Payment failed. Your cart has not been cleared. Please try again.");
      });
      checkout.open();
    } catch (err) {
      setBusy(false);
      setMessage(err.response?.data?.message || err.message || "Unable to start checkout.");
    }
  };

  if (loading) return <main className="lab-page"><p className="lab-state">Loading your cart...</p></main>;
  if (error) return <main className="lab-page"><section className="lab-card"><h1>Checkout</h1><p className="lab-error">{error}</p><button onClick={() => refreshCart()} className="lab-primary">Try again</button></section></main>;
  if (!cartItems.length) return <main className="lab-page"><section className="lab-card"><h1>Your cart is empty</h1><p>Add products before proceeding to checkout.</p><button className="lab-primary" onClick={() => navigate("/products")}>Browse products</button></section></main>;

  const labels = { fullName: "Full name", phone: "Phone number", addressLine1: "Address line", city: "City", state: "State", pincode: "Pincode" };
  return <main className="lab-page">
    <header className="lab-header"><button className="lab-back" onClick={() => navigate("/cart")}>← Back to cart</button><p className="products-eyebrow">SECURE CHECKOUT · TEST PAYMENT</p><h1>Checkout</h1><p>Enter your shipping details and review your order.</p></header>
    <div className="lab-grid">
      <form className="lab-card" onSubmit={placeOrder} noValidate>
        <h2>Shipping details</h2>
        <div className="lab-form-grid">
          {Object.entries(labels).map(([key, label]) => <label className="lab-field" key={key}>
            <span>{label}</span><input value={address[key]} onChange={e => { setAddress(prev => ({ ...prev, [key]: e.target.value })); setFieldErrors(prev => ({ ...prev, [key]: "" })); }} placeholder={label} autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : key === "addressLine1" ? "street-address" : key} />
            {fieldErrors[key] && <small>{fieldErrors[key]}</small>}
          </label>)}
        </div>
        {message && <p className="lab-error" role="alert">{message}</p>}
        <button className="lab-primary lab-place-order" type="submit" disabled={busy}>{busy ? "Starting secure checkout…" : "Place order & pay"}</button>
        <p className="lab-note">Razorpay Test Mode only. Do not enter real payment details.</p>
      </form>
      <aside className="lab-card lab-order-summary"><h2>Order summary</h2>
        {cartItems.map(({ product, quantity }) => <div className="lab-order-item" key={product._id}><img src={product.image} alt={product.name} /><div><strong>{product.name}</strong><span>{quantity} × {money(product.price)}</span></div><b>{money(product.price * quantity)}</b></div>)}
        <div className="lab-total-row"><span>Items</span><span>{totalItems}</span></div><div className="lab-total-row lab-total"><strong>Total</strong><strong>{money(subtotal)}</strong></div>
        <p className="lab-note">The final price and stock are checked again by the server before payment.</p>
      </aside>
    </div>
  </main>;
}

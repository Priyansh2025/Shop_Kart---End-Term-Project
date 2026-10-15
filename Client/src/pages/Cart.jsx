import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    refreshCart,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");

  const changeQuantity = async (item, quantity) => {
    if (quantity < 1 || quantity > item.product.stock) return;
    setBusyId(item.product._id);
    setActionError("");
    try {
      await updateQuantity(item.product._id, quantity);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Could not update quantity. Please try again.",
      );
    } finally {
      setBusyId("");
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await removeFromCart(productId);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Could not remove this item. Please try again.",
      );
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="cart-page">
      <nav className="products-navbar">
        <button className="products-logo" onClick={() => navigate("/home")}>
          ShopKart
        </button>
        <div className="products-nav-actions">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/products")}>Products</button>
          <button onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button onClick={() => navigate("/orders")}>My Orders</button>
          <button
            className="products-nav-active"
            onClick={() => navigate("/cart")}
          >
            Cart ({totalItems})
          </button>
        </div>
      </nav>
      <main className="cart-main">
        <header className="cart-header">
          <p className="products-eyebrow">READY WHEN YOU ARE</p>
          <h1>My Cart</h1>
          <p>Review your items and adjust quantities before checkout.</p>
        </header>
        {loading && (
          <div className="products-state">
            <p>Loading your cart...</p>
          </div>
        )}
        {!loading && error && (
          <div className="products-state products-error-state">
            <h2>Unable to load your cart</h2>
            <p>{error}</p>
            <button className="product-details-button" onClick={refreshCart}>
              Try Again
            </button>
          </div>
        )}
        {!loading && !error && cartItems.length === 0 && (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <button
              className="add-cart-button"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        )}
        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            <section className="cart-items-list" aria-label="Cart items">
              {cartItems.map(({ product, quantity }) => (
                <article className="cart-item" key={product._id}>
                  <button
                    className="cart-item-image-button"
                    onClick={() => navigate(`/products/${product._id}`)}
                    aria-label={`View ${product.name}`}
                  >
                    <img src={product.image} alt={product.name} />
                  </button>
                  <div className="cart-item-details">
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <p className="cart-unit-price">
                      {money(product.price)} each
                    </p>
                    <p
                      className={
                        product.stock > 0
                          ? "product-stock"
                          : "product-stock out-of-stock"
                      }
                    >
                      {product.stock > 0
                        ? `${product.stock} units available`
                        : "Out of stock"}
                    </p>
                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button
                          aria-label={`Decrease ${product.name} quantity`}
                          disabled={busyId === product._id || quantity <= 1}
                          onClick={() =>
                            changeQuantity({ product, quantity }, quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span aria-live="polite">{quantity}</span>
                        <button
                          aria-label={`Increase ${product.name} quantity`}
                          disabled={
                            busyId === product._id || quantity >= product.stock
                          }
                          onClick={() =>
                            changeQuantity({ product, quantity }, quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove-button"
                        disabled={busyId === product._id}
                        onClick={() => handleRemove(product._id)}
                      >
                        {busyId === product._id ? "Updating..." : "Remove"}
                      </button>
                    </div>
                  </div>
                  <strong className="cart-line-total">
                    {money(product.price * quantity)}
                  </strong>
                </article>
              ))}
            </section>
            <aside className="cart-summary">
              <h2>Order Summary</h2>
              <div className="cart-summary-products">
                {cartItems.map(({ product, quantity }) => (
                  <div className="cart-summary-product" key={product._id}>
                    <div className="cart-summary-product-info">
                      <span className="cart-summary-product-name">
                        {product.name}
                      </span>
                      <span className="cart-summary-product-calculation">
                        {quantity} × {money(product.price)}
                      </span>
                    </div>
                    <strong className="cart-summary-product-total">
                      {money(product.price * quantity)}
                    </strong>
                  </div>
                ))}
              </div>
              <div className="cart-summary-row">
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>
              <div className="cart-summary-row cart-summary-grand-total">
                <span>Total</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <p className="cart-summary-note">
                Shipping and taxes are calculated at checkout.
              </p>
              <button
                className="checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
              <button
                className="continue-shopping-button"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
        {actionError && (
          <div className="cart-action-error" role="alert">
            {actionError}
          </div>
        )}
      </main>
    </div>
  );
}

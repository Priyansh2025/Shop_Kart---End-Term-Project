import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Wishlist = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/wishlist");
      setProducts(response.data.wishlist || []);
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? "Please log in to view your wishlist."
          : requestError.response?.data?.message ||
              "Something went wrong while loading your wishlist.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    if (removingId) return;

    setRemovingId(productId);
    setError("");

    try {
      await api.delete(`/wishlist/${productId}`);
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not remove this product. Please try again.",
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="wishlist-page">
      <nav className="products-navbar">
        <button className="products-logo" onClick={() => navigate("/home")}>
          ShopKart
        </button>
        <div className="products-nav-actions">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/products")}>Products</button>
          <button
            className="products-nav-active"
            onClick={() => navigate("/wishlist")}
          >
            Wishlist
          </button>
          <button onClick={() => navigate("/orders")}>My Orders</button>
          <button onClick={() => navigate("/cart")}>Cart ({totalItems})</button>
        </div>
      </nav>

      <main className="products-main">
        <section className="products-header">
          <div>
            <p className="products-eyebrow">YOUR SAVED ITEMS</p>
            <h1>My Wishlist</h1>
            <p>Keep the products you love in one place.</p>
          </div>
        </section>

        {loading && (
          <div className="products-state">
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state products-error-state">
            <h2>Unable to load wishlist</h2>
            <p>{error}</p>
            <button
              className="product-details-button wishlist-retry-button"
              onClick={fetchWishlist}
            >
              Try Again
            </button>
            {error.toLowerCase().includes("log in") && (
              <button
                className="back-products-button"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="products-state">
            <h2>Your wishlist is empty</h2>
            <p>Browse the catalogue and save products you like.</p>
            <button
              className="product-details-button wishlist-retry-button"
              onClick={() => navigate("/products")}
            >
              Explore Products
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <section className="products-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-card-content">
                  <p className="product-category">{product.category}</p>
                  <h2>{product.name}</h2>
                  <p className="product-price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  <p
                    className={
                      product.stock > 0
                        ? "product-stock"
                        : "product-stock out-of-stock"
                    }
                  >
                    {product.stock > 0
                      ? `${product.stock} units left`
                      : "Out of stock"}
                  </p>
                  <div className="wishlist-card-actions">
                    <button
                      type="button"
                      className="product-details-button"
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      className="wishlist-remove-button"
                      disabled={removingId === product._id}
                      onClick={() => handleRemove(product._id)}
                    >
                      {removingId === product._id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

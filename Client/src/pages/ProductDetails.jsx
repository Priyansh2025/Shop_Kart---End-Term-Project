import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import WishlistButton from "../components/WishlistButton";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Failed to load product:", error);
        setError(
          error.response?.data?.message ||
            "Something went wrong while loading the product.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="products-state full-page-state">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="products-state full-page-state products-error-state">
        <h2>Product not found</h2>
        <p>{error || "The requested product could not be found."}</p>
        <button className="back-products-button" onClick={() => navigate("/products")}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <nav className="products-navbar">
        <button className="products-logo" onClick={() => navigate("/home")}>
          ShopKart
        </button>

        <div className="products-nav-actions">
          <button onClick={() => navigate("/home")}>Home</button>
          <button onClick={() => navigate("/products")}>
            Products
          </button>
          <button onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button onClick={() => navigate("/cart")}>Cart ({totalItems})</button>
        </div>
      </nav>

      <main className="product-details-main">
        <button
          className="back-products-button"
          onClick={() => navigate("/products")}
        >
          ← Back to Products
        </button>

        <section className="product-details-card">
          <div className="product-details-image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-details-image"
            />
          </div>

          <div className="product-details-content">
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-details-price">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>

            <p className="product-description">{product.description}</p>

            <div className="product-details-info">
              <div>
                <span>Category</span>
                <strong>{product.category}</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>
                  {product.stock > 0
                    ? `${product.stock} units available`
                    : "Out of stock"}
                </strong>
              </div>
            </div>

            <button
              className="add-cart-button"
              disabled={product.stock === 0 || addingToCart}
              onClick={async () => {
                setAddingToCart(true); setCartMessage("");
                try { await addToCart(product._id); setCartMessage("Product added to your cart."); }
                catch (requestError) { setCartMessage(requestError.response?.status === 401 ? "Please log in to use your cart." : requestError.response?.data?.message || "Could not add product to cart."); }
                finally { setAddingToCart(false); }
              }}
            >
              {addingToCart ? "Adding..." : product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
            {cartMessage && <p className="cart-action-message" role="status">{cartMessage}</p>}
            <WishlistButton productId={product._id} className="wishlist-detail-button" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetails;

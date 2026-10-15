import { useNavigate } from "react-router-dom";
import WishlistButton from "./WishlistButton";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = async () => {
    setAdding(true); setCartMessage("");
    try { await addToCart(product._id); setCartMessage("Added to cart"); }
    catch (error) { setCartMessage(error.response?.status === 401 ? "Please log in first" : error.response?.data?.message || "Could not add to cart"); }
    finally { setAdding(false); }
  };

  return (
    <article className="product-card">
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
        <p className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</p>

        <p className={product.stock > 0 ? "product-stock" : "product-stock out-of-stock"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        <div className="product-card-actions">
          <button
            className="product-details-button"
            onClick={() => navigate(`/products/${product._id}`)}
          >
            View Details
          </button>
          <button className="add-cart-button card-add-cart" disabled={adding || product.stock < 1} onClick={handleAddToCart}>
            {adding ? "Adding..." : product.stock < 1 ? "Out of Stock" : "Add to Cart"}
          </button>
          <WishlistButton productId={product._id} />
          {cartMessage && <p className="cart-action-message" role="status">{cartMessage}</p>}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

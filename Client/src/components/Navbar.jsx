import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { clearCartView, totalItems } = useCart();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      clearCartView();
      navigate("/login");
    } catch (error) {
      console.log("Logout failed");
    }
  };

  return (
    <nav>
      <h2>ShopKart</h2>

      <div>
        <button onClick={() => navigate("/home")}>Home</button>
        <button onClick={() => navigate("/products")}>Products</button>
        <button onClick={() => navigate("/wishlist")}>Wishlist</button>
        <button onClick={() => navigate("/cart")}>Cart ({totalItems})</button>
        <button onClick={() => navigate("/orders")}>My Orders</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;

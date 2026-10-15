import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Home = () => {
  const navigate = useNavigate();
  const { totalItems, clearCartView } = useCart();

  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (error) {
        setError("You are not logged in");
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      clearCartView();
      navigate("/login");
    } catch (error) {
      console.log("Logout failed");
    }
  };

  if (error) {
    return (
      <div className="home-error">
        <h2>{error}</h2>
        <button className="primary-button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="home-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-navbar">
        <h2 className="home-logo">ShopKart</h2>

        <div className="home-nav-actions">
          <button
            className="home-nav-button active"
            onClick={() => navigate("/home")}
          >
            Home
          </button>

          <button
            className="home-nav-button"
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button
            className="home-nav-button"
            onClick={() => navigate("/wishlist")}
          >
            Wishlist
          </button>

          <button
            className="home-nav-button"
            onClick={() => navigate("/orders")}
          >
            My Orders
          </button>

          <button className="home-nav-button logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-main">
        <section className="welcome-section">
          <div>
            <p className="welcome-label">SHOPKART ACCOUNT</p>

            <h1>Welcome, {customer.fullName}</h1>

            <p className="welcome-text">
              Your account is ready. Here's your customer information.
            </p>
          </div>
        </section>

        {/* Customer Information */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-icon">
                {customer.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{customer.fullName}</h2>
                <p>Customer Account</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-detail">
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>

              <div className="profile-detail">
                <span>Phone Number</span>
                <strong>{customer.phone}</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

const Login = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        await api.post("/customers/register", {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        });

        setSuccess("Account created successfully! Please log in.");

        setFormData({
          fullName: "",
          email: "",
          password: "",
          phone: "",
        });

        setIsRegister(false);
      } else {
        await api.post("/customers/login", {
          email: formData.email,
          password: formData.password,
        });

        await refreshCart();
        navigate("/home");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isRegister
            ? "Registration failed. Please try again."
            : "Invalid credentials."),
      );
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-content">
          <h1>ShopKart</h1>
          <p>
            Everything you need,
            <br />
            all in one place.
          </p>
          <span>Simple. Fast. Secure.</span>
        </div>

        <div className="decor-circle circle-one"></div>
        <div className="decor-circle circle-two"></div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>

          <p className="auth-description">
            {isRegister
              ? "Register to get started with ShopKart."
              : "Login to continue to your ShopKart account."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder={
                  isRegister
                    ? "Password (minimum 6 characters)"
                    : "Enter your password"
                }
                value={formData.password}
                onChange={handleChange}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 6 : undefined}
                required
              />
            </div>

            <button className="primary-button" type="submit">
              {isRegister ? "Create Account" : "Login"}
            </button>
          </form>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="success-message" role="status">
              {success}
            </p>
          )}

          <p className="auth-toggle">
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}

            <button type="button" onClick={toggleMode}>
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

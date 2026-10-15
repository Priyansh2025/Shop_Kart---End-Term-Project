import { useState } from "react";
import api from "../services/api";

const WishlistButton = ({ productId, className = "" }) => {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (status === "saving" || status === "added") return;

    setStatus("saving");
    setMessage("");

    try {
      await api.post(`/wishlist/${productId}`);
      setStatus("added");
    } catch (error) {
      if (error.response?.status === 409) {
        // The API confirms this product was already saved earlier.
        setStatus("added");
        setMessage("Already in your wishlist.");
      } else if (error.response?.status === 401) {
        setStatus("idle");
        setMessage("Please log in to use your wishlist.");
      } else {
        setStatus("idle");
        setMessage(
          error.response?.data?.message || "Could not add this product. Please try again.",
        );
      }
    }
  };

  return (
    <div className="wishlist-button-container">
      <button
        type="button"
        className={`wishlist-button ${className}`.trim()}
        onClick={handleAdd}
        disabled={status === "saving" || status === "added"}
      >
        {status === "saving"
          ? "Saving..."
          : status === "added"
            ? "Added"
            : "Add to Wishlist"}
      </button>
      {message && (
        <p
          className={message.startsWith("Already") ? "wishlist-inline-note" : "wishlist-inline-error"}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default WishlistButton;

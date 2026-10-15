import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) {
          params.search = search.trim();
        }

        if (category) {
          params.category = category;
        }

        const response = await api.get("/products", { params });
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setError("Something went wrong while loading products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category]);

  return (
    <div className="products-page">
      <nav className="products-navbar">
        <button className="products-logo" onClick={() => navigate("/home")}>
          ShopKart
        </button>

        <div className="products-nav-actions">
          <button onClick={() => navigate("/home")}>Home</button>
          <button className="products-nav-active">Products</button>
          <button onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button onClick={() => navigate("/orders")}>My Orders</button>
          <button onClick={() => navigate("/cart")}>Cart ({totalItems})</button>
        </div>
      </nav>

      <main className="products-main">
        <section className="products-header">
          <div>
            <p className="products-eyebrow">SHOPKART CATALOG</p>
            <h1>Discover Products</h1>
            <p>Find something you love from our product catalogue.</p>
          </div>
        </section>

        <section className="product-filters">
          <div className="search-wrapper">
            <label htmlFor="product-search">Search products</label>
            <input
              id="product-search"
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-wrapper">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
          </div>
        </section>

        {loading && (
          <div className="products-state">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-state products-error-state">
            <h2>Something went wrong</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="products-state">
            <h2>No products found.</h2>
            <p>Try changing your search or category.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <section className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Products;

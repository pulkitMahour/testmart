import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { notify } = useToast();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    client
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (notFound || !product) {
    return (
      <div className="page">
        <p className="empty" data-testid="empty">
          Product not found.
        </p>
        <Link to="/" className="back-link">
          ← Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.countInStock <= 0;
  const handleAdd = () => {
    addToCart(product, qty);
    notify(`Added ${qty} × "${product.name}" to cart`);
  };

  return (
    <div className="page product-detail" data-testid="product-detail" data-product-id={product._id}>
      <Link to="/" className="back-link">
        ← Back to products
      </Link>
      <div className="product-detail-grid">
        <div className="product-detail-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <span className="product-card-category">{product.category}</span>
          <h1 data-testid="product-title">{product.name}</h1>
          <div className="rating" data-testid="product-rating">
            ★ {product.rating.toFixed(1)} ({product.numReviews} reviews)
          </div>
          <p className="price-lg" data-testid="product-price">
            ${product.price.toFixed(2)}
          </p>
          <p className="product-description" data-testid="product-description">
            {product.description}
          </p>
          <p className="stock" data-testid="product-stock">
            {outOfStock ? 'Out of stock' : `In stock: ${product.countInStock}`}
          </p>
          {!outOfStock && (
            <div className="add-row">
              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  max={product.countInStock}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Math.min(product.countInStock, Number(e.target.value) || 1)))
                  }
                  data-testid="product-qty"
                />
              </label>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                data-testid="product-add-to-cart"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

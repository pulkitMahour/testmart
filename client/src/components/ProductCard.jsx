import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { notify } = useToast();
  const outOfStock = product.countInStock <= 0;

  const handleAdd = () => {
    addToCart(product, 1);
    notify(`Added "${product.name}" to cart`);
  };

  return (
    <article className="product-card" data-testid="product-card" data-product-id={product._id}>
      <Link
        to={`/product/${product._id}`}
        className="product-card-media"
        data-testid="product-card-link"
      >
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link
          to={`/product/${product._id}`}
          className="product-card-title"
          data-testid="product-card-title"
        >
          {product.name}
        </Link>
        <div className="product-card-meta">
          <span className="rating" data-testid="product-card-rating">
            ★ {product.rating.toFixed(1)}
          </span>
          <span className="product-card-price" data-testid="product-card-price">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {outOfStock ? (
          <span className="badge badge-oos" data-testid="product-card-oos">
            Out of stock
          </span>
        ) : (
          <button className="btn btn-primary" onClick={handleAdd} data-testid="add-to-cart">
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}

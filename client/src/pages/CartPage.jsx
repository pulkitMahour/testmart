import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, updateQty, removeFromCart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p className="empty" data-testid="cart-empty">
          Your cart is empty. <Link to="/">Browse products</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items" data-testid="cart-items">
          {items.map((item) => (
            <div
              className="cart-item"
              key={item.product}
              data-testid="cart-item"
              data-product-id={item.product}
            >
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <Link
                  to={`/product/${item.product}`}
                  className="cart-item-name"
                  data-testid="cart-item-name"
                >
                  {item.name}
                </Link>
                <span className="cart-item-price" data-testid="cart-item-price">
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateQty(item.product, Number(e.target.value) || 1)}
                className="qty-input"
                data-testid="cart-item-qty"
                aria-label={`Quantity for ${item.name}`}
              />
              <span className="cart-item-subtotal" data-testid="cart-item-subtotal">
                ${(item.price * item.qty).toFixed(2)}
              </span>
              <button
                className="btn btn-ghost"
                onClick={() => removeFromCart(item.product)}
                data-testid="cart-item-remove"
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={clearCart} data-testid="cart-clear">
            Clear cart
          </button>
        </div>
        <aside className="cart-summary" data-testid="cart-summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
          </div>
          <p className="muted">Tax &amp; shipping calculated at checkout.</p>
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
            data-testid="cart-checkout"
          >
            Proceed to checkout
          </button>
        </aside>
      </div>
    </div>
  );
}

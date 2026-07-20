import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const TAX_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 10;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p className="empty" data-testid="cart-empty">
          Your cart is empty. <Link to="/">Browse products</Link>
        </p>
      </div>
    );
  }

  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);
    try {
      const { data } = await client.post('/orders', {
        items: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: form,
        paymentMethod: 'Mock',
      });
      clearCart();
      notify('Order placed successfully');
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <h1>Checkout</h1>
      <form className="checkout-layout" onSubmit={placeOrder} data-testid="checkout-form">
        <div className="checkout-form">
          <h2>Shipping address</h2>
          {error && (
            <div className="alert alert-error" data-testid="checkout-error" role="alert">
              {error}
            </div>
          )}
          <label>
            Full name
            <input value={form.fullName} onChange={setField('fullName')} required data-testid="checkout-fullName" />
          </label>
          <label>
            Street
            <input value={form.street} onChange={setField('street')} required data-testid="checkout-street" />
          </label>
          <label>
            City
            <input value={form.city} onChange={setField('city')} required data-testid="checkout-city" />
          </label>
          <label>
            Postal code
            <input value={form.postalCode} onChange={setField('postalCode')} required data-testid="checkout-postalCode" />
          </label>
          <label>
            Country
            <input value={form.country} onChange={setField('country')} required data-testid="checkout-country" />
          </label>
          <h2>Payment</h2>
          <p className="muted" data-testid="payment-note">
            Mock payment — no card required. Your order is marked paid instantly.
          </p>
        </div>

        <aside className="cart-summary" data-testid="checkout-summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Items ({items.length})</span>
            <span data-testid="summary-items">${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span data-testid="summary-tax">${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span data-testid="summary-shipping">${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span data-testid="summary-total">${total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={placing}
            data-testid="checkout-place-order"
          >
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </aside>
      </form>
    </div>
  );
}

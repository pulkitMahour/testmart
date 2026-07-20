import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((err) => setError(err.response?.data?.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !order) {
    return (
      <div className="page">
        <p className="empty" data-testid="empty">
          {error || 'Order not found.'}
        </p>
        <Link to="/orders" className="back-link">
          ← My orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page" data-testid="order-detail" data-order-id={order._id}>
      <Link to="/orders" className="back-link">
        ← My orders
      </Link>
      <h1>Order {order._id.slice(-8)}</h1>
      <div className="order-meta">
        <span className={`status status-${order.status}`} data-testid="order-status">
          {order.status}
        </span>
        <span className="badge" data-testid="order-paid">
          {order.isPaid ? 'Paid' : 'Unpaid'}
        </span>
        <span className="muted">{new Date(order.createdAt).toLocaleString()}</span>
      </div>

      <div className="order-grid">
        <div>
          <h2>Items</h2>
          <div className="order-items" data-testid="order-items">
            {order.orderItems.map((it) => (
              <div className="order-item" key={it.product} data-testid="order-item">
                <img src={it.image} alt={it.name} />
                <span className="grow">{it.name}</span>
                <span>
                  {it.qty} × ${it.price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <h2>Shipping</h2>
          <address data-testid="order-shipping">
            {order.shippingAddress?.fullName}
            <br />
            {order.shippingAddress?.street}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            <br />
            {order.shippingAddress?.country}
          </address>
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>${order.itemsPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${order.taxPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${order.shippingPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span data-testid="order-total">${order.totalPrice.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

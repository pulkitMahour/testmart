import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Spinner from '../components/Spinner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/orders/mine')
      .then(({ data }) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p className="empty" data-testid="orders-empty">
          You have no orders yet. <Link to="/">Start shopping</Link>
        </p>
      ) : (
        <table className="table" data-testid="orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} data-testid="order-row" data-order-id={o._id}>
                <td className="mono">{o._id.slice(-8)}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.orderItems.reduce((s, i) => s + i.qty, 0)}</td>
                <td data-testid="order-total">${o.totalPrice.toFixed(2)}</td>
                <td>
                  <span className={`status status-${o.status}`} data-testid="order-status">
                    {o.status}
                  </span>
                </td>
                <td>
                  <Link to={`/orders/${o._id}`} className="btn btn-ghost" data-testid="order-view">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import client from '../../api/client';
import AdminNav from '../../components/AdminNav';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    client
      .get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (id, status) => {
    try {
      await client.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      notify(`Order marked ${status}`);
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <h1>All Orders</h1>
      <AdminNav />
      {orders.length === 0 ? (
        <p className="empty" data-testid="empty">
          No orders yet.
        </p>
      ) : (
        <table className="table" data-testid="admin-orders-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} data-testid="admin-order-row" data-order-id={o._id}>
                <td className="mono">{o._id.slice(-8)}</td>
                <td>
                  {o.user?.name || '—'}
                  <br />
                  <span className="muted">{o.user?.email}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>${o.totalPrice.toFixed(2)}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                    data-testid="admin-order-status"
                    className={`status-select status-${o.status}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

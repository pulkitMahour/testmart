import { useEffect, useState } from 'react';
import client from '../../api/client';
import AdminNav from '../../components/AdminNav';
import Spinner from '../../components/Spinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get('/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <AdminNav />
      {loading || !stats ? (
        <Spinner />
      ) : (
        <div className="stat-grid">
          <div className="stat-card" data-testid="admin-stat-users">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">Users</span>
          </div>
          <div className="stat-card" data-testid="admin-stat-products">
            <span className="stat-value">{stats.products}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-card" data-testid="admin-stat-orders">
            <span className="stat-value">{stats.orders}</span>
            <span className="stat-label">Orders</span>
          </div>
          <div className="stat-card" data-testid="admin-stat-revenue">
            <span className="stat-value">${stats.revenue.toFixed(2)}</span>
            <span className="stat-label">Revenue</span>
          </div>
        </div>
      )}
    </div>
  );
}

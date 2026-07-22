import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import AdminNav from '../../components/AdminNav';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    client
      .get('/products', { params: { limit: 50 } })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/admin/products/${id}`);
      notify('Product deleted');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="page">
      <h1>Manage Products</h1>
      <AdminNav />
      <div className="toolbar-right">
        <Link to="/admin/products/new" className="btn btn-primary" data-testid="admin-product-create">
          + New product
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <table className="table" data-testid="admin-products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} data-testid="admin-product-row" data-product-id={p._id}>
                <td>
                  {p.name}
                  {p.isSeed && (
                    <>
                      {' '}
                      <span className="badge muted" data-testid="admin-product-seed-tag">
                        default
                      </span>
                    </>
                  )}
                </td>
                <td>{p.category}</td>
                <td>${p.price.toFixed(2)}</td>
                <td className={p.countInStock === 0 ? 'danger' : ''}>{p.countInStock}</td>
                <td className="actions">
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="btn btn-ghost"
                    data-testid="admin-product-edit"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-danger"
                    disabled={p.isSeed}
                    onClick={() => remove(p._id, p.name)}
                    data-testid="admin-product-delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import client from '../../api/client';
import AdminNav from '../../components/AdminNav';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: me } = useAuth();
  const { notify } = useToast();

  const load = () => {
    setLoading(true);
    client
      .get('/admin/users')
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await client.delete(`/admin/users/${id}`);
      notify('User deleted');
      load();
    } catch (err) {
      notify(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <h1>Users</h1>
      <AdminNav />
      <table className="table" data-testid="admin-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} data-testid="admin-user-row" data-user-id={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className={`badge role-${u.role}`}>{u.role}</span>
              </td>
              <td>
                <button
                  className="btn btn-danger"
                  disabled={u.id === me?.id}
                  onClick={() => remove(u.id, u.name)}
                  data-testid="admin-user-delete"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

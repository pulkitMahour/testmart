import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { notify } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name: form.name,
      address: {
        street: form.street,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
      },
    };
    if (form.password) payload.password = form.password;
    try {
      const { data } = await client.put('/users/me', payload);
      setUser(data);
      setForm((f) => ({ ...f, password: '' }));
      notify('Profile updated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      setError(msg);
      notify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-card wide" onSubmit={save} data-testid="profile-form">
        <h1>My Profile</h1>
        {error && (
          <div className="alert alert-error" data-testid="profile-error" role="alert">
            {error}
          </div>
        )}
        <label>
          Email
          <input value={user?.email || ''} disabled data-testid="profile-email" />
        </label>
        <label>
          Name
          <input value={form.name} onChange={setField('name')} required data-testid="profile-name" />
        </label>
        <fieldset>
          <legend>Address</legend>
          <label>
            Street
            <input value={form.street} onChange={setField('street')} data-testid="profile-street" />
          </label>
          <label>
            City
            <input value={form.city} onChange={setField('city')} data-testid="profile-city" />
          </label>
          <label>
            Postal code
            <input value={form.postalCode} onChange={setField('postalCode')} data-testid="profile-postalCode" />
          </label>
          <label>
            Country
            <input value={form.country} onChange={setField('country')} data-testid="profile-country" />
          </label>
        </fieldset>
        <label>
          New password (leave blank to keep current)
          <input
            type="password"
            value={form.password}
            onChange={setField('password')}
            data-testid="profile-password"
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving} data-testid="profile-save">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(form);
      notify(`Welcome, ${user.name}!`);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={onSubmit} data-testid="register-form">
        <h1>Create Account</h1>
        {error && (
          <div className="alert alert-error" data-testid="register-error" role="alert">
            {error}
          </div>
        )}
        <label>
          Name
          <input
            value={form.name}
            onChange={setField('name')}
            required
            minLength={2}
            data-testid="register-name"
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={setField('email')}
            required
            data-testid="register-email"
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={setField('password')}
            required
            minLength={6}
            data-testid="register-password"
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
          data-testid="register-submit"
        >
          {submitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="auth-alt">
          Already have an account?{' '}
          <Link to="/login" data-testid="register-to-login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

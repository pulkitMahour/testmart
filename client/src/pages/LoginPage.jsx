import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      notify(`Welcome back, ${user.name}`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={onSubmit} data-testid="login-form">
        <h1>Login</h1>
        {error && (
          <div className="alert alert-error" data-testid="login-error" role="alert">
            {error}
          </div>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            data-testid="login-email"
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            data-testid="login-password"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={submitting}
          data-testid="login-submit"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-alt">
          No account?{' '}
          <Link to="/register" data-testid="login-to-register">
            Create one
          </Link>
        </p>
        <div className="demo-hint" data-testid="demo-hint">
          <strong>Demo accounts</strong>
          <div>admin@demo.com / admin123</div>
          <div>user@demo.com / user123</div>
        </div>
      </form>
    </div>
  );
}

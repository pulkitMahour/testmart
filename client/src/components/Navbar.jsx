import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { notify } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    notify('Logged out');
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" data-testid="nav-brand">
          🧪 TestMart
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end data-testid="nav-home">
            Home
          </NavLink>
          <Link to="/cart" className="cart-link" data-testid="nav-cart">
            Cart
            {itemCount > 0 && (
              <span className="cart-badge" data-testid="nav-cart-count">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <NavLink to="/orders" data-testid="nav-orders">
                Orders
              </NavLink>
              <NavLink to="/profile" data-testid="nav-profile">
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" data-testid="nav-admin">
                  Admin
                </NavLink>
              )}
              <span className="nav-user" data-testid="nav-username">
                {user.name}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout} data-testid="nav-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" data-testid="nav-login">
                Login
              </NavLink>
              <NavLink to="/register" data-testid="nav-register">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

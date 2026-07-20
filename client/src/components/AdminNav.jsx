import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="admin-nav" data-testid="admin-nav">
      <NavLink to="/admin" end data-testid="admin-nav-dashboard">
        Dashboard
      </NavLink>
      <NavLink to="/admin/products" data-testid="admin-nav-products">
        Products
      </NavLink>
      <NavLink to="/admin/orders" data-testid="admin-nav-orders">
        Orders
      </NavLink>
      <NavLink to="/admin/users" data-testid="admin-nav-users">
        Users
      </NavLink>
    </nav>
  );
}

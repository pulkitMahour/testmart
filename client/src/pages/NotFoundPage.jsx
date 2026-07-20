import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page center" data-testid="not-found">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}

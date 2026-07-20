export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner" data-testid="loading" role="status" aria-live="polite">
      <span className="spinner-dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

import { useEffect, useState } from 'react';

// Phase 0 shell: proves the client renders and can reach the API through the Vite proxy.
// This gets replaced by the router + pages in Phase 6.
export default function App() {
  const [health, setHealth] = useState('checking…');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setHealth(d.status))
      .catch(() => setHealth('unreachable'));
  }, []);

  return (
    <main className="shell">
      <h1>🧪 TestMart</h1>
      <p>E-commerce demo app — scaffolding is up.</p>
      <p data-testid="api-health">
        API health: <strong>{health}</strong>
      </p>
    </main>
  );
}

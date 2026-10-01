import { useEffect, useState } from 'react';
import api from './services/api';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">CHATAPP</h1>
        {!health && !error && <p className="text-slate-400">Checking server...</p>}
        {error && <p className="text-red-400">Cannot reach API: {error}</p>}
        {health && (
          <ul className="space-y-1 text-sm">
            <li>API status: <span className="font-mono text-emerald-400">{health.status}</span></li>
            <li>Database: <span className="font-mono text-emerald-400">{health.database}</span></li>
            <li>Uptime: <span className="font-mono">{health.uptime}s</span></li>
          </ul>
        )}
      </div>
    </main>
  );
}
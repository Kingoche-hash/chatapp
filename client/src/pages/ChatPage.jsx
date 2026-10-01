import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-lg text-center">
        <h1 className="text-2xl font-bold">CHATAPP</h1>
        <p className="mt-4">
          Logged in as <span className="font-semibold text-emerald-400">{user.username}</span>
        </p>
        <p className="text-sm text-slate-400">{user.email}</p>
        <p className="text-sm text-slate-500 mt-4">The chat itself arrives in the next phases.</p>
        <button
          onClick={logout}
          className="mt-6 rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 sm:p-8 shadow-lg">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-400 text-sm mt-1 mb-6">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
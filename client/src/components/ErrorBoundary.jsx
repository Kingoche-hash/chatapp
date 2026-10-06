import { Component } from 'react';

// A safety net: if something crashes while drawing the page, show a friendly message
// instead of a blank screen.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('The app crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4 text-slate-100">
        <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 text-center shadow-lg">
          <p className="text-4xl" aria-hidden="true">😕</p>
          <h1 className="mt-3 text-xl font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-400">
            The page ran into a problem. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500"
          >
            Reload the page
          </button>
        </div>
      </main>
    );
  }
}
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { login } from '../api/authApi';
import StatusMessage from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function Login() {
  const { isAuthenticated, setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setSession(response);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel lg:grid-cols-[1fr_1.05fr]">
        <div className="bg-slate-950 px-8 py-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">AI Knowledge Base</p>
          <h1 className="mt-4 text-3xl font-semibold">Sign in to your assistant workspace</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Search your saved documents, ask grounded questions, and keep the full conversation history in one focused dashboard.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-300">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">JWT-secured personal document access</div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">Keyword retrieval with visible context chunks</div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">Gemini answers constrained to your saved content</div>
          </div>
        </div>

        <form className="px-8 py-10" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Use the account created with your ASP.NET Core API.</p>

          <div className="mt-8 space-y-5">
            {error ? <StatusMessage message={error} tone="error" /> : null}

            <label className="block">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="field-label">Password</span>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                required
              />
            </label>

            <button className="btn-primary w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}
            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

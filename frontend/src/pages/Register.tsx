import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { register } from '../api/authApi';
import StatusMessage from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { isAuthenticated, setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({ email, password });
      setSession(response);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white px-8 py-10 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Create workspace</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Start your knowledge base</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Register an account, save documents, and ask grounded questions from your own content.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label className="block">
            <span className="field-label">Confirm password</span>
            <input
              className="field-input"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your password"
              required
            />
          </label>

          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

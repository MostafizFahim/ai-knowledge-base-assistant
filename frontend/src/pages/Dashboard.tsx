import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { getChatHistory } from '../api/chatApi';
import { getDocuments } from '../api/documentApi';
import type { ChatMessage, DocumentListItem } from '../api/types';
import StatusMessage from '../components/StatusMessage';
import { formatDate, pluralize } from '../utils/format';

export default function Dashboard() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const [documentData, historyData] = await Promise.all([getDocuments(), getChatHistory()]);
        setDocuments(documentData);
        setHistory(historyData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalChunks = useMemo(() => documents.reduce((sum, document) => sum + document.chunkCount, 0), [documents]);
  const recentQuestions = history.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="muted mt-2">Monitor your saved knowledge and recent assistant activity.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-secondary" to="/documents/new">
            Add document
          </Link>
          <Link className="btn-primary" to="/chat">
            Ask assistant
          </Link>
        </div>
      </div>

      {error ? <StatusMessage message={error} tone="error" /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Documents" value={isLoading ? '...' : documents.length.toString()} helper="Saved in your library" />
        <StatCard label="Chunks" value={isLoading ? '...' : totalChunks.toString()} helper="Available for retrieval" />
        <StatCard label="Questions" value={isLoading ? '...' : history.length.toString()} helper="Stored in chat history" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Recent documents</h3>
              <p className="muted mt-1">Newest saved sources for retrieval.</p>
            </div>
            <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800" to="/documents">
              View all
            </Link>
          </div>

          {isLoading ? (
            <p className="muted">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="muted">No documents saved yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {documents.slice(0, 5).map((document) => (
                <div className="flex items-center justify-between gap-4 py-4" key={document.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">{document.title}</p>
                    <p className="muted mt-1">
                      {pluralize(document.chunkCount, 'chunk')} · {formatDate(document.createdAtUtc)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">Recent questions</h3>
            <p className="muted mt-1">Latest assistant conversations.</p>
          </div>

          {isLoading ? (
            <p className="muted">Loading history...</p>
          ) : recentQuestions.length === 0 ? (
            <p className="muted">No questions asked yet.</p>
          ) : (
            <div className="space-y-4">
              {recentQuestions.map((message) => (
                <div className="rounded-md border border-slate-200 p-4" key={message.id}>
                  <p className="text-sm font-medium text-slate-950">{message.question}</p>
                  <p className="muted mt-2 line-clamp-2">{message.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="muted mt-2">{helper}</p>
    </div>
  );
}

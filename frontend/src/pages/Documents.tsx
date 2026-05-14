import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { deleteDocument, getDocuments } from '../api/documentApi';
import type { DocumentListItem } from '../api/types';
import EmptyState from '../components/EmptyState';
import StatusMessage from '../components/StatusMessage';
import { formatDate, pluralize } from '../utils/format';

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    setIsLoading(true);
    setError('');

    try {
      setDocuments(await getDocuments());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this document and its chunks?');
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError('');
    setSuccess('');

    try {
      await deleteDocument(id);
      setDocuments((current) => current.filter((document) => document.id !== id));
      setSuccess('Document deleted.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="page-title">Documents</h2>
          <p className="muted mt-2">Manage the saved sources your assistant can use as context.</p>
        </div>
        <Link className="btn-primary" to="/documents/new">
          Add document
        </Link>
      </div>

      {error ? <StatusMessage message={error} tone="error" /> : null}
      {success ? <StatusMessage message={success} tone="success" /> : null}

      {isLoading ? (
        <div className="panel p-6">
          <p className="muted">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Add your first document to make the assistant useful."
          action={
            <Link className="btn-primary" to="/documents/new">
              Add document
            </Link>
          }
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Chunks</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="max-w-lg px-5 py-4">
                      <p className="truncate font-medium text-slate-950">{document.title}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{pluralize(document.chunkCount, 'chunk')}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(document.createdAtUtc)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        className="btn-danger"
                        type="button"
                        onClick={() => handleDelete(document.id)}
                        disabled={deletingId === document.id}
                      >
                        {deletingId === document.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

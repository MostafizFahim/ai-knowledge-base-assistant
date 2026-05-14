import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { createDocument } from '../api/documentApi';
import StatusMessage from '../components/StatusMessage';

export default function AddDocument() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await createDocument({ title, content });
      navigate('/documents');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="page-title">Add document</h2>
          <p className="muted mt-2">Paste clean text content. The API will split it into retrieval chunks.</p>
        </div>
        <Link className="btn-secondary" to="/documents">
          Back to documents
        </Link>
      </div>

      <form className="panel space-y-6 p-6" onSubmit={handleSubmit}>
        {error ? <StatusMessage message={error} tone="error" /> : null}

        <label className="block">
          <span className="field-label">Document title</span>
          <input
            className="field-input"
            type="text"
            maxLength={200}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Employee handbook"
            required
          />
        </label>

        <label className="block">
          <span className="field-label">Text content</span>
          <textarea
            className="field-input min-h-[360px] resize-y leading-6"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Paste the source document text here..."
            required
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="muted">{content.trim().split(/\s+/).filter(Boolean).length} words ready for chunking</p>
          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save document'}
          </button>
        </div>
      </form>
    </div>
  );
}

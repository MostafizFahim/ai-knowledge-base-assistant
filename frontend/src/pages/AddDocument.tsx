import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { createDocument, uploadDocument } from '../api/documentApi';
import StatusMessage from '../components/StatusMessage';

type InputMode = 'text' | 'file';

export default function AddDocument() {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (inputMode === 'file') {
        if (!file) {
          setError('Please choose a PDF or CSV file.');
          return;
        }

        await uploadDocument(title, file);
      } else {
        await createDocument({ title, content });
      }

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
          <p className="muted mt-2">Paste text or upload a PDF/CSV. The API will split readable content into retrieval chunks.</p>
        </div>
        <Link className="btn-secondary" to="/documents">
          Back to documents
        </Link>
      </div>

      <form className="panel space-y-6 p-6" onSubmit={handleSubmit}>
        {error ? <StatusMessage message={error} tone="error" /> : null}

        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2">
          <button
            className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
              inputMode === 'text' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-white'
            }`}
            type="button"
            onClick={() => setInputMode('text')}
          >
            Paste text
          </button>
          <button
            className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
              inputMode === 'file' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-white'
            }`}
            type="button"
            onClick={() => setInputMode('file')}
          >
            Upload PDF/CSV
          </button>
        </div>

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

        {inputMode === 'text' ? (
          <label className="block">
            <span className="field-label">Text content</span>
            <textarea
              className="field-input min-h-[360px] resize-y leading-6"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Paste the source document text here..."
              required={inputMode === 'text'}
            />
          </label>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <label className="block">
              <span className="field-label">PDF or CSV file</span>
              <input
                className="mt-3 block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-700 file:mr-4 file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
                type="file"
                accept=".pdf,.csv,application/pdf,text/csv"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required={inputMode === 'file'}
              />
            </label>
            <p className="muted mt-3">Supported formats: PDF and CSV. Maximum size: 10 MB.</p>
            {file ? (
              <p className="mt-3 text-sm font-medium text-slate-700">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="muted">
            {inputMode === 'text'
              ? `${content.trim().split(/\s+/).filter(Boolean).length} words ready for chunking`
              : file
                ? `${file.name} ready to upload`
                : 'Choose a PDF or CSV to extract text'}
          </p>
          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : inputMode === 'file' ? 'Upload document' : 'Save document'}
          </button>
        </div>
      </form>
    </div>
  );
}

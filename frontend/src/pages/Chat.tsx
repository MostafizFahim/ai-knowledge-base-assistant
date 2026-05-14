import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { askQuestion } from '../api/chatApi';
import type { AskQuestionResponse } from '../api/types';
import StatusMessage from '../components/StatusMessage';

export default function Chat() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskQuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResponse(null);
    setIsLoading(true);

    try {
      setResponse(await askQuestion({ question }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const contextChunks = response?.contextUsed ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="page-title">Chat</h2>
          <p className="muted mt-2">Ask a question and review the retrieved chunks used as context.</p>
        </div>
        <Link className="btn-secondary" to="/history">
          View history
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form className="panel p-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="field-label">Question</span>
            <textarea
              className="field-input min-h-40 resize-y leading-6"
              maxLength={1000}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: What is the refund window in my policy?"
              required
            />
          </label>

          {error ? <div className="mt-5"><StatusMessage message={error} tone="error" /></div> : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="muted">{question.length}/1000 characters</p>
            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Ask assistant'}
            </button>
          </div>
        </form>

        <div className="panel min-h-[320px] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Answer</h3>
              <p className="muted mt-1">Generated from the top matching document chunks.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="muted">Retrieving context and calling Gemini...</p>
          ) : response ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800">
              {response.answer}
            </div>
          ) : (
            <p className="muted">Your answer will appear here.</p>
          )}
        </div>
      </section>

      {response ? (
        <section className="panel p-6">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-950">Retrieved context</h3>
            <p className="muted mt-1">
              {contextChunks.length > 0
                ? `${contextChunks.length} chunk${contextChunks.length === 1 ? '' : 's'} returned by the backend.`
                : 'No matching chunks were returned by the backend.'}
            </p>
          </div>

          {contextChunks.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {contextChunks.map((chunk) => (
                <article className="rounded-md border border-slate-200 p-4" key={`${chunk.documentId}-${chunk.chunkIndex}`}>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Score {chunk.score}
                    </span>
                    <span className="rounded bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">
                      Chunk {chunk.chunkIndex}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-950">{chunk.documentTitle}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{chunk.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted">Try adding more documents or using keywords from the saved text.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}

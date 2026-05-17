import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { askQuestion } from '../api/chatApi';
import type { AskQuestionResponse } from '../api/types';
import StatusMessage from '../components/StatusMessage';

export default function Chat() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AskQuestionResponse | null>(null);
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setResponse(null);
    setIsAnswerExpanded(false);
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
  const isLongAnswer = response ? response.answer.length > 900 || response.answer.split('\n').length > 12 : false;

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

      <section className="grid items-start gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <form className="panel self-start p-6" onSubmit={handleSubmit}>
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

        <div className="panel self-start p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Answer</h3>
              <p className="muted mt-1">Generated from the top matching document chunks.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="muted">Retrieving context and calling Gemini...</p>
          ) : response ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 bg-white px-5 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">Generated analysis</span>
                  <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {contextChunks.length} context chunk{contextChunks.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className={`${isLongAnswer && !isAnswerExpanded ? 'max-h-[360px] overflow-hidden' : ''} p-5`}>
                  <FormattedAnswer answer={response.answer} />
                </div>

                {isLongAnswer && !isAnswerExpanded ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
                ) : null}
              </div>

              {isLongAnswer ? (
                <div className="border-t border-slate-200 bg-white px-5 py-3">
                  <button
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    type="button"
                    onClick={() => setIsAnswerExpanded((current) => !current)}
                  >
                    {isAnswerExpanded ? 'Show less' : 'Show full answer'}
                  </button>
                </div>
              ) : null}
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
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{chunk.content}</p>
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

function FormattedAnswer({ answer }: { answer: string }) {
  const lines = answer.split(/\r?\n/);

  return (
    <div className="space-y-3 text-sm leading-7 text-slate-800">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div className="h-1" key={index} />;
        }

        const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
        if (heading) {
          return (
            <h4 className="pt-2 text-base font-semibold text-slate-950" key={index}>
              {renderInlineMarkdown(heading[1])}
            </h4>
          );
        }

        const bullet = line.match(/^(\s*)[-*]\s+(.+)$/);
        if (bullet) {
          const depth = Math.min(Math.floor(bullet[1].length / 2), 3);

          return (
            <div className="flex gap-3" key={index} style={{ marginLeft: depth * 18 }}>
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <p>{renderInlineMarkdown(bullet[2])}</p>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong className="font-semibold text-slate-950" key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

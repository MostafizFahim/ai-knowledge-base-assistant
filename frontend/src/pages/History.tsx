import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../api/apiClient';
import { getChatHistory } from '../api/chatApi';
import type { ChatMessage } from '../api/types';
import EmptyState from '../components/EmptyState';
import StatusMessage from '../components/StatusMessage';
import { formatDate } from '../utils/format';

export default function History() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setError('');

      try {
        setMessages(await getChatHistory());
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="page-title">Chat history</h2>
          <p className="muted mt-2">Review previously asked questions and saved answers.</p>
        </div>
        <Link className="btn-primary" to="/chat">
          Ask new question
        </Link>
      </div>

      {error ? <StatusMessage message={error} tone="error" /> : null}

      {isLoading ? (
        <div className="panel p-6">
          <p className="muted">Loading chat history...</p>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState
          title="No chat history yet"
          description="Ask the assistant a question after adding documents."
          action={
            <Link className="btn-primary" to="/chat">
              Ask assistant
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <article className="panel p-6" key={message.id}>
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <h3 className="text-base font-semibold text-slate-950">{message.question}</h3>
                <span className="shrink-0 text-sm text-slate-500">{formatDate(message.createdAtUtc)}</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{message.answer}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

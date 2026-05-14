type StatusMessageProps = {
  message: string;
  tone?: 'error' | 'success' | 'info';
};

const toneClasses = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700'
};

export default function StatusMessage({ message, tone = 'info' }: StatusMessageProps) {
  return <div className={`rounded-md border px-4 py-3 text-sm ${toneClasses[tone]}`}>{message}</div>;
}

import { AlertTriangle } from 'lucide-react';
export default function ErrorState({ message = 'Unable to load this section.', onRetry }) {
  return <div className="state-card error-state"><div className="state-mark"><AlertTriangle size={22} /></div><h3>Something needs attention</h3><p>{message}</p>{onRetry && <button className="button secondary" onClick={onRetry}>Retry</button>}</div>;
}

import { FileQuestion } from 'lucide-react';
export default function EmptyState({ title, description, action }) {
  return <div className="state-card empty-state"><div className="state-mark"><FileQuestion size={22} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

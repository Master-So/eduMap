export default function LoadingState({ label = 'Loading...' }) {
  return <div className="state-card" aria-live="polite"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>;
}

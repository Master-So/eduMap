export default function StatCard({ label, value, detail, icon: Icon }) {
  return <article className="stat-card"><div className="stat-label">{Icon && <Icon size={16} />}<span>{label}</span></div><strong>{value ?? '—'}</strong>{detail && <p>{detail}</p>}</article>;
}

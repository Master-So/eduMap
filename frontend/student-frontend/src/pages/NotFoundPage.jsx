import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="not-found" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
      <h1 style={{ font: "400 4.5rem/1 'DM Serif Display', Georgia, serif", color: 'var(--ink)' }}>
        404
      </h1>
      <p style={{ color: 'var(--moss)', margin: '1rem 0 2rem' }}>
        The student page or assessment you requested does not exist.
      </p>
      <Link to="/analytics" className="button primary">
        <ArrowLeft size={16} /> Return to Analytics
      </Link>
    </div>
  );
}

import React from 'react';

export function LoadingState({ label = 'Loading information...' }) {
  return (
    <div className="panel state-card">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'An error occurred.', onRetry }) {
  return (
    <div className="panel state-card error-state">
      <span className="state-mark">!</span>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="button secondary small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

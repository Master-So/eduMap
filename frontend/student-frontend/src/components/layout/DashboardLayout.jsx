import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="dashboard-main">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
      {open && (
        <button
          className="mobile-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}

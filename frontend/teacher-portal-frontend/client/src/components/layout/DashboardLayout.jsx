import { useLocation } from 'wouter';
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import OverviewPage from '../../pages/OverviewPage.jsx';
export default function DashboardLayout({ children }) { const [open, setOpen] = useState(false); const [location] = useLocation(); const content = children || (location === '/dashboard' ? <OverviewPage /> : <OverviewPage />); return <div className="dashboard-shell"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="dashboard-main"><Topbar onMenu={() => setOpen(true)} /><main className="dashboard-content">{content}</main></div>{open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}</div>; }

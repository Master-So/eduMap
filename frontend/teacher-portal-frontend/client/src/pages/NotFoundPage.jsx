import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
export default function NotFoundPage() { return <div className="not-found"><span className="eyebrow">404 / Page not found</span><h1>This page took a wrong turn.</h1><p>The workspace you’re looking for doesn’t exist or has moved.</p><Link href="/" className="button primary"><ArrowLeft size={16} /> Return home</Link></div>; }

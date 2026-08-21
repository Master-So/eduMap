import { Redirect } from 'wouter';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingState from '../common/LoadingState.jsx';
export function ProtectedRoute({ children }) { const { initializing, isAuthenticated } = useAuth(); if (initializing) return <LoadingState label="Checking your session..." />; return isAuthenticated ? children : <Redirect to="/login" />; }

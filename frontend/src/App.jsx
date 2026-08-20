import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Quiz from './Quiz';

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protect the main route */}
        <Route path="/" element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
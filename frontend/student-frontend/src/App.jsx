import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Global Components
import DashboardLayout from './components/layout/DashboardLayout';
import StudentChatbot from './components/StudentChatbot';

// Pages
import GatewayPage from './pages/GatewayPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentAnalyticsPage from './pages/StudentAnalyticsPage';
import QuizPage from './pages/QuizPage';
import TestResultAnalyticsPage from './pages/TestResultAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Unified Ecosystem Gateway for Judges & Portals */}
        <Route path="/gateway" element={<GatewayPage />} />
        <Route path="/portal-select" element={<GatewayPage />} />

        {/* Landing Page with Hero & Navigation */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Flow Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Primary Student Analytics Workspace */}
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <StudentAnalyticsPage />
            </DashboardLayout>
          }
        />

        {/* Live Quiz Arena */}
        <Route
          path="/test/:testId"
          element={
            <DashboardLayout>
              <QuizPage />
            </DashboardLayout>
          }
        />

        {/* Dedicated Post-Submission Test Analytics */}
        <Route
          path="/test/:testId/analytics"
          element={
            <DashboardLayout>
              <TestResultAnalyticsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/test/:testId/results"
          element={
            <DashboardLayout>
              <TestResultAnalyticsPage />
            </DashboardLayout>
          }
        />

        {/* 404 Fallback */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* 24/7 Interactive Gemini AI Study Assistant Chatbot */}
      <StudentChatbot />
    </Router>
  );
}


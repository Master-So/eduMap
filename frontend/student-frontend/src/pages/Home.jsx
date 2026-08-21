import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  BarChart2, 
  Radio, 
  Search, 
  CheckCircle2, 
  GraduationCap,
  KeyRound,
  Layers,
  Award
} from 'lucide-react';
import { getStudentUser, getAuthToken } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const [testInputId, setTestInputId] = useState('');
  const user = getStudentUser();
  const token = getAuthToken();

  const handleJoinTest = (e) => {
    e.preventDefault();
    if (testInputId.trim()) {
      navigate(`/test/${testInputId.trim()}`);
    }
  };

  const sampleTests = [
    {
      id: 'stem-ai-101',
      title: 'Neural Networks & Deep Learning Essentials',
      subject: 'Artificial Intelligence',
      grade: 'Grade 10-12',
      questionsCount: 5,
    },
    {
      id: 'math-calc-202',
      title: 'Multivariate Calculus & Gradient Optimization',
      subject: 'Mathematics',
      grade: 'Advanced STEM',
      questionsCount: 5,
    },
    {
      id: 'algo-ds-303',
      title: 'Time Complexity & Distributed Web Protocols',
      subject: 'Computer Science',
      grade: 'Engineering Core',
      questionsCount: 5,
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto relative z-10 space-y-10 animate-fadeIn">
      {/* Hero Banner Card */}
      <div className="glass-card p-8 sm:p-12 relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
              <Sparkles className="w-3.5 h-3.5" /> Welcome to EduMap AI Student Portal
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Master Topics With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Live AI Assessments
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400">
              Join real-time test rooms, answer interactive MCQs with instant feedback, and explore actionable AI insights tailored to your learning trajectory.
            </p>

            {user && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Logged in as <strong className="text-white">{user.name}</strong> ({user.email})</span>
              </div>
            )}
          </div>

          {/* Quick Test ID Join Form */}
          <div className="w-full sm:w-80 glass-card p-6 border-slate-700/60 shadow-glow-blue/50">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Join Test Room</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the Test ID provided by your teacher.
            </p>

            <form onSubmit={handleJoinTest} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={testInputId}
                  onChange={(e) => setTestInputId(e.target.value)}
                  placeholder="e.g. stem-ai-101"
                  required
                  className="glass-input text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="glass-button-primary w-full py-2.5 text-xs font-bold"
              >
                <span>Launch Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Interactive Test Arenas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Active Assessment Modules</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Live Socket Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleTests.map((test) => (
            <div
              key={test.id}
              className="glass-card-hover p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {test.subject}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {test.grade}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-100 group-hover:text-blue-300 transition-colors">
                  {test.title}
                </h3>

                <p className="text-xs text-slate-400 font-mono">
                  Test ID: <span className="text-slate-300 font-semibold">{test.id}</span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/test/${test.id}`}
                  className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                >
                  <span>Start Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to={`/analytics/${test.id}`}
                  className="text-xs font-medium text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

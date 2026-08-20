import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function Quiz() {
  // App State
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentView, setCurrentView] = useState('login'); 
  const [studentName, setStudentName] = useState('');
  
  // AI & Quiz State
  const [isLoading, setIsLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (studentName.trim() === '') return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: "Computer Science",
          board: "12th", 
          topics: ["Docker", "Networking", "Web Development"]
        })
      });

      const data = await response.json();

      if (data.test && data.test.questions) {
        setQuizQuestions(data.test.questions);
        socket.emit('student_joined', { name: studentName });
        setCurrentView('quiz');
      } else {
        alert("Oops! The AI didn't return any questions.");
      }
    } catch (error) {
      console.error("Error fetching AI questions:", error);
      alert("Failed to connect to the AI backend.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const currentQuestion = quizQuestions[currentQuestionIndex];

    const answerData = {
      studentName: studentName,
      questionId: currentQuestion._id || currentQuestion.id || `q${currentQuestionIndex}`,
      answer: selectedAnswer,
      timestamp: new Date().toISOString()
    };

    socket.emit('student_answer', answerData);
    
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); 
    } else {
      setCurrentView('done');
    }
  };

  // --- UI SCREENS ---

  const renderLogin = () => (
    <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-slate-700">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Join the Live Session</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Enter your name..." 
          onChange={(e) => setStudentName(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 bg-slate-900 border-2 border-slate-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          required
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md disabled:bg-blue-800"
        >
          {isLoading ? (
            <span className="animate-pulse">🤖 AI is generating test...</span>
          ) : (
            'Enter Session'
          )}
        </button>
      </form>
    </div>
  );

  const renderQuiz = () => {
    const question = quizQuestions[currentQuestionIndex];
    const questionText = question.questionText || question.question || question.text || "Missing question text";
    const options = question.options || [];

    return (
      <div className="w-full max-w-5xl bg-slate-800/60 backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-slate-700">
        <div className="flex justify-between text-sm font-bold text-gray-400 mb-6">
          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
          <span className="text-blue-400">{studentName}</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-8 leading-relaxed">
          {questionText}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 
                ${selectedAnswer === option ? 'border-blue-500 bg-blue-900/50 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-600 text-gray-300 hover:border-blue-400 hover:bg-slate-700'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer}
          className={`w-full mt-10 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-md
            ${!selectedAnswer ? 'bg-slate-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg active:scale-95'}
          `}
        >
          {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    );
  };

  const renderDone = () => (
    <div className="w-full max-w-3xl bg-slate-800/60 backdrop-blur-md p-12 rounded-2xl shadow-2xl border border-slate-700 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h2 className="text-4xl font-bold text-white mb-4">You're All Done!</h2>
      <p className="text-gray-400 text-lg">Waiting for the teacher to end the session...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-transparent flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute top-0 w-full max-w-7xl flex justify-between items-center p-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">EduMap<span className="text-blue-500">.</span></h1>
        <span className={`text-sm px-4 py-1.5 rounded-full text-white font-semibold shadow-md ${isConnected ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-rose-500/80 backdrop-blur-sm'}`}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      {currentView === 'login' && renderLogin()}
      {currentView === 'quiz' && renderQuiz()}
      {currentView === 'done' && renderDone()}
    </div>
  );
}

export default Quiz;
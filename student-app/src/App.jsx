import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
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
      // 🚀 Requesting live questions from your teammate's AI backend
      const response = await fetch('http://localhost:5000/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: "Computer Science",
          board: "12th", // ✅ Fixed to match your teammate's strict database schema
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

    // Blast answer to backend
    socket.emit('student_answer', answerData);
    
    // Move to next question or finish
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); 
    } else {
      setCurrentView('done');
    }
  };

  // --- UI SCREENS ---

  const renderLogin = () => (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join the Quiz</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Enter your name..." 
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          required
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md disabled:bg-blue-400"
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
    // Safely grab the text depending on how the AI named it
    const questionText = question.questionText || question.question || question.text || "Missing question text";
    const options = question.options || [];

    return (
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-4">
          <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
          <span>{studentName}</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-relaxed">
          {questionText}
        </h2>
        <div className="space-y-3">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 
                ${selectedAnswer === option ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-300'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer}
          className={`w-full mt-8 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-md
            ${!selectedAnswer ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'}
          `}
        >
          {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    );
  };

  const renderDone = () => (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Done!</h2>
      <p className="text-gray-500">Waiting for the teacher to end the session...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute top-0 w-full max-w-md flex justify-between items-center p-6">
        <h1 className="text-xl font-extrabold tracking-tight text-gray-800">EduMap<span className="text-blue-600">.</span></h1>
        <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold shadow-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>

      {currentView === 'login' && renderLogin()}
      {currentView === 'quiz' && renderQuiz()}
      {currentView === 'done' && renderDone()}
    </div>
  );
}

export default App;
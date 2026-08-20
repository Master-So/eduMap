import { useState } from 'react';
import { mockQuizData } from '../mockQuizData';

export default function StudentQuiz() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const handleSelect = (option) => {
    setSelectedOption(option);
    if (!option.isCorrect) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  };

  const currentQuestion = mockQuizData.questions[0];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">{mockQuizData.title}</h1>
      <h2 className="text-lg mb-6">{currentQuestion.questionText}</h2>

      <div className="space-y-4">
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className={`w-full p-4 text-left border rounded-lg transition-colors ${
              selectedOption?.id === option.id 
                ? (option.isCorrect ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500')
                : 'hover:bg-gray-50 border-gray-200'
            }`}
          >
            {option.text}
          </button>
        ))}
      </div>

      {showHint && selectedOption && !selectedOption.isCorrect && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <p className="text-sm font-semibold text-yellow-800">Hint (Diagnostic):</p>
          <p className="text-sm text-yellow-900 mt-1">{selectedOption.hintRegional}</p>
        </div>
      )}
    </div>
  );
}
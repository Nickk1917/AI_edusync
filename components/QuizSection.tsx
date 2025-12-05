
import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizResult } from '../types';

interface QuizSectionProps {
  quiz: QuizQuestion[];
  onGenerate: () => void;
  isGenerating: boolean;
  onComplete: (result: QuizResult) => void; // New callback
}

export const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onGenerate, isGenerating, onComplete }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Effect to trigger completion saving
  useEffect(() => {
    if (isCompleted) {
        const score = calculateScore();
        const percentage = Math.round((score / quiz.length) * 100);
        
        onComplete({
            score,
            total: quiz.length,
            completed: true,
            answers,
            percentage,
            timestamp: Date.now()
        });
    }
  }, [isCompleted]);

  if (isGenerating) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Designing a quiz based on your notes...</p>
        </div>
    );
  }

  if (quiz.length === 0) {
    return (
        <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">✅</div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">No quiz generated yet</h3>
            <button 
                onClick={onGenerate}
                className="px-8 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold shadow-lg shadow-brand-500/30 transition-all transform hover:-translate-y-1"
            >
                Generate Quiz
            </button>
        </div>
    );
  }

  const handleOptionSelect = (optionIdx: number) => {
    if (showExplanation) return; // Prevent changing after submit
    setSelectedOption(optionIdx);
  };

  const checkAnswer = () => {
    setShowExplanation(true);
    setAnswers(prev => ({ ...prev, [quiz[currentQuestionIdx].id]: selectedOption! }));
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < quiz.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  if (isCompleted) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);
    
    let rank = '';
    let suggestion = '';
    let rankColor = '';

    if (percentage >= 90) {
      rank = 'Grandmaster 🏆';
      suggestion = "Outstanding! You've mastered this topic perfectly. You're ready to teach it!";
      rankColor = 'text-yellow-500';
    } else if (percentage >= 80) {
      rank = 'Expert 🧠';
      suggestion = "Great job! You have a solid grasp of the material. Just a few minor details to polish.";
      rankColor = 'text-purple-500';
    } else if (percentage >= 60) {
      rank = 'Apprentice 📚';
      suggestion = "Good effort. You understand the basics, but review the explanations for the questions you missed to strengthen your knowledge.";
      rankColor = 'text-blue-500';
    } else {
      rank = 'Novice 🌱';
      suggestion = "Keep going! It seems this topic is a bit tricky. We recommend reviewing the 'AI Notes' and trying the flashcards again before retrying the quiz.";
      rankColor = 'text-gray-500';
    }
    
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center animate-fade-in">
        <div className="mb-6">
          <span className="text-6xl">🏆</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Completed!</h2>
        
        <div className="flex justify-center my-8">
            <div className="relative w-48 h-48 flex flex-col items-center justify-center rounded-full border-8 border-brand-100 dark:border-gray-700 bg-brand-50 dark:bg-gray-700/30">
                <span className={`text-xl font-bold mb-1 ${rankColor}`}>{rank}</span>
                <span className="block text-5xl font-bold text-brand-600 dark:text-brand-400">{percentage}%</span>
                <span className="text-sm text-gray-500 mt-2">{score} / {quiz.length} Correct</span>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-700">
            <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-2">Feedback</h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {suggestion}
            </p>
        </div>

        <button 
          onClick={() => {
            setIsCompleted(false);
            setCurrentQuestionIdx(0);
            setSelectedOption(null);
            setShowExplanation(false);
            setAnswers({});
          }}
          className="px-8 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold transition-colors shadow-lg shadow-brand-500/30"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  const currentQ = quiz[currentQuestionIdx];

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Question {currentQuestionIdx + 1} of {quiz.length}</h2>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">Single Choice</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8">
        <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${((currentQuestionIdx) / quiz.length) * 100}%` }}
        ></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
            {currentQ.question}
        </h3>

        <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
                let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ";
                
                if (showExplanation) {
                    if (idx === currentQ.correctAnswerIndex) {
                        btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-sm";
                    } else if (idx === selectedOption) {
                        btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-sm";
                    } else {
                        btnClass += "border-gray-200 dark:border-gray-700 opacity-50";
                    }
                } else {
                    if (selectedOption === idx) {
                        btnClass += "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm";
                    } else {
                        btnClass += "border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300";
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showExplanation}
                        className={btnClass}
                    >
                        <span>{option}</span>
                        {showExplanation && idx === currentQ.correctAnswerIndex && <span>✅</span>}
                        {showExplanation && idx === selectedOption && idx !== currentQ.correctAnswerIndex && <span>❌</span>}
                    </button>
                );
            })}
        </div>
      </div>

      {showExplanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6 border border-blue-100 dark:border-blue-800 animate-fade-in">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Explanation</h4>
            <p className="text-blue-700 dark:text-blue-200">{currentQ.explanation}</p>
        </div>
      )}

      <div className="flex justify-end pb-8">
        {!showExplanation ? (
             <button 
                onClick={checkAnswer}
                disabled={selectedOption === null}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-all
                    ${selectedOption === null 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'}`}
            >
                Check Answer
            </button>
        ) : (
            <button 
                onClick={nextQuestion}
                className="px-8 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
                {currentQuestionIdx === quiz.length - 1 ? 'Finish Quiz' : 'Next Question ➡️'}
            </button>
        )}
      </div>
    </div>
  );
};

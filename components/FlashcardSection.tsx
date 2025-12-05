import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';

interface FlashcardSectionProps {
  flashcards: Flashcard[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export const FlashcardSection: React.FC<FlashcardSectionProps> = ({ flashcards, onGenerate, isGenerating }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  
  // Animation state to control the visibility during transitions
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setCards(flashcards);
  }, [flashcards]);

  // Handles the fade-out -> update -> fade-in transition sequence
  const animateTransition = (callback: () => void) => {
    setIsVisible(false);
    setTimeout(() => {
      callback();
      // Small delay to ensure state update has processed before fading back in
      setTimeout(() => setIsVisible(true), 50);
    }, 300);
  };

  const handleNext = () => {
    if (!isVisible) return;
    
    animateTransition(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    });
  };

  const handlePrev = () => {
    if (!isVisible) return;
    
    animateTransition(() => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    });
  };

  const markCard = (status: 'known' | 'review') => {
    if (!isVisible) return;
    const newCards = [...cards];
    newCards[currentIndex].status = status;
    setCards(newCards);
    handleNext(); // Auto advance to next card
  };

  const shuffleDeck = () => {
    if (!isVisible) return;
    animateTransition(() => {
        setIsFlipped(false);
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
    });
  };

  if (isGenerating) {
    return (
        <div className="flex flex-col items-center justify-center h-96 animate-pulse">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600 mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Generating flashcards...</p>
        </div>
    );
  }

  if (cards.length === 0) {
    return (
        <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-6">🗂️</div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">No flashcards yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">Generate flashcards from your notes to start studying efficiently.</p>
            <button 
                onClick={onGenerate}
                className="px-8 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 font-bold shadow-lg hover:shadow-brand-500/30 transition-all transform hover:-translate-y-1"
            >
                Generate Flashcards
            </button>
        </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center h-full">
      <div className="w-full flex justify-between items-center mb-8 px-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          Flashcards 
          <span className="text-base font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {currentIndex + 1} / {cards.length}
          </span>
        </h2>
        <button 
            onClick={shuffleDeck}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Shuffle Deck"
        >
            <svg className="w-5 h-5 group-hover:text-brand-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Shuffle</span>
        </button>
      </div>

      {/* Card Container with Fade/Scale Transition */}
      <div 
        className={`relative w-full max-w-2xl aspect-[3/2] cursor-pointer group perspective-1000 transition-all duration-300 ease-in-out transform
          ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        `}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-xl hover:shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8 md:p-12 backface-hidden">
                <span className="absolute top-6 left-6 text-xs font-bold tracking-wider text-gray-400 uppercase">Question</span>
                <div className="flex-1 flex items-center justify-center w-full overflow-y-auto">
                    <p className="text-2xl md:text-3xl font-medium text-center text-gray-800 dark:text-gray-100 leading-relaxed">
                        {currentCard.front}
                    </p>
                </div>
                <div className="absolute bottom-6 text-sm text-gray-400 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Click to flip</span>
                </div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full bg-gradient-to-br from-brand-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-brand-100 dark:border-brand-900/50 flex flex-col items-center justify-center p-8 md:p-12 backface-hidden rotate-y-180">
                <span className="absolute top-6 left-6 text-xs font-bold tracking-wider text-brand-500 uppercase">Answer</span>
                <div className="flex-1 flex items-center justify-center w-full overflow-y-auto">
                    <p className="text-xl md:text-2xl text-center text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                        {currentCard.back}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-10 w-full max-w-2xl justify-between items-center px-4 md:px-0">
        <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-110 active:scale-95"
            title="Previous Card"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>

        <div className="flex gap-4">
            <button 
                onClick={(e) => { e.stopPropagation(); markCard('review'); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-bold transition-all hover:-translate-y-1 shadow-sm hover:shadow-orange-100 dark:hover:shadow-none"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Review Later</span>
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); markCard('known'); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 font-bold transition-all hover:-translate-y-1 shadow-md hover:shadow-lg shadow-green-500/30"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>I Know This</span>
            </button>
        </div>

        <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all hover:scale-110 active:scale-95"
            title="Next Card"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="mt-8 flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span>Known: {cards.filter(c => c.status === 'known').length}</span>
        </div>
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
            <span>Review: {cards.filter(c => c.status === 'review').length}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <span>New: {cards.filter(c => c.status === 'new').length}</span>
        </div>
      </div>
    </div>
  );
};
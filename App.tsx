
import React, { useState, useEffect } from 'react';
import { AppView, StudySet, FileUpload, QuizResult } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardSection } from './components/DashboardSection';
import { UploadSection } from './components/UploadSection';
import { NotesSection } from './components/NotesSection';
import { FlashcardSection } from './components/FlashcardSection';
import { QuizSection } from './components/QuizSection';
import { generateNotes, generateFlashcards, generateQuiz } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME); // Default to HOME
  const [studySet, setStudySet] = useState<StudySet>({
    id: 'default',
    title: 'Untitled Set',
    originalContent: '',
    notesMarkdown: '',
    flashcards: [],
    quiz: [],
    isGenerating: false,
  });
  
  // History of taken quizzes for dashboard stats
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleProcessMaterial = async (text: string, file: FileUpload | undefined) => {
    setStudySet(prev => ({ ...prev, isGenerating: true }));
    
    // For file based inputs, we prefer the file data for generation
    const mimeType = file?.type || '';
    const fileData = file ? { data: file.data, mimeType } : undefined;
    const title = file?.name || "Text Notes " + new Date().toLocaleDateString();

    try {
      // 1. Generate Notes First
      const notes = await generateNotes(text, fileData);
      
      setStudySet(prev => ({
        ...prev,
        title: title,
        originalContent: text || (file ? `File: ${file.name}` : ''),
        notesMarkdown: notes,
        isGenerating: false,
        fileName: file?.name,
      }));
      
      setCurrentView(AppView.NOTES);
    } catch (error) {
      alert("Failed to process content. Please ensure your API key is valid and try again.");
      setStudySet(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!studySet.notesMarkdown) return;
    
    setStudySet(prev => ({ ...prev, isGenerating: true }));
    try {
        const cards = await generateFlashcards(studySet.notesMarkdown);
        setStudySet(prev => ({ ...prev, flashcards: cards, isGenerating: false }));
    } catch (e) {
        alert("Could not generate flashcards. Please try again.");
        setStudySet(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleGenerateQuiz = async () => {
    if (!studySet.notesMarkdown) return;

    setStudySet(prev => ({ ...prev, isGenerating: true }));
    try {
        const quiz = await generateQuiz(studySet.notesMarkdown);
        setStudySet(prev => ({ ...prev, quiz: quiz, isGenerating: false }));
    } catch (e) {
        alert("Could not generate quiz. Please try again.");
        setStudySet(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleQuizComplete = (result: QuizResult) => {
    // Add topic name to result before saving
    const resultWithTopic = { 
        ...result, 
        topic: studySet.fileName || studySet.title || 'General Knowledge' 
    };
    
    setQuizHistory(prev => [...prev, resultWithTopic]);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return (
            <DashboardSection 
                history={quizHistory} 
                onNavigate={setCurrentView} 
                userName="Student"
            />
        );
      case AppView.UPLOAD:
        return <UploadSection onProcess={handleProcessMaterial} isProcessing={studySet.isGenerating && !studySet.notesMarkdown} />;
      case AppView.NOTES:
        return <NotesSection notes={studySet.notesMarkdown} onRegenerate={() => handleProcessMaterial(studySet.originalContent, undefined)} isRegenerating={studySet.isGenerating} />;
      case AppView.FLASHCARDS:
        return <FlashcardSection flashcards={studySet.flashcards} onGenerate={handleGenerateFlashcards} isGenerating={studySet.isGenerating} />;
      case AppView.QUIZ:
        return (
            <QuizSection 
                quiz={studySet.quiz} 
                onGenerate={handleGenerateQuiz} 
                isGenerating={studySet.isGenerating}
                onComplete={handleQuizComplete} 
            />
        );
      default:
        return <div>Select an option</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        hasNotes={!!studySet.notesMarkdown} 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="flex-1 overflow-y-auto relative">
        <header className="px-8 py-6 sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 md:hidden flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
             <h1 className="text-xl font-bold">AI Study Assistant</h1>
             <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '☀️' : '🌙'}</button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

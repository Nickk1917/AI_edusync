import React from 'react';

interface NotesSectionProps {
  notes: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, onRegenerate, isRegenerating }) => {
  
  // Simple markdown-to-html-like rendering for key elements
  const renderContent = (content: string) => {
    // Basic replacements for bolding, headers, lists
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4 text-brand-900 dark:text-brand-100 pb-2 border-b border-gray-200 dark:border-gray-700">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3 text-brand-800 dark:text-brand-200">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">{line.replace('### ', '')}</h3>;
      }
      if (line.trim().startsWith('- ')) {
        const text = line.trim().substring(2);
        const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-brand-700 dark:text-brand-300">$1</strong>');
        return (
          <div key={idx} className="flex gap-2 ml-4 mb-2">
            <span className="text-brand-500 mt-1.5">•</span>
            <p className="leading-relaxed text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: boldedText }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      
      // Paragraphs with bolding
      const paragraphText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>');
      return <p key={idx} className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: paragraphText }} />;
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 py-4 z-10 no-print">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Notes</h2>
        <div className="flex gap-2">
            <button 
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
                {isRegenerating ? 'Refreshing...' : 'Regenerate ↻'}
            </button>
            <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 min-h-[500px] border border-gray-200 dark:border-gray-700 print-content">
        <article className="prose dark:prose-invert max-w-none">
            {renderContent(notes)}
        </article>
      </div>
    </div>
  );
};
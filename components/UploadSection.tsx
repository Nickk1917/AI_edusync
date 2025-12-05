import React, { useState, useCallback } from 'react';
import { FileUpload } from '../types';

interface UploadSectionProps {
  onProcess: (text: string, file: FileUpload | undefined) => void;
  isProcessing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onProcess, isProcessing }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<FileUpload | undefined>(undefined);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (fileObj: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string).split(',')[1];
      setFile({
        name: fileObj.name,
        type: fileObj.type,
        data: base64String,
      });
    };
    reader.readAsDataURL(fileObj);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSubmit = () => {
    if (!text && !file) return;
    onProcess(text, file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Your Study Material</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Upload a PDF or image, or paste your notes. We'll generate a study guide, flashcards, and a quiz.
        </p>
      </div>

      <div className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 
            ${dragActive 
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-brand-400 dark:hover:border-brand-500 bg-white dark:bg-gray-800'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf, .png, .jpg, .jpeg"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
              {file ? '📄' : '☁️'}
            </div>
            {file ? (
              <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(undefined); }}
                  className="text-sm text-red-500 hover:text-red-600 mt-2 font-medium"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium text-gray-900 dark:text-white">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
                <label 
                  htmlFor="file-upload" 
                  className="mt-4 inline-block px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500">or paste text</span>
          </div>
        </div>

        {/* Text Input */}
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Paste Notes / Topic
          </label>
          <textarea
            id="text-input"
            rows={6}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:text-white p-4"
            placeholder="Paste your lecture notes, article text, or specific topics you want to study..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={isProcessing || (!text && !file)}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all duration-200
            ${isProcessing || (!text && !file)
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transform hover:-translate-y-0.5'}
          `}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Study Materials...
            </span>
          ) : (
            'Generate Study Materials ✨'
          )}
        </button>
      </div>
    </div>
  );
};


export enum AppView {
  HOME = 'HOME',
  UPLOAD = 'UPLOAD',
  NOTES = 'NOTES',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  status: 'new' | 'known' | 'review';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  completed: boolean;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  timestamp?: number;
  topic?: string;
  percentage?: number;
}

export interface StudySet {
  id: string;
  title: string;
  originalContent: string; // The raw text extracted or provided
  notesMarkdown: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  isGenerating: boolean;
  fileName?: string;
  fileType?: string;
}

export interface FileUpload {
  name: string;
  type: string;
  data: string; // base64
}

export interface Question {
  id: string;
  section: 'Maroc & Institutions' | 'Économie & Finance' | 'Histoire & Géographie' | 'Arts, Lettres & Sciences' | 'Mémorisation';
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  subtopic?: string; // Specific themes: Sports, Music, Politics, Geography, Economy, Cinema, etc.
}

export interface SrsItem {
  questionId: string;
  box: number; // Box 1 to 5
  nextReviewDate: string; // ISO String
  lastReviewedDate?: string;
  intervalDays: number;
}

export interface UserStats {
  score: number;
  streak: number;
  xp: number;
  lives: number; // Duolingo style 5 lives
  lastActiveDate?: string;
  completedQuestionsCount: number;
  correctAnswersCount: number;
}

export type MascotExpression = 'neutral' | 'happy' | 'sad' | 'thinking' | 'cheering';

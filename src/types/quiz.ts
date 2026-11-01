export type QuestionType = 'single' | 'boolean' | 'multiple' | 'sequence';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'all';

export type GameMode = 'classic' | 'speedrun' | 'suddendeath' | 'practice';

export interface BaseQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: QuestionType;
  prompt: string;
  explanation: string;
  hint?: string;
  timeLimit?: number; // optional override per question (default e.g. 15s)
  isAiGenerated?: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  correctIndex: number;
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  options: ['True', 'False'];
  correctIndex: 0 | 1;
}

export interface MultipleSelectQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  correctIndices: number[]; // All must be selected
}

export interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  items: string[]; // Starting shuffled items
  correctOrder: string[]; // Correct chronological/logical sequence
}

export type Question = SingleChoiceQuestion | BooleanQuestion | MultipleSelectQuestion | SequenceQuestion;

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  questionCount: number;
}

export interface UserAnswerRecord {
  questionId: string;
  question: Question;
  userSelection: any; // index, array of indices, array of strings for sequence
  isCorrect: boolean;
  timeSpent: number; // in seconds
  scoreEarned: number;
  streakAtAnswer: number;
}

export interface QuizSessionResult {
  categoryId: string;
  categoryName: string;
  gameMode: GameMode;
  totalQuestions: number;
  correctCount: number;
  score: number;
  highestStreak: number;
  averageTimeSeconds: number;
  records: UserAnswerRecord[];
  completedAt: string;
}

export interface PlayerStats {
  totalQuizzesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  highestStreakEver: number;
  highestScoreEver: number;
  totalTimeSpentSeconds: number;
  achievements: string[];
  history: QuizSessionResult[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; max: number };
}

export interface CustomQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  questions: Question[];
  createdAt: string;
}

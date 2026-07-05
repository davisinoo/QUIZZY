import { Question, SrsItem, UserStats } from '../types';

// Default SRS boxes intervals in days
// Box 1: 1 day, Box 2: 2 days, Box 3: 4 days, Box 4: 7 days, Box 5: 14 days
const SRS_INTERVALS = [1, 2, 4, 7, 14];

export const loadSrsItems = (): SrsItem[] => {
  const data = localStorage.getItem('tafem_srs_items');
  return data ? JSON.parse(data) : [];
};

export const saveSrsItems = (items: SrsItem[]) => {
  localStorage.setItem('tafem_srs_items', JSON.stringify(items));
};

export const loadUserStats = (): UserStats => {
  const data = localStorage.getItem('tafem_user_stats');
  if (data) {
    return JSON.parse(data);
  }
  return {
    score: 100, // Start with a nice base score
    streak: 0,
    xp: 0,
    lives: 5,
    completedQuestionsCount: 0,
    correctAnswersCount: 0,
  };
};

export const saveUserStats = (stats: UserStats) => {
  localStorage.setItem('tafem_user_stats', JSON.stringify(stats));
};

/**
 * Update SRS parameters for a question based on user response
 */
export const recordQuestionResponse = (
  questionId: string,
  isCorrect: boolean
): SrsItem => {
  const items = loadSrsItems();
  const existingIndex = items.findIndex((item) => item.questionId === questionId);
  
  let item: SrsItem;
  const now = new Date();

  if (existingIndex > -1) {
    const existing = items[existingIndex];
    if (isCorrect) {
      // Promote to next box, cap at Box 5 (index 4)
      const nextBox = Math.min(existing.box + 1, 5);
      const interval = SRS_INTERVALS[nextBox - 1];
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + interval);

      item = {
        questionId,
        box: nextBox,
        nextReviewDate: nextDate.toISOString(),
        lastReviewedDate: now.toISOString(),
        intervalDays: interval,
      };
    } else {
      // Demote back to Box 1
      const interval = SRS_INTERVALS[0]; // 1 day
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + interval);

      item = {
        questionId,
        box: 1,
        nextReviewDate: nextDate.toISOString(),
        lastReviewedDate: now.toISOString(),
        intervalDays: interval,
      };
    }
    items[existingIndex] = item;
  } else {
    // First time answering this question
    const box = isCorrect ? 2 : 1;
    const interval = SRS_INTERVALS[box - 1];
    const nextDate = new Date();
    nextDate.setDate(now.getDate() + interval);

    item = {
      questionId,
      box,
      nextReviewDate: nextDate.toISOString(),
      lastReviewedDate: now.toISOString(),
      intervalDays: interval,
    };
    items.push(item);
  }

  saveSrsItems(items);
  return item;
};

/**
 * Filter questions that are due for SRS review
 */
export const getDueQuestions = (allQuestions: Question[]): Question[] => {
  const srsItems = loadSrsItems();
  const now = new Date();

  return allQuestions.filter((q) => {
    const srsItem = srsItems.find((item) => item.questionId === q.id);
    if (!srsItem) return true; // Questions never answered are always due!
    
    const reviewDate = new Date(srsItem.nextReviewDate);
    return reviewDate <= now;
  });
};

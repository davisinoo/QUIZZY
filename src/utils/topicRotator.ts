import { Question } from '../types';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Organizes and interleaves questions such that we rotate between topics/subtopics.
 * This guarantees that consecutive questions rotate between themes (e.g. Sports, Music,
 * Politics, Economy, History) and never group more than 4 of the same topic together.
 */
export function interleaveQuestionsByTopic(questions: Question[]): Question[] {
  if (questions.length <= 1) return questions;

  // 1. Shuffle first to ensure random draw of items
  const shuffled = shuffleArray(questions);

  // 2. Group by subtopic (or section if subtopic is not defined)
  const groups: { [key: string]: Question[] } = {};
  shuffled.forEach((q) => {
    const topic = q.subtopic || q.section || 'General';
    if (!groups[topic]) {
      groups[topic] = [];
    }
    groups[topic].push(q);
  });

  // Get the lists for each group
  const groupLists = Object.values(groups);

  // 3. Interleave in a round-robin format
  const result: Question[] = [];
  let added = true;
  let index = 0;

  while (added) {
    added = false;
    for (const list of groupLists) {
      if (index < list.length) {
        result.push(list[index]);
        added = true;
      }
    }
    index++;
  }

  return result;
}

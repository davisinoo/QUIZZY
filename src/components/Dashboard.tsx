import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, Compass, Camera, Sparkles, BookOpen, Clock, HelpCircle, Flame, Trophy } from 'lucide-react';
import { Question, SrsItem, UserStats } from '../types';
import { SectionMain } from './SectionMain';
import { SectionMultiplayer } from './SectionMultiplayer';
import { SectionSolo } from './SectionSolo';
import { SectionScan } from './SectionScan';

interface DashboardProps {
  stats: UserStats;
  srsItems: SrsItem[];
  allQuestions: Question[];
  onStartPractice: () => void;
  onStartSrs: () => void;
  onStartMistakesQuiz: (questions: Question[]) => void;
  onStartSoloQuiz: (questions: Question[], modeTitle: string) => void;
  onPlayCustomQuiz: (questions: Question[]) => void;
  onSaveCustomQuestions: (questions: Question[]) => void;
  account: { username: string; avatar: string; targetSchool: string } | null;
  onOpenLogin: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  srsItems,
  allQuestions,
  onStartPractice,
  onStartSrs,
  onStartMistakesQuiz,
  onStartSoloQuiz,
  onPlayCustomQuiz,
  onSaveCustomQuestions,
  account,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [prevTab, setPrevTab] = useState<number>(0);

  const handleTabChange = (index: number) => {
    setPrevTab(activeTab);
    setActiveTab(index);
  };

  const slideDirection = activeTab > prevTab ? 1 : -1;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 160 : -160,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 160 : -160,
      opacity: 0,
    }),
  };

  const tabsConfig = [
    { id: 0, label: 'Tableau', icon: <User className="w-5 h-5" /> },
    { id: 1, label: 'Multijoueur', icon: <Users className="w-5 h-5" /> },
    { id: 2, label: 'Modes Solo', icon: <Compass className="w-5 h-5" /> },
    { id: 3, label: 'Zack Scan', icon: <Camera className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] justify-between" id="dashboard-unified">
      {/* Scrollable Main Section with Swipe Slide Animate */}
      <div className="flex-grow pb-24 overflow-x-hidden relative" id="dashboard-slides-viewport">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={activeTab}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 20, stiffness: 180 }}
            className="w-full absolute top-0 left-0 px-1"
          >
            {activeTab === 0 && (
              <SectionMain
                stats={stats}
                srsItems={srsItems}
                allQuestions={allQuestions}
                onStartPractice={onStartPractice}
                onStartSrs={onStartSrs}
                onStartMistakesQuiz={onStartMistakesQuiz}
                account={account}
                onOpenLogin={onOpenLogin}
              />
            )}

            {activeTab === 1 && (
              <SectionMultiplayer
                questions={allQuestions}
                onFinishArena={(pts) => onStartMistakesQuiz(allQuestions.slice(0, 5))} // redirect scores
                onCancel={() => handleTabChange(0)}
              />
            )}

            {activeTab === 2 && (
              <SectionSolo
                allQuestions={allQuestions}
                onStartSoloQuiz={onStartSoloQuiz}
              />
            )}

            {activeTab === 3 && (
              <SectionScan
                onPlayCustomQuiz={onPlayCustomQuiz}
                onSaveCustomQuestions={onSaveCustomQuestions}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Bottom Bar Navigation Menu */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-gray-200 py-3 px-4 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
        id="dashboard-bottom-bar"
      >
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {tabsConfig.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`relative flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-indigo-600 font-black' : 'text-gray-400 hover:text-gray-600 font-bold'
                }`}
                id={`tab-btn-${t.id}`}
              >
                {/* Active Indicator Slide bubble overlay */}
                {isActive && (
                  <motion.span
                    layoutId="active-tab-bubble"
                    className="absolute inset-0 bg-indigo-50 rounded-2xl -z-10 border border-indigo-100"
                    transition={{ type: 'spring', damping: 18, stiffness: 160 }}
                  />
                )}

                <motion.div
                  animate={isActive ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {t.icon}
                </motion.div>
                <span className="text-[10px] uppercase tracking-wider">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

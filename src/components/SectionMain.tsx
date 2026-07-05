import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, Award, AlertTriangle, Play, HelpCircle, Heart, Star, Sparkles, User, GraduationCap } from 'lucide-react';
import { Question, SrsItem, UserStats } from '../types';
import { Mascot } from './Mascot';

interface SectionMainProps {
  stats: UserStats;
  srsItems: SrsItem[];
  allQuestions: Question[];
  onStartPractice: () => void;
  onStartSrs: () => void;
  onStartMistakesQuiz: (questions: Question[]) => void;
  account: { username: string; avatar: string; targetSchool: string } | null;
  onOpenLogin: () => void;
}

export const SectionMain: React.FC<SectionMainProps> = ({
  stats,
  srsItems,
  allQuestions,
  onStartPractice,
  onStartSrs,
  onStartMistakesQuiz,
  account,
  onOpenLogin,
}) => {
  // Calculate accuracy
  const totalCompleted = stats.completedQuestionsCount || 0;
  const totalCorrect = stats.correctAnswersCount || 0;
  const accuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 100;

  // Let's identify where they miss answers the most
  // We can count which section has the most items in Box 1 or Box 2 (struggling)
  const categoryStats: { [key: string]: { total: number; box1or2: number } } = {
    'Maroc & Institutions': { total: 0, box1or2: 0 },
    'Économie & Finance': { total: 0, box1or2: 0 },
    'Histoire & Géographie': { total: 0, box1or2: 0 },
    'Arts, Lettres & Sciences': { total: 0, box1or2: 0 },
    'Mémorisation': { total: 0, box1or2: 0 },
  };

  srsItems.forEach((item) => {
    const q = allQuestions.find((quest) => quest.id === item.questionId);
    if (q && categoryStats[q.section]) {
      categoryStats[q.section].total += 1;
      if (item.box <= 2) {
        categoryStats[q.section].box1or2 += 1;
      }
    }
  });

  // Find the category with the most failures (Box 1 or Box 2)
  let weakestCategory = '';
  let maxFailCount = 0;
  Object.keys(categoryStats).forEach((cat) => {
    if (categoryStats[cat].box1or2 > maxFailCount) {
      maxFailCount = categoryStats[cat].box1or2;
      weakestCategory = cat;
    }
  });

  // Get list of specific missed questions (Box 1 or 2 items)
  const missedQuestionIds = srsItems
    .filter((item) => item.box <= 2)
    .map((item) => item.questionId);

  const missedQuestions = allQuestions.filter((q) => missedQuestionIds.includes(q.id));

  // Determine Mascot expression and dialogue based on stats
  let mascotBubble = "Ravi de te revoir ! Prêt à t'entraîner dur aujourd'hui pour décrocher l'ENCG ? 🎓";
  let mascotExp: 'neutral' | 'happy' | 'thinking' | 'cheering' | 'sad' = 'neutral';

  if (stats.streak >= 3) {
    mascotBubble = `Impressionnant ! Une série d'or de ${stats.streak} jours ! Tu es sur la bonne voie ! 🔥`;
    mascotExp = 'cheering';
  } else if (weakestCategory) {
    mascotBubble = `Attention, j'ai remarqué des difficultés en "${weakestCategory}". Faisons une série d'entraînement dessus ! 🧠`;
    mascotExp = 'thinking';
  }

  // Badges system
  const badges = [
    {
      id: 'b1',
      title: 'Aventurier TAFEM',
      desc: 'Série de 1 jour activée',
      icon: '🎯',
      unlocked: stats.streak >= 1,
    },
    {
      id: 'b2',
      title: 'Série de Feu',
      desc: 'Série active de 3+ jours',
      icon: '🔥',
      unlocked: stats.streak >= 3,
    },
    {
      id: 'b3',
      title: 'Génie ENCG',
      desc: 'Atteindre un score de 200+',
      icon: '👑',
      unlocked: stats.score >= 200,
    },
    {
      id: 'b4',
      title: 'Érudit',
      desc: 'Répondre correctement à 20+ QCM',
      icon: '📚',
      unlocked: stats.correctAnswersCount >= 20,
    },
  ];

  return (
    <div className="space-y-6" id="section-main-container">
      {/* Account Profile Header or Login Call */}
      <div 
        className="bg-white p-4 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] flex items-center justify-between"
        id="main-profile-bar"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl border-2 border-indigo-300 flex items-center justify-center font-black text-2xl text-indigo-600">
            {account ? account.avatar : '🦉'}
          </div>
          <div>
            <h3 className="font-black text-gray-800 text-sm flex items-center gap-1">
              {account ? account.username : 'Visiteur TAFEM'}
              <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                Candidat
              </span>
            </h3>
            <p className="text-[11px] text-gray-400 font-bold uppercase">
              {account ? `Cible : ${account.targetSchool}` : "Crée un compte pour suivre tes progrès !"}
            </p>
          </div>
        </div>

        {!account ? (
          <button
            onClick={onOpenLogin}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer active:translate-y-0.5"
            id="btn-login-profile-bar"
          >
            Se connecter
          </button>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase">Progression</span>
            <span className="text-xs font-black text-indigo-700">{stats.xp} XP</span>
          </div>
        )}
      </div>

      {/* Mascot Friend Welcome */}
      <Mascot expression={mascotExp} bubbleText={mascotBubble} name="Tafy le Renard" animal="fox" />

      {/* Quick stats section */}
      <div className="grid grid-cols-3 gap-2" id="profile-stats-grid">
        <div className="bg-white p-3 rounded-2xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-lg">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>{stats.streak} J</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Série Jours</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] text-center">
          <div className="flex items-center justify-center gap-1 text-[#58CC02] font-black text-lg">
            <Trophy className="w-5 h-5 fill-[#58CC02] text-[#58CC02]" />
            <span>{stats.score} pt</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Score Total</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] text-center">
          <div className="flex items-center justify-center gap-1 text-indigo-500 font-black text-lg">
            <Star className="w-5 h-5 fill-indigo-500" />
            <span>{accuracy}%</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-black">Précision</span>
        </div>
      </div>

      {/* Where they miss answers the most */}
      <div 
        className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-4"
        id="profile-weakness-panel"
      >
        <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <h4 className="font-black text-sm text-gray-800 uppercase tracking-tight">Focus Faiblesses</h4>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">Où fais-tu le plus d'erreurs ?</p>
          </div>
        </div>

        {weakestCategory ? (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-center justify-between text-rose-800 text-xs">
              <div className="font-extrabold">
                Sujet le plus difficile : <strong className="underline">{weakestCategory}</strong>
              </div>
              <span className="bg-rose-500 text-white font-black px-2 py-0.5 rounded-full text-[9px] uppercase">
                {maxFailCount} erreurs en boîte SRS
              </span>
            </div>

            {/* List of specific missed questions if any */}
            {missedQuestions.length > 0 && (
              <div className="space-y-2">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  ⚠️ Questions à retravailler d'urgence :
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {missedQuestions.slice(0, 3).map((q) => (
                    <div 
                      key={q.id} 
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 text-left text-xs font-semibold text-gray-700 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center text-[9px] text-rose-500 font-bold uppercase">
                        <span>{q.section}</span>
                        <span>Difficulté : {q.difficulty}</span>
                      </div>
                      <p className="line-clamp-2 leading-tight">{q.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onStartMistakesQuiz(missedQuestions)}
                  className="w-full mt-2 py-3 bg-rose-500 hover:bg-rose-600 border-rose-700 border-b-4 text-white font-black text-xs rounded-2xl shadow-sm transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-practice-mistakes"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Réviser mes erreurs ({missedQuestions.length} QCM)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 space-y-1">
            <span className="text-2xl">✨</span>
            <p className="text-xs font-bold text-gray-600">Aucune lacune détectée pour le moment !</p>
            <p className="text-[10px] text-gray-400">Continue à faire des QCM pour alimenter tes statistiques.</p>
          </div>
        )}
      </div>

      {/* Achievements Badges */}
      <div 
        className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-3"
        id="profile-badges-panel"
      >
        <h4 className="font-black text-sm text-gray-800 uppercase tracking-tight border-b-2 border-gray-100 pb-2">
          🏆 Succès débloqués
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => (
            <div 
              key={b.id} 
              className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 text-left transition-all ${
                b.unlocked 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
              }`}
            >
              <span className="text-2xl">{b.unlocked ? b.icon : '🔒'}</span>
              <div>
                <h5 className="font-black text-xs leading-none mb-1">{b.title}</h5>
                <p className="text-[9px] font-bold leading-tight text-gray-500">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

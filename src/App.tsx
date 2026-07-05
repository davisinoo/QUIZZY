import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Sparkles, RefreshCw, Star, Info, Award, Volume2, VolumeX, BookOpen, User, CheckCircle, Smartphone } from 'lucide-react';
import { Question, SrsItem, UserStats } from './types';
import { TAFEM_QUESTIONS } from './data/questions';
import {
  loadSrsItems,
  saveSrsItems,
  loadUserStats,
  saveUserStats,
  recordQuestionResponse,
} from './utils/srs';
import { Dashboard } from './components/Dashboard';
import { Quiz } from './components/Quiz';
import { interleaveQuestionsByTopic } from './utils/topicRotator';
import { toggleBackgroundMusic, isMusicPlaying, playComboSound, getActiveTheme, setActiveMusicTheme, MusicTheme } from './utils/audio';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'practice_quiz'>('dashboard');
  const [activeModeTitle, setActiveModeTitle] = useState('ENTRAÎNEMENT RAPIDE');

  // App core states
  const [stats, setStats] = useState<UserStats>(loadUserStats());
  const [srsItems, setSrsItems] = useState<SrsItem[]>(loadSrsItems());
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Music theme state
  const [musicTheme, setMusicThemeState] = useState<MusicTheme>(getActiveTheme());

  // Guide and Account/Login state hooks
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [account, setAccount] = useState<{ username: string; avatar: string; targetSchool: string } | null>(() => {
    const data = localStorage.getItem('tafem_user_account');
    return data ? JSON.parse(data) : null;
  });

  // Account creation fields
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍🎓');
  const [selectedTargetSchool, setSelectedTargetSchool] = useState('ENCG Settat');

  // Success Test-O-Meter state (Guide tool)
  const [prepHours, setPrepHours] = useState(50);

  // Dynamic AI custom questions state
  const [customQuestions, setCustomQuestions] = useState<Question[]>(() => {
    const data = localStorage.getItem('tafem_custom_questions');
    return data ? JSON.parse(data) : [];
  });

  // Track background music state
  const [musicPlaying, setMusicPlaying] = useState(isMusicPlaying());

  const handleToggleMusic = () => {
    const newState = toggleBackgroundMusic();
    setMusicPlaying(newState);
  };

  const allQuestionsPool = [...TAFEM_QUESTIONS, ...customQuestions];

  // Sync state with localStorage on changes
  useEffect(() => {
    saveUserStats(stats);
  }, [stats]);

  useEffect(() => {
    saveSrsItems(srsItems);
  }, [srsItems]);

  // Initial setup: auto-increment streak if last active was yesterday, or reset if overdue
  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (stats.lastActiveDate && stats.lastActiveDate !== todayStr) {
      const lastActive = new Date(stats.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive.toDateString() === yesterday.toDateString()) {
        // Increment streak!
        setStats((prev) => ({
          ...prev,
          streak: prev.streak + 1,
          lastActiveDate: todayStr
        }));
      } else {
        // Reset streak if broke the sequence
        setStats((prev) => ({
          ...prev,
          streak: prev.streak === 0 ? 0 : 1, // keep 1 if active today, reset if lazy
          lastActiveDate: todayStr
        }));
      }
    } else if (!stats.lastActiveDate) {
      setStats((prev) => ({
        ...prev,
        lastActiveDate: todayStr
      }));
    }
  }, []);

  // Launch standard 5 QCM practice
  const handleStartPractice = () => {
    // Interleave the active pool to get diverse sections
    const rotated = interleaveQuestionsByTopic(allQuestionsPool);
    const selected = rotated.slice(0, Math.min(rotated.length, 5));

    setActiveQuestions(selected);
    setActiveModeTitle("ENTRAÎNEMENT RAPIDE (5 QCM)");
    setView('practice_quiz');
  };

  // Launch Leitner Spaced Repetition (SRS)
  const handleStartSrs = () => {
    const now = new Date();
    let due = allQuestionsPool.filter((q) => {
      const item = srsItems.find((s) => s.questionId === q.id);
      if (!item) return false;
      return new Date(item.nextReviewDate) <= now;
    });

    if (due.length === 0) {
      // If none are due, pick questions not mastered (e.g. not in Box 5)
      const masteredIds = srsItems.filter(item => item.box === 5).map(item => item.questionId);
      const candidates = allQuestionsPool.filter(q => !masteredIds.includes(q.id));
      
      if (candidates.length > 0) {
        due = candidates;
      } else {
        // Everything is mastered! Pick any 4 for review
        due = [...allQuestionsPool];
      }
    }

    const rotated = interleaveQuestionsByTopic(due);
    const selected = rotated.slice(0, Math.min(rotated.length, 4));

    setActiveQuestions(selected);
    setActiveModeTitle("RÉPÉTITION ESPACÉE (SRS)");
    setView('practice_quiz');
  };

  // Start solo mode configured list
  const handleStartSoloQuiz = (questions: Question[], modeTitle: string) => {
    setActiveQuestions(questions);
    setActiveModeTitle(modeTitle);
    setView('practice_quiz');
  };

  // Play custom quiz from scanning / AI Verification
  const handlePlayCustomQuiz = (questions: Question[]) => {
    const rotated = interleaveQuestionsByTopic(questions);
    setActiveQuestions(rotated);
    setActiveModeTitle("QCM PERSONNALISÉS PAR L'IA");
    setView('practice_quiz');
  };

  // Save custom generated questions to pool
  const handleSaveCustomQuestions = (questions: Question[]) => {
    const updatedCustom = [...customQuestions, ...questions];
    setCustomQuestions(updatedCustom);
    localStorage.setItem('tafem_custom_questions', JSON.stringify(updatedCustom));
  };

  // Create user profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const newProfile = {
      username: usernameInput.trim(),
      avatar: selectedAvatar,
      targetSchool: selectedTargetSchool,
    };

    setAccount(newProfile);
    localStorage.setItem('tafem_user_account', JSON.stringify(newProfile));
    setLoginModalOpen(false);
    playComboSound(); // play cheerful reward sound!
  };

  // Handle Logout
  const handleLogout = () => {
    setAccount(null);
    localStorage.removeItem('tafem_user_account');
  };

  // Handle Quiz completion
  const handleFinishQuiz = (
    scoreChange: number,
    correctCount: number,
    srsSessionUpdates: { questionId: string; isCorrect: boolean }[]
  ) => {
    // Process Leitner updates for answered questions
    srsSessionUpdates.forEach((update) => {
      recordQuestionResponse(update.questionId, update.isCorrect);
    });

    // Refresh SRS state from local storage
    const updatedSrs = loadSrsItems();
    setSrsItems(updatedSrs);

    // No heart deduction since we play with no limit! Keep lives full.
    const finalLives = 5;

    // Earned XP: 10 XP for each correct answer + 50 completion bonus
    const xpGained = (correctCount * 10) + 50;

    setStats((prev) => {
      const newScore = Math.max(0, prev.score + scoreChange);
      return {
        ...prev,
        score: newScore,
        lives: finalLives,
        xp: prev.xp + xpGained,
        completedQuestionsCount: prev.completedQuestionsCount + srsSessionUpdates.length,
        correctAnswersCount: prev.correctAnswersCount + correctCount,
        lastActiveDate: new Date().toDateString()
      };
    });

    setView('dashboard');
  };

  // Simple success probability calculator
  const successChance = Math.min(Math.round((prepHours / 150) * 100), 98);

  return (
    <div className="min-h-screen bg-[#F1F4F9] text-gray-800 font-sans flex flex-col justify-between" id="app-root-container">
      {/* Top Header Navigation Bar */}
      <header 
        className="sticky top-0 z-40 bg-white border-b-4 border-gray-200 px-4 py-3 shadow-sm"
        id="app-header"
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => setView('dashboard')}
            id="brand-logo"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_3px_0_0_#4338ca] border-b-2 border-indigo-700">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <div>
              <h1 className="font-black text-base tracking-tight text-indigo-600 leading-none">TAFEM Prep</h1>
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Master Edition</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Guide Button */}
            <button
              onClick={() => setGuideModalOpen(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              id="btn-guide-modal-trigger"
              title="Guide de Réussite"
            >
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <span className="hidden sm:inline text-xs font-black uppercase text-indigo-600">Guide</span>
            </button>

            {/* Login Account Trigger */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              id="btn-account-trigger"
            >
              <User className="w-5 h-5 text-indigo-500" />
              <span className="hidden sm:inline text-xs font-black uppercase text-indigo-600">
                {account ? account.username : 'Compte'}
              </span>
            </button>

            {/* Background Music & Theme Selector */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-200" id="music-panel-header">
              <button
                onClick={handleToggleMusic}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  musicPlaying 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
                id="btn-music-toggle-header"
                title="Musique Ambiante"
              >
                {musicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              
              {musicPlaying && (
                <div className="flex gap-0.5 text-[10px] font-black" id="music-themes-selector">
                  {(['cozy', 'happy', 'cool'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setActiveMusicTheme(t);
                        setMusicThemeState(t);
                      }}
                      className={`px-1.5 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                        musicTheme === t
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                      }`}
                      title={t === 'cozy' ? 'Mode Zen' : t === 'happy' ? 'Upbeat Happy' : 'Retro Cool'}
                    >
                      {t === 'cozy' ? '🧘' : t === 'happy' ? '☀️' : '🎷'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="max-w-xl mx-auto py-5 px-3 flex-grow w-full">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard
                stats={stats}
                srsItems={srsItems}
                allQuestions={allQuestionsPool}
                onStartPractice={handleStartPractice}
                onStartSrs={handleStartSrs}
                onStartMistakesQuiz={(questions) => handleStartSoloQuiz(questions, "RÉVISION DES ERREURS")}
                onStartSoloQuiz={handleStartSoloQuiz}
                onPlayCustomQuiz={handlePlayCustomQuiz}
                onSaveCustomQuestions={handleSaveCustomQuestions}
                account={account}
                onOpenLogin={() => setLoginModalOpen(true)}
              />
            </motion.div>
          )}

          {view === 'practice_quiz' && (
            <motion.div
              key="practice_quiz_view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 text-center">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 font-black text-xs rounded-full uppercase tracking-widest">
                  🎯 {activeModeTitle}
                </span>
              </div>
              <Quiz
                questions={activeQuestions}
                onFinishQuiz={handleFinishQuiz}
                onCancel={() => setView('dashboard')}
                lives={stats.lives}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DIALOG 1: INTERACTIVE LOGIN & ACCOUNT MODAL */}
      <AnimatePresence>
        {loginModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl p-6 border-4 border-indigo-400 max-w-sm w-full shadow-2xl relative space-y-5"
              id="login-modal"
            >
              <button
                onClick={() => setLoginModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-black text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="text-center">
                <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-2 animate-bounce" />
                <h3 className="font-black text-xl text-gray-800">Compte Candidat TAFEM</h3>
                <p className="text-xs text-gray-400">Enregistre ton dossier de révisions ENCG</p>
              </div>

              {!account ? (
                <form onSubmit={handleCreateProfile} className="space-y-4">
                  {/* Username input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Nom de l'étudiant :</label>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ex : Salma Benjelloun"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-indigo-500 rounded-2xl font-bold text-sm text-gray-700 outline-none"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Choisis ton Avatar :</label>
                    <div className="grid grid-cols-6 gap-2 text-2xl text-center">
                      {['🧑‍🎓', '👩‍🎓', '👨‍💻', '🦁', '🦉', '🦊'].map((av) => (
                        <div
                          key={av}
                          onClick={() => setSelectedAvatar(av)}
                          className={`p-1.5 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedAvatar === av ? 'bg-indigo-50 border-indigo-500 scale-110' : 'bg-gray-50 border-transparent hover:border-gray-200'
                          }`}
                        >
                          {av}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target ENCG School choice */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">ENCG Cible :</label>
                    <select
                      value={selectedTargetSchool}
                      onChange={(e) => setSelectedTargetSchool(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 focus:border-indigo-500 rounded-2xl font-bold text-sm text-gray-700 outline-none cursor-pointer"
                    >
                      <option value="ENCG Settat">ENCG Settat (Cible #1)</option>
                      <option value="ENCG Casablanca">ENCG Casablanca</option>
                      <option value="ENCG Rabat">ENCG Rabat</option>
                      <option value="ENCG Marrakech">ENCG Marrakech</option>
                      <option value="ENCG Agadir">ENCG Agadir</option>
                      <option value="ENCG Tangier">ENCG Tangier</option>
                      <option value="ENCG Fez">ENCG Fez</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 border-indigo-800 border-b-4 text-white font-black text-sm rounded-2xl shadow-md uppercase transition-all active:translate-y-0.5 cursor-pointer"
                  >
                    Créer mon compte d'études !
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl space-y-1">
                    <span className="text-[3rem] block">{account.avatar}</span>
                    <h4 className="font-black text-base text-indigo-900">{account.username}</h4>
                    <span className="text-[10px] bg-indigo-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                      Cible : {account.targetSchool}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 transition-all uppercase cursor-pointer"
                  >
                    Se déconnecter de ce profil
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: TAFEM EXAM STUDY GUIDE & TEST-O-METER */}
      <AnimatePresence>
        {guideModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white rounded-3xl p-6 border-4 border-indigo-500 max-w-md w-full shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto"
              id="guide-modal"
            >
              <button
                onClick={() => setGuideModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-black text-sm cursor-pointer"
              >
                ✕
              </button>

              <h3 className="font-black text-xl text-indigo-700 flex items-center gap-1.5">
                <GraduationCap className="w-6 h-6" />
                Guide Officiel du Concours TAFEM
              </h3>

              <div className="text-xs text-gray-600 space-y-3.5 leading-relaxed">
                <div>
                  <h4 className="font-black text-gray-800 uppercase border-b pb-1 mb-1">📐 Structure et Coefficients</h4>
                  <p>Le TAFEM comporte 100 questions réparties sur 4 axes majeurs :</p>
                  <table className="w-full mt-1.5 border border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 font-black">
                        <th className="p-1 border text-[10px]">Axe d'épreuve</th>
                        <th className="p-1 border text-[10px]">Questions</th>
                        <th className="p-1 border text-[10px]">Coefficient</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1 border font-bold">Aptitudes Mathématiques</td>
                        <td className="p-1 border">25 QCM</td>
                        <td className="p-1 border font-black">4</td>
                      </tr>
                      <tr>
                        <td className="p-1 border font-bold">Aptitudes Verbales (Français)</td>
                        <td className="p-1 border">25 QCM</td>
                        <td className="p-1 border font-black">3</td>
                      </tr>
                      <tr>
                        <td className="p-1 border font-bold">Logique et Mémorisation</td>
                        <td className="p-1 border">25 QCM</td>
                        <td className="p-1 border font-black">2</td>
                      </tr>
                      <tr>
                        <td className="p-1 border font-bold">Culture Générale</td>
                        <td className="p-1 border">25 QCM</td>
                        <td className="p-1 border font-black">1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-black text-gray-800 uppercase border-b pb-1 mb-1">⏱️ Règle Anti-Calculatrice</h4>
                  <p className="bg-rose-50 text-rose-800 p-2.5 rounded-xl border border-rose-100 font-bold">
                    ⚠️ <strong>INTERDICTION ABSOLUE :</strong> Les calculatrices ne sont pas autorisées lors du concours. Vous devez vous entraîner au calcul mental rapide !
                  </p>
                </div>

                {/* Test-O-Meter tool */}
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                  <h4 className="font-black text-indigo-900 uppercase">📈 ESTIMATEUR DE REUSSITE TAFEM</h4>
                  <p className="text-[10px] text-indigo-700 font-bold">Combien d'heures as-tu révisé ce mois-ci ?</p>
                  
                  <div className="flex gap-3 items-center">
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      value={prepHours} 
                      onChange={(e) => setPrepHours(Number(e.target.value))}
                      className="flex-grow accent-indigo-600 h-2 rounded-full outline-none" 
                    />
                    <span className="font-black text-indigo-900 w-12 text-right">{prepHours}h</span>
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-[10px] uppercase font-black text-gray-400">Probabilité d'admission estimée :</span>
                    <h2 className="text-2xl font-black text-indigo-700">{successChance}%</h2>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setGuideModalOpen(false)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 border-indigo-800 border-b-4 text-white font-black text-xs rounded-2xl shadow-md uppercase transition-all active:translate-y-0.5 cursor-pointer"
              >
                Fermer le Guide de révision
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

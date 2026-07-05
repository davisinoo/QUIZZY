import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ShieldAlert, Heart, Zap, Award, BookOpen, Clock, HelpCircle, Flame } from 'lucide-react';
import { Question, MascotExpression } from '../types';
import { Mascot } from './Mascot';
import { playCorrectSound, playIncorrectSound, playComboSound } from '../utils/audio';
import { getUserLeagueScore, saveUserLeagueScore } from '../utils/friends';

interface QuizProps {
  questions: Question[];
  onFinishQuiz: (scoreChange: number, correctCount: number, srsUpdates: { questionId: string; isCorrect: boolean }[]) => void;
  onCancel: () => void;
  lives: number;
}

export const Quiz: React.FC<QuizProps> = ({
  questions,
  onFinishQuiz,
  onCancel,
  lives,
}) => {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>(() => questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showIncorrectPopup, setShowIncorrectPopup] = useState(false);
  
  // Memorization Phase states
  const [memoPhaseActive, setMemoPhaseActive] = useState(false);
  const [memoTimer, setMemoTimer] = useState(20); // 20 seconds to memorize

  // Active Score & combo tracked inside this session
  const [sessionScore, setSessionScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [srsSessionUpdates, setSrsSessionUpdates] = useState<{ questionId: string; isCorrect: boolean }[]>([]);

  // Combo States
  const [combo, setCombo] = useState(0);
  const [comboMilestone, setComboMilestone] = useState<number | null>(null);

  const currentQuestion = sessionQuestions[currentIndex];

  // Mascot state inside Quiz
  const [mascotExp, setMascotExp] = useState<MascotExpression>('neutral');
  const [bubbleText, setBubbleText] = useState<string>('');

  // Setup Memorization Phase if current question is from Mémorisation section
  useEffect(() => {
    if (currentQuestion && currentQuestion.section === 'Mémorisation' && !isAnswered) {
      setMemoPhaseActive(true);
      setMemoTimer(20);
      setMascotExp('thinking');
      setBubbleText("Prends bien le temps de mémoriser ce texte ! Il va disparaître dans quelques secondes.");
    } else {
      setMemoPhaseActive(false);
      setMascotExp('neutral');
      setBubbleText("Réfléchis bien, chaque mauvaise réponse te pénalise de -1 !");
    }
    setSelectedOption(null);
    setIsAnswered(false);
  }, [currentIndex, currentQuestion]);

  // Timer logic for Memorization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (memoPhaseActive && memoTimer > 0) {
      interval = setInterval(() => {
        setMemoTimer((prev) => prev - 1);
      }, 1000);
    } else if (memoTimer === 0 && memoPhaseActive) {
      setMemoPhaseActive(false);
      setMascotExp('neutral');
      setBubbleText("C'est parti ! Réponds à la question de mémoire !");
    }
    return () => clearInterval(interval);
  }, [memoPhaseActive, memoTimer]);

  if (sessionQuestions.length === 0) {
    return (
      <div className="text-center py-12" id="quiz-empty">
        <HelpCircle className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-bounce" />
        <p className="text-lg font-bold text-gray-600">Aucune question disponible.</p>
        <button onClick={onCancel} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl">
          Retour
        </button>
      </div>
    );
  }

  // Handle validating answer
  const handleValidate = () => {
    if (selectedOption === null || isAnswered) return;

    const correct = selectedOption === currentQuestion.correctOptionIndex;
    setIsCorrect(correct);
    setIsAnswered(true);

    const updatedSrs = [
      ...srsSessionUpdates,
      { questionId: currentQuestion.id, isCorrect: correct }
    ];
    setSrsSessionUpdates(updatedSrs);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setSessionScore((prev) => prev + 10);
      setMascotExp('happy');

      const newCombo = combo + 1;
      setCombo(newCombo);

      // Calculate Friendly League points: +10 base points, plus massive combos bonuses!
      let leaguePointsGained = 10;
      let comboBonusMsg = "";
      if (newCombo >= 15) {
        leaguePointsGained += 40;
        comboBonusMsg = " 🔥 Super-Combo x" + newCombo + " ! +40 pts Ligue !";
      } else if (newCombo >= 10) {
        leaguePointsGained += 25;
        comboBonusMsg = " 🔥 Mega-Combo x" + newCombo + " ! +25 pts Ligue !";
      } else if (newCombo >= 5) {
        leaguePointsGained += 15;
        comboBonusMsg = " 🔥 Combo x" + newCombo + " ! +15 pts Ligue !";
      } else if (newCombo >= 3) {
        leaguePointsGained += 5;
        comboBonusMsg = " 🔥 Série x" + newCombo + " ! +5 pts Ligue !";
      }
      
      const currentLeagueScore = getUserLeagueScore();
      saveUserLeagueScore(currentLeagueScore + leaguePointsGained);

      setBubbleText(`Excellent ! Bonne réponse. +10 points !${comboBonusMsg}`);
      playCorrectSound();

      // Check combo milestones (5, 10, 15...)
      if (newCombo % 5 === 0) {
        setComboMilestone(newCombo);
        playComboSound();
      }
    } else {
      setSessionScore((prev) => prev - 1); // Penality -1 point
      setCombo(0); // Reset combo chain
      playIncorrectSound();

      // Reinforced Spaced Repetition: repeat wrong answers later by appending to sessionQuestions
      setSessionQuestions((prev) => [...prev, currentQuestion]);

      setMascotExp('sad');
      setBubbleText("Oups ! Ne t'inquiète pas, cette question réapparaîtra à la fin pour t'aider à l'apprendre !");
      setShowIncorrectPopup(true);
    }
  };

  // Move to next question or end quiz
  const handleNext = () => {
    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // End Quiz successfully
      onFinishQuiz(sessionScore, correctCount, srsSessionUpdates);
    }
  };

  // Section badge colors
  const getSectionBadgeColor = (section: string) => {
    switch (section) {
      case 'Maroc & Institutions': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Économie & Finance': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Histoire & Géographie': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Arts, Lettres & Sciences': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Mémorisation': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  // Splitting text for memorisation questions
  const renderQuestionText = () => {
    if (currentQuestion.section === 'Mémorisation') {
      const parts = currentQuestion.text.split('\n\nQUESTION : ');
      if (parts.length > 1) {
        return memoPhaseActive ? parts[0].replace('[TEXTE À MÉMORISER] ', '') : parts[1];
      }
    }
    return currentQuestion.text;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-2" id="quiz-container">
      {/* Top Header Row with quit and hearts */}
      <div className="flex items-center justify-between mb-4" id="quiz-header">
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 font-extrabold text-sm flex items-center gap-1 transition-colors"
          id="btn-quiz-exit"
        >
          ✕ Quitter
        </button>

        {/* Dynamic Progress Indicator */}
        <div className="flex-1 mx-4">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              className="h-full bg-[#58CC02] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / sessionQuestions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Combo / Infinite indicators instead of Hearts limit */}
        <div className="flex items-center gap-1.5" id="quiz-header-status">
          {combo > 0 ? (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.25, 1] }}
              className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200"
              id="quiz-header-combo-badge"
            >
              <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
              <span className="text-xs">Combo x{combo}</span>
            </motion.div>
          ) : (
            <div 
              className="flex items-center gap-1 text-indigo-500 font-extrabold bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200 text-xs"
              id="quiz-header-infinite-badge"
              title="Vies infinies"
            >
              <span>Mode Infini</span>
              <span>♾️</span>
            </div>
          )}
        </div>
      </div>

      {/* Mascot Assistant inside Quiz */}
      <div className="mb-4">
        <Mascot expression={mascotExp} bubbleText={bubbleText} />
      </div>

      <AnimatePresence mode="wait">
        {/* MEMORIZATION PHASE STUDY SCREEN */}
        {memoPhaseActive ? (
          <motion.div
            key="memo-phase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-gradient-to-b from-indigo-50 to-white p-6 rounded-3xl border-4 border-indigo-200 shadow-md text-gray-800"
            id="memorization-phase-container"
          >
            <div className="flex items-center justify-between mb-4 border-b pb-2 border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold">
                <Clock className="w-5 h-5 animate-spin-slow" />
                <span>Phase de Mémorisation</span>
              </div>
              <div className="px-3 py-1 bg-indigo-600 text-white rounded-full font-black text-sm">
                {memoTimer}s
              </div>
            </div>

            <p className="text-base font-medium leading-relaxed italic text-gray-700" id="memo-text-display">
              {renderQuestionText()}
            </p>

            <div className="mt-6">
              <button
                onClick={() => setMemoTimer(0)}
                className="w-full py-3 bg-[#1CB0F6] hover:bg-[#1CB0F6]/95 text-white font-extrabold rounded-2xl border-b-4 border-[#1899D6] shadow-md transition-all active:translate-y-0.5 active:border-b-2 cursor-pointer"
                id="btn-skip-memo-timer"
              >
                J'ai mémorisé, afficher la question !
              </button>
            </div>
          </motion.div>
        ) : (
          /* QUESTION PANEL */
          <motion.div
            key="question-phase"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Question Details Card */}
            <div 
              className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0px_0px_rgba(229,231,235,1)]"
              id="quiz-question-card"
            >
              {/* Badges */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full border-2 ${getSectionBadgeColor(currentQuestion.section)}`}>
                  {currentQuestion.section}
                </span>
                <span className="text-xs text-gray-400 font-black uppercase">
                  Difficulté : {currentQuestion.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-extrabold text-gray-800 leading-snug" id="question-text">
                {renderQuestionText()}
              </h2>
            </div>

            {/* Answer Options list */}
            <div className="space-y-2.5" id="answer-options-list">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                
                let buttonStyle = "border-gray-200 bg-white text-gray-700 shadow-[0_4px_0_0_#e5e7eb]";
                if (isSelected) {
                  buttonStyle = "border-[#1CB0F6] bg-[#DDF4FF] text-[#1899D6] shadow-[0_4px_0_0_#84D8FF]";
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => {
                      setSelectedOption(index);
                      setMascotExp('thinking');
                      setBubbleText(`Tu as choisi l'option ${String.fromCharCode(65 + index)}. Es-tu sûr de toi ?`);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-3 text-left font-bold text-base transition-all duration-100 ${buttonStyle} ${
                      isAnswered ? 'cursor-default opacity-90' : 'cursor-pointer hover:border-gray-300 active:translate-y-0.5'
                    }`}
                    id={`option-btn-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-xl border-2 text-sm font-extrabold ${
                        isSelected ? 'bg-[#1CB0F6] text-white border-[#1899D6]' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Validate/Check Button Row */}
            {!isAnswered && (
              <div className="pt-2">
                <button
                  disabled={selectedOption === null}
                  onClick={handleValidate}
                  className={`w-full py-4 text-white font-black text-lg rounded-2xl border-b-4 transition-all uppercase tracking-wider ${
                    selectedOption === null
                      ? 'bg-gray-300 border-gray-400 shadow-none cursor-not-allowed'
                      : 'bg-[#58CC02] hover:bg-[#58CC02]/95 border-[#46A302] shadow-md active:translate-y-0.5 active:border-b-2 cursor-pointer'
                  }`}
                  id="btn-validate-answer"
                >
                  Valider la réponse
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER EXPLANATION & NAVIGATION DRAWER (Sliding Panel) */}
      <AnimatePresence>
        {isAnswered && !showIncorrectPopup && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-0 left-0 right-0 p-5 pb-8 rounded-t-3xl border-t-4 shadow-2xl z-50 ${
              isCorrect 
                ? 'bg-[#EBF7E3] border-[#a0e070] text-[#3c7a0d]' 
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
            id="quiz-result-drawer"
          >
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center gap-3 font-black text-lg">
                <div className={`p-2 rounded-full ${isCorrect ? 'bg-[#58CC02]' : 'bg-red-500'} text-white`}>
                  {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">
                    {isCorrect ? 'Excellent !' : 'Oups, incorrect !'}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wide">
                    {isCorrect ? '+10 XP • Correct' : '-1 Score • Pénalité'}
                  </span>
                </div>
              </div>

              {/* Explanatory notes */}
              <div className="bg-white/80 p-4 rounded-2xl border border-dashed text-sm leading-relaxed" id="explanation-body">
                <p className="font-bold text-gray-700 mb-1">Explication :</p>
                <p className="text-gray-600">{currentQuestion.explanation}</p>
              </div>

              {/* Next Question button */}
              <button
                onClick={handleNext}
                className={`w-full py-3.5 text-white font-black rounded-2xl border-b-4 transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-wide cursor-pointer ${
                  isCorrect
                    ? 'bg-[#58CC02] hover:bg-[#58CC02]/95 border-[#46A302]'
                    : 'bg-red-500 hover:bg-red-600 border-red-700'
                }`}
                id="btn-next-question"
              >
                {currentIndex + 1 === sessionQuestions.length ? 'Terminer la série' : 'Question suivante ➔'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUTE CHARACTER INCORRECT ANSWER POPUP OVERLAY */}
      <AnimatePresence>
        {showIncorrectPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            id="incorrect-popup-backdrop"
          >
            <motion.div
              initial={{ scale: 0.9, y: 25, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 25, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl border-4 border-red-400 p-6 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] relative overflow-hidden flex flex-col items-center text-center"
              id="incorrect-popup-card"
            >
              {/* Cute top corner badge */}
              <div className="absolute top-0 right-0 bg-red-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                Correction TAFEM 🦊
              </div>

              {/* Cute Mascot with sad / crying face and a bubble */}
              <div className="mb-4 mt-2">
                <Mascot expression="sad" bubbleText="Oh non ! Ce n'est pas la bonne réponse... Laisse-moi t'aider !" />
              </div>

              <h3 className="text-2xl font-black text-red-600 mb-2 tracking-tight">
                La bonne réponse était...
              </h3>

              {/* The original question summary */}
              <div className="w-full text-left bg-gray-50 p-3 rounded-2xl border border-gray-200/80 mb-4">
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Question</span>
                <p className="text-xs font-extrabold text-gray-700 leading-snug">
                  {currentQuestion.text}
                </p>
              </div>

              {/* User Answer vs Correct Answer Box */}
              <div className="space-y-2.5 w-full text-left">
                {/* Your answer (Incorrect) */}
                <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3">
                  <div className="p-1 bg-red-500 text-white rounded-full mt-0.5 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-red-500 uppercase tracking-wider">Ta réponse :</span>
                    <span className="text-sm font-bold text-red-800 leading-tight">
                      {selectedOption !== null ? currentQuestion.options[selectedOption] : 'Aucune réponse'}
                    </span>
                  </div>
                </div>

                {/* Right answer (Correct) */}
                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-start gap-3">
                  <div className="p-1 bg-[#58CC02] text-white rounded-full mt-0.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-wider">La bonne réponse :</span>
                    <span className="text-sm font-black text-emerald-800 leading-tight">
                      {currentQuestion.options[currentQuestion.correctOptionIndex]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation Section */}
              {currentQuestion.explanation && (
                <div className="mt-4 text-left w-full">
                  <div className="bg-amber-50/70 border-2 border-dashed border-amber-200 p-4 rounded-2xl">
                    <span className="block text-[9px] font-black text-amber-700 uppercase tracking-wider mb-1">💡 Explication pédagogique :</span>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Big Close & Proceed Button */}
              <button
                onClick={() => {
                  setShowIncorrectPopup(false);
                  handleNext();
                }}
                className="w-full mt-6 py-4 bg-red-500 hover:bg-red-600 border-red-700 border-b-4 text-white font-black text-sm rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-widest cursor-pointer"
                id="btn-close-incorrect-popup"
              >
                {currentIndex + 1 === sessionQuestions.length ? 'Terminer la série' : "J'ai compris, question suivante ➔"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMBO MILESTONE CELEBRATION OVERLAY */}
      <AnimatePresence>
        {comboMilestone !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[150] flex items-center justify-center p-4 text-center"
            id="combo-celebration-overlay"
          >
            <motion.div
              initial={{ scale: 0.6, y: 120, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.6, y: -120, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 220 }}
              className="bg-gradient-to-b from-[#FFA000] via-[#FF5722] to-[#E91E63] rounded-3xl border-4 border-white p-8 max-w-sm w-full shadow-[0_20px_50px_rgba(233,30,99,0.3)] relative overflow-hidden"
              id="combo-celebration-card"
            >
              {/* Floating stars */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-4 left-6 text-3xl animate-bounce">⭐</div>
                <div className="absolute top-12 right-8 text-xl animate-pulse">⭐</div>
                <div className="absolute bottom-16 left-8 text-2xl animate-pulse">⭐</div>
                <div className="absolute bottom-6 right-10 text-4xl animate-bounce">⭐</div>
              </div>

              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 bg-white text-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg border-4 border-amber-300"
              >
                <Zap className="w-10 h-10 fill-orange-500" />
              </motion.div>

              <span className="inline-block px-3 py-1 bg-black/25 text-white font-extrabold text-[10px] rounded-full uppercase tracking-widest mb-3">
                SÉRIE FANTASTIQUE ! 🔥
              </span>

              <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase drop-shadow-md">
                COMBO x{comboMilestone} !
              </h2>

              <p className="text-sm font-medium text-white/95 leading-relaxed mb-6">
                {comboMilestone >= 15
                  ? "INCROYABLE ! Tu as maîtrisé le sujet à la perfection. Véritable génie du TAFEM ! 👑"
                  : comboMilestone >= 10
                  ? "SENSATIONNEL ! Dix réponses correctes d'affilée ! Les portes de l'ENCG s'ouvrent à toi ! 🚀"
                  : "SUPERBE ! Cinq à la suite ! Continue comme ça pour tout mémoriser ! 🌟"}
              </p>

              <button
                onClick={() => setComboMilestone(null)}
                className="w-full py-3.5 bg-white hover:bg-amber-50 text-orange-600 font-extrabold text-base rounded-2xl shadow-md border-b-4 border-orange-200 transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-wider cursor-pointer"
                id="btn-dismiss-combo"
              >
                Continuer à jouer ! ➔
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

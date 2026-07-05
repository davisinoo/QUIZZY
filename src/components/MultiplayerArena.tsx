import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Check, Users, Zap, Shield, Trophy, RefreshCw, Star, X, Clock } from 'lucide-react';
import { Question } from '../types';
import { Mascot } from './Mascot';

interface Competitor {
  id: string;
  name: string;
  city: string;
  score: number;
  currentQuestion: number;
  accuracy: number; // probability of correct answer
}

interface MultiplayerArenaProps {
  questions: Question[];
  userCurrentScore: number;
  onFinishArena: (pointsEarned: number) => void;
  onCancel: () => void;
}

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  questions,
  userCurrentScore,
  onFinishArena,
  onCancel,
}) => {
  const [gameState, setGameState] = useState<'matchmaking' | 'playing' | 'podium'>('matchmaking');
  const [matchmakingProgress, setMatchmakingProgress] = useState(0);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // Question phase states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(15); // 15 seconds per speed-Q
  const [userScore, setUserScore] = useState(0);

  // Filter 3 rapid questions for the arena
  const arenaQuestions = questions.slice(0, 3);
  const currentQuestion = arenaQuestions[currentQuestionIndex];

  // Simulating matchmaking candidates
  useEffect(() => {
    if (gameState === 'matchmaking') {
      const interval = setInterval(() => {
        setMatchmakingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Form mock competitors
            setCompetitors([
              { id: 'bot-1', name: 'Yassine', city: 'Casablanca', score: 0, currentQuestion: 0, accuracy: 0.7 },
              { id: 'bot-2', name: 'Ines', city: 'Marrakech', score: 0, currentQuestion: 0, accuracy: 0.8 },
            ]);
            setTimeout(() => {
              setGameState('playing');
              setQuestionTimer(15);
            }, 1000);
            return 100;
          }
          return prev + 10;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Speed-based countdown timer
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (gameState === 'playing' && questionTimer > 0 && !isAnswered) {
      timerId = setInterval(() => {
        setQuestionTimer((prev) => prev - 1);
      }, 1000);
    } else if (questionTimer === 0 && !isAnswered && gameState === 'playing') {
      // Timeout counts as incorrect answer
      handleAnswerSelect(-1);
    }
    return () => clearInterval(timerId);
  }, [gameState, questionTimer, isAnswered]);

  // Simulate competitors answering questions with realistic delays
  useEffect(() => {
    let botInterval: NodeJS.Timeout;
    if (gameState === 'playing' && !isAnswered) {
      botInterval = setInterval(() => {
        setCompetitors((prevBots) =>
          prevBots.map((bot) => {
            // If bot hasn't answered this question yet
            if (bot.currentQuestion === currentQuestionIndex) {
              const answeredThisTick = Math.random() > 0.6; // random timing
              if (answeredThisTick) {
                const correct = Math.random() < bot.accuracy;
                // Speed points formula: 1000 max, decaying by timer
                const speedBonus = questionTimer * 45;
                const earned = correct ? 500 + speedBonus : 0;
                return {
                  ...bot,
                  score: bot.score + earned,
                  currentQuestion: bot.currentQuestion + 1,
                };
              }
            }
            return bot;
          })
        );
      }, 1500);
    }
    return () => clearInterval(botInterval);
  }, [gameState, currentQuestionIndex, isAnswered, questionTimer]);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const correct = index === currentQuestion.correctOptionIndex;
    setIsCorrect(correct);

    let earned = 0;
    if (correct) {
      // Speed-points formula: 500 base + (remaining time * 30)
      earned = 500 + (questionTimer * 30);
      setUserScore((prev) => prev + earned);
    }

    // Force competitors to catch up for the current question
    setTimeout(() => {
      setCompetitors((prevBots) =>
        prevBots.map((bot) => {
          if (bot.currentQuestion === currentQuestionIndex) {
            const correct = Math.random() < bot.accuracy;
            const randTimer = Math.max(2, Math.floor(Math.random() * questionTimer));
            const speedBonus = randTimer * 30;
            const botEarned = correct ? 500 + speedBonus : 0;
            return {
              ...bot,
              score: bot.score + botEarned,
              currentQuestion: bot.currentQuestion + 1,
            };
          }
          return bot;
        })
      );
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < arenaQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setQuestionTimer(15);
    } else {
      // Go to Podium
      setGameState('podium');
    }
  };

  // Combine user & bots into final sorted results
  const leaderboard = [
    { name: 'Toi', city: 'Candidat', score: userScore, isUser: true },
    ...competitors.map((c) => ({ name: c.name, city: c.city, score: c.score, isUser: false })),
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-xl mx-auto px-4 py-2" id="arena-view">
      {/* MATCHMAKING SCREEN */}
      {gameState === 'matchmaking' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-3xl border-4 border-amber-300 shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] text-center space-y-6"
          id="matchmaking-container"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-xl text-amber-600 flex items-center gap-2">
              <Users className="w-6 h-6 animate-pulse" />
              Lobby de l'Arène TAFEM
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 flex flex-col items-center">
            {/* Pulsing radar effect */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-25 animate-ping" />
              <div className="relative p-6 bg-amber-500 rounded-full text-white">
                <Users className="w-12 h-12" />
              </div>
            </div>
            <p className="mt-4 font-black text-gray-700">Recherche d'opposants connectés au Maroc...</p>
            <p className="text-xs text-gray-400">Matchmaking Kahoot-style en cours</p>
          </div>

          {/* Connected players simulated logs */}
          <div className="space-y-2 text-left bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
            {matchmakingProgress >= 20 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-gray-600 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Yassine de <strong>Casablanca</strong> a rejoint la salle.</span>
              </motion.div>
            )}
            {matchmakingProgress >= 50 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-gray-600 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Ines de <strong>Marrakech</strong> a rejoint la salle.</span>
              </motion.div>
            )}
            {matchmakingProgress >= 80 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-amber-600 font-black flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Matchmaking finalisé ! Lancement immédiat...</span>
              </motion.div>
            )}
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${matchmakingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* ACTIVE MULTIPLAYER PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="space-y-4" id="arena-play-state">
          {/* Header Progress and Timer */}
          <div className="flex justify-between items-center bg-white px-4 py-2 rounded-2xl border-3 border-gray-200">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-black text-gray-700">Question {currentQuestionIndex + 1}/3</span>
            </div>

            {/* countdown timer dial */}
            <div className={`px-4 py-1.5 rounded-full font-black text-sm text-white flex items-center gap-1.5 ${
              questionTimer <= 4 ? 'bg-red-500 animate-bounce' : 'bg-amber-500'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{questionTimer}s</span>
            </div>

            <div className="font-extrabold text-sm text-indigo-600">
              Score : {userScore} pts
            </div>
          </div>

          {/* Live mini scoreboard sidebar */}
          <div className="bg-white p-3 rounded-2xl border-3 border-gray-100 flex items-center justify-around gap-2" id="arena-mini-leaderboard">
            {leaderboard.map((item, idx) => (
              <div 
                key={item.name} 
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                  item.isUser ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span>#{idx+1}</span>
                <span>{item.name}</span>
                <span className="opacity-75">{item.score}</span>
              </div>
            ))}
          </div>

          {/* Question Display Card */}
          <div className="bg-white p-5 rounded-3xl border-4 border-amber-300 shadow-md">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full mb-2 inline-block">
              Vitesse • {currentQuestion.section}
            </span>
            <h2 className="text-base font-extrabold text-gray-800 leading-snug">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Speed Answer buttons */}
          <div className="grid grid-cols-1 gap-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectIndex = index === currentQuestion.correctOptionIndex;

              let buttonStyle = "border-gray-200 bg-white hover:border-gray-300";
              if (isAnswered) {
                if (isCorrectIndex) {
                  buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800";
                } else if (isSelected) {
                  buttonStyle = "border-red-500 bg-red-50 text-red-800";
                } else {
                  buttonStyle = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                }
              } else if (isSelected) {
                buttonStyle = "border-amber-400 bg-amber-50 text-amber-800";
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-xl border-3 text-left font-bold text-sm transition-all flex items-center justify-between ${buttonStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrectIndex && <Check className="w-5 h-5 text-emerald-600" />}
                </button>
              );
            })}
          </div>

          {/* Next Speed Question action */}
          {isAnswered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl border-b-4 border-amber-700 uppercase"
              >
                {currentQuestionIndex + 1 === arenaQuestions.length ? "Voir les résultats" : "Question Suivante ➔"}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* FINAL PODIUM CEREMONY SCREEN */}
      {gameState === 'podium' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 rounded-3xl border-4 border-amber-400 shadow-xl text-center space-y-6"
          id="podium-container"
        >
          <Trophy className="w-16 h-16 text-amber-500 fill-amber-500 mx-auto animate-bounce" />
          
          <div>
            <h3 className="font-black text-2xl text-gray-800">Podium de l'Arène</h3>
            <p className="text-sm text-gray-400">Classement de la compétition de vitesse</p>
          </div>

          {/* Visual Podium blocks */}
          <div className="flex justify-center items-end gap-3 h-40 pt-4" id="visual-podium-bars">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center w-24">
                <span className="text-xs font-black text-gray-600">{leaderboard[1].name}</span>
                <span className="text-[10px] text-gray-400 font-bold">{leaderboard[1].score} pts</span>
                <div className="w-full h-16 bg-gray-200 border-t-4 border-gray-300 rounded-t-lg flex items-center justify-center font-black text-gray-600">
                  2nd
                </div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="flex flex-col items-center w-28">
                <span className="text-xs font-extrabold text-amber-600 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {leaderboard[0].name}
                </span>
                <span className="text-[10px] text-amber-500 font-black">{leaderboard[0].score} pts</span>
                <div className="w-full h-24 bg-amber-100 border-t-4 border-amber-400 rounded-t-lg flex items-center justify-center font-black text-amber-600">
                  1er 👑
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center w-24">
                <span className="text-xs font-black text-gray-500">{leaderboard[2].name}</span>
                <span className="text-[10px] text-gray-400 font-bold">{leaderboard[2].score} pts</span>
                <div className="w-full h-10 bg-orange-50 border-t-4 border-orange-200 rounded-t-lg flex items-center justify-center font-black text-orange-600">
                  3e
                </div>
              </div>
            )}
          </div>

          {/* Award message */}
          <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 font-bold text-gray-700 text-sm">
            {leaderboard[0].isUser ? (
              <span className="text-emerald-700">👑 Incroyable ! Tu as écrasé l'arène ! Tu remportes un bonus de 250 points de score pour ton palmarès TAFEM !</span>
            ) : (
              <span>Bien joué ! Tu as récolté {userScore} points d'arène. Continue à t'entraîner pour gravir la première place !</span>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onFinishArena(leaderboard[0].isUser ? 250 : 50)}
              className="w-full py-4 bg-[#58CC02] hover:bg-[#58CC02]/95 text-white font-extrabold rounded-2xl border-b-4 border-[#46A302] shadow-md uppercase cursor-pointer"
            >
              Enregistrer mes scores et quitter
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

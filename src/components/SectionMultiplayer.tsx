import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, User, Trophy, ShieldAlert, Zap, Play, ChevronLeft, Volume2, Star, Check, X, Sparkles, UserPlus, Clock, Send, RefreshCw, Award, Heart } from 'lucide-react';
import { Question } from '../types';
import { Mascot } from './Mascot';
import { playCorrectSound, playIncorrectSound, playComboSound } from '../utils/audio';
import {
  getFriends,
  saveFriends,
  getPendingRequests,
  savePendingRequests,
  sendFriendRequest,
  getUserLeagueScore,
  saveUserLeagueScore,
  simulateFriendsActiveScores,
  getLeagueTimeRemaining,
  Friend,
  FriendRequest
} from '../utils/friends';

interface SectionMultiplayerProps {
  questions: Question[];
  onFinishArena: (pointsEarned: number) => void;
  onCancel: () => void;
}

export const SectionMultiplayer: React.FC<SectionMultiplayerProps> = ({
  questions,
  onFinishArena,
  onCancel,
}) => {
  const [subView, setSubView] = useState<'selection' | 'lobby_25' | 'matchmaking_1v1' | 'game_25' | 'game_1v1' | 'results'>('selection');

  // Sub-tabs inside selection view: Arena vs. Friendly 3-Day League
  const [multiplayerTab, setMultiplayerTab] = useState<'arena' | 'league'>('arena');

  // Friends & League States
  const [friends, setFriends] = useState<Friend[]>(() => getFriends());
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>(() => getPendingRequests());
  const [friendInput, setFriendInput] = useState('');
  const [requestStatus, setRequestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [leagueScore, setLeagueScore] = useState(() => getUserLeagueScore());
  const [timeRemaining, setTimeRemaining] = useState(() => getLeagueTimeRemaining());

  // Ringo dialogue state
  const ringoBubble = "YOOO ! C'est Ringo ! T'as du muscle dans le cerveau ? Viens humilier tes rivaux ou crée ton club de 25 guerriers ! 🔥⚔️";

  // Host configuration for 25-player room
  const [qcmCount, setQcmCount] = useState<20 | 30 | 40 | 50>(20);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [isLobbyFull, setIsLobbyFull] = useState(false);

  // 1v1 states
  const [rivalName, setRivalName] = useState('');
  const [rivalCity, setRivalCity] = useState('');
  const [matchmakingPercent, setMatchmakingPercent] = useState(0);

  // Active game states
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timer, setTimer] = useState(15);

  // Score states
  const [userScore, setUserScore] = useState(0); // For 1v1 we use +3/-1
  const [rivalScore, setRivalScore] = useState(0);
  const [rivalIndex, setRivalIndex] = useState(0);

  // 25 players ranking list in real-time
  const [playerScores, setPlayerScores] = useState<{ name: string; score: number; progress: number }[]>([]);

  // Generate random room code
  const handleCreateRoom = () => {
    const code = 'TAF-' + Math.floor(100 + Math.random() * 900);
    setRoomCode(code);
    setPlayers(['Toi (Hôte)']);
    setSubView('lobby_25');
  };

  // Simulate players joining the 25-player room
  useEffect(() => {
    if (subView === 'lobby_25' && players.length < 25) {
      const names = [
        'Amine (Rabat)', 'Ghita (Casablanca)', 'Omar (Marrakech)', 'Yasmine (Fez)', 'Anas (Tangier)',
        'Salma (Agadir)', 'Mehdi (Oujda)', 'Kenza (Kenitra)', 'Rachid (Settat)', 'Imane (Meknes)',
        'Sami (El Jadida)', 'Noura (Dakhla)', 'Yassir (Nador)', 'Sofia (Laayoune)', 'Walid (Tetouan)',
        'Khadija (Beni Mellal)', 'Hamza (Safi)', 'Lina (Taroudant)', 'Zouhair (Khouribga)', 'Meryem (Taza)',
        'Ayoub (Ouarzazate)', 'Hiba (Mohammedia)', 'Adnane (Asilah)', 'Sara (Berkane)'
      ];

      const interval = setInterval(() => {
        setPlayers((prev) => {
          if (prev.length >= 25) {
            clearInterval(interval);
            setIsLobbyFull(true);
            return prev;
          }
          const nextPlayer = names[prev.length - 1];
          return [...prev, nextPlayer];
        });
      }, 350); // Fast list filling for dramatic fun effect

      return () => clearInterval(interval);
    }
  }, [subView, players]);

  // Launch 1v1 matchmaking
  const handleStart1v1Matchmaking = () => {
    setSubView('matchmaking_1v1');
    setMatchmakingPercent(0);
    const rivals = [
      { name: 'Driss', city: 'Casablanca' },
      { name: 'Laila', city: 'Rabat' },
      { name: 'Youssef', city: 'Agadir' },
      { name: 'Houda', city: 'Marrakech' },
      { name: 'Brahim', city: 'Fes' }
    ];
    const picked = rivals[Math.floor(Math.random() * rivals.length)];
    setRivalName(picked.name);
    setRivalCity(picked.city);
  };

  // 1v1 matchmaking progress simulation
  useEffect(() => {
    if (subView === 'matchmaking_1v1') {
      const interval = setInterval(() => {
        setMatchmakingPercent((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              // Select questions for 1v1 (always 5 quick questions)
              const selected = questions.slice(0, 5);
              setActiveQuestions(selected);
              setCurrentIndex(0);
              setUserScore(0);
              setRivalScore(0);
              setRivalIndex(0);
              setTimer(15);
              setSelectedOption(null);
              setIsAnswered(false);
              setSubView('game_1v1');
            }, 800);
            return 100;
          }
          return p + 20;
        });
      }, 400);
      return () => clearInterval(interval);
    }
  }, [subView]);

  // Start 25 Player Battle
  const handleStart25PlayerBattle = () => {
    // Pick the chosen qcmCount questions
    const selected = Array.from({ length: qcmCount }, (_, i) => questions[i % questions.length]);
    setActiveQuestions(selected);
    setCurrentIndex(0);
    setUserScore(0);
    setTimer(15);
    setSelectedOption(null);
    setIsAnswered(false);

    // Initial scores for all 25 players
    const initialScores = players.map((name, i) => ({
      name,
      score: 0,
      progress: 0,
    }));
    setPlayerScores(initialScores);
    setSubView('game_25');
  };

  // Timer Countdown loop for games
  useEffect(() => {
    let interval: any;
    if ((subView === 'game_1v1' || subView === 'game_25') && timer > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswerSelect(-1); // timeout counts as wrong
    }
    return () => clearInterval(interval);
  }, [timer, isAnswered, subView]);

  // Rival answering simulation (1v1)
  useEffect(() => {
    if (subView === 'game_1v1' && !isAnswered && timer > 0) {
      const rivalAnswerInterval = setTimeout(() => {
        if (Math.random() > 0.4) {
          const correct = Math.random() > 0.3; // 70% accuracy
          setRivalScore((prev) => prev + (correct ? 3 : -1));
          setRivalIndex((prev) => prev + 1);
        }
      }, 4000 + Math.random() * 4000);

      return () => clearTimeout(rivalAnswerInterval);
    }
  }, [subView, currentIndex, isAnswered]);

  // Simulate other 24 competitors answering questions (25-player mode)
  useEffect(() => {
    if (subView === 'game_25' && !isAnswered) {
      const interval = setInterval(() => {
        setPlayerScores((prevScores) =>
          prevScores.map((p) => {
            if (p.name.includes('Toi')) return p; // user score handled separately
            // If they haven't finished this question, maybe they do
            if (p.progress === currentIndex) {
              const answersThisTick = Math.random() > 0.5;
              if (answersThisTick) {
                const correct = Math.random() > 0.4;
                return {
                  ...p,
                  score: p.score + (correct ? 100 + timer * 5 : 0),
                  progress: p.progress + 1,
                };
              }
            }
            return p;
          })
        );
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [subView, currentIndex, isAnswered]);

  const handleAnswerSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const q = activeQuestions[currentIndex];
    const correct = optionIdx === q.correctOptionIndex;

    if (subView === 'game_1v1') {
      const scoreDelta = correct ? 3 : -1;
      const newUserScore = userScore + scoreDelta;
      setUserScore(newUserScore);

      if (correct) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Sync rival answers if they haven't yet
      setTimeout(() => {
        setRivalScore((prev) => prev + (Math.random() > 0.35 ? 3 : -1));
        setRivalIndex((prev) => prev + 1);
      }, 800);
    } else if (subView === 'game_25') {
      const points = correct ? 500 + timer * 25 : 0;
      setUserScore((prev) => prev + points);

      if (correct) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Update user in player scores list
      setPlayerScores((prev) =>
        prev.map((p) => (p.name.includes('Toi') ? { ...p, score: p.score + points, progress: p.progress + 1 } : p))
      );
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimer(15);
    } else {
      setSubView('results');
    }
  };

  // --- FRIENDS & LEAGUE ACTIONS ---
  
  // Update countdown timer and scores periodically
  useEffect(() => {
    let interval: any;
    if (subView === 'selection') {
      interval = setInterval(() => {
        setTimeRemaining(getLeagueTimeRemaining());
        setLeagueScore(getUserLeagueScore());
      }, 30000); // every 30s
    }
    return () => clearInterval(interval);
  }, [subView]);

  // Sync league score whenever we view selection
  useEffect(() => {
    if (subView === 'selection') {
      setLeagueScore(getUserLeagueScore());
      setFriends(getFriends());
      setPendingRequests(getPendingRequests());
    }
  }, [subView]);

  const handleAcceptRequest = (reqId: string) => {
    const pended = getPendingRequests();
    const item = pended.find(r => r.id === reqId);
    if (!item) return;

    // Remove from pending
    const updatedPending = pended.filter(r => r.id !== reqId);
    setPendingRequests(updatedPending);
    savePendingRequests(updatedPending);

    // Add to friends
    const currentFriends = getFriends();
    const newFriend: Friend = {
      id: item.id,
      username: item.username,
      avatar: item.avatar,
      targetSchool: item.targetSchool,
      status: 'Studying',
      friendCode: item.friendCode,
      leagueScore: 120 + Math.floor(Math.random() * 8) * 10,
    };
    const updatedFriends = [...currentFriends, newFriend];
    setFriends(updatedFriends);
    saveFriends(updatedFriends);

    playComboSound(); // happy chime!
  };

  const handleDeclineRequest = (reqId: string) => {
    const pended = getPendingRequests();
    const updatedPending = pended.filter(r => r.id !== reqId);
    setPendingRequests(updatedPending);
    savePendingRequests(updatedPending);
    playIncorrectSound(); // sad chime
  };

  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendInput.trim()) return;

    const res = sendFriendRequest(friendInput);
    if (res.success && res.target) {
      setRequestStatus({ success: true, message: res.message });
      setFriendInput('');

      // Simulate friend accepting after 2 seconds
      const targetUser = res.target;
      setTimeout(() => {
        const currentFriends = getFriends();
        const exists = currentFriends.some(f => f.friendCode === targetUser.friendCode);
        if (!exists) {
          const newFriend: Friend = {
            id: targetUser.id,
            username: targetUser.username,
            avatar: targetUser.avatar,
            targetSchool: targetUser.targetSchool,
            status: 'Online',
            friendCode: targetUser.friendCode,
            leagueScore: 150 + Math.floor(Math.random() * 5) * 10,
          };
          const updated = [...currentFriends, newFriend];
          setFriends(updated);
          saveFriends(updated);
          playCorrectSound(); // accept sound
          setRequestStatus({ success: true, message: `🎉 ${targetUser.username} a accepté votre demande d'ami !` });
        }
      }, 2500);
    } else {
      setRequestStatus({ success: false, message: res.message });
    }

    setTimeout(() => {
      setRequestStatus(null);
    }, 4500);
  };

  const handleRefreshLeague = () => {
    simulateFriendsActiveScores();
    setFriends(getFriends());
    setLeagueScore(getUserLeagueScore());
    setTimeRemaining(getLeagueTimeRemaining());
    playCorrectSound();
  };

  // Helper sorting for scoreboard
  const finalLeaderboard = [...playerScores].sort((a, b) => b.score - a.score);
  const userRank = finalLeaderboard.findIndex((p) => p.name.includes('Toi')) + 1;

  return (
    <div className="max-w-xl mx-auto px-4 pb-10" id="section-multiplayer">
      <AnimatePresence mode="wait">
        {/* SELECTION HOME SCREEN */}
        {subView === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Ringo Mascot Friend */}
            <Mascot expression="happy" bubbleText={ringoBubble} name="Ringo l'Ours" animal="bear" />

            {/* Sub Tabs Selection: Arena vs. Friendly Championship */}
            <div className="flex bg-gray-200/60 p-1.5 rounded-3xl border border-gray-300/40 gap-1" id="sub-tabs-multiplayer">
              <button
                onClick={() => { setMultiplayerTab('arena'); playCorrectSound(); }}
                className={`flex-grow py-3 text-xs font-black uppercase rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  multiplayerTab === 'arena'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_0_0_#4338ca] border border-indigo-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-sub-tab-arena"
              >
                <Zap className="w-4 h-4" />
                Arène Publique
              </button>
              <button
                onClick={() => { setMultiplayerTab('league'); playCorrectSound(); }}
                className={`flex-grow py-3 text-xs font-black uppercase rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  multiplayerTab === 'league'
                    ? 'bg-indigo-600 text-white shadow-[0_4px_0_0_#4338ca] border border-indigo-700'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                id="btn-sub-tab-league"
              >
                <Trophy className="w-4 h-4" />
                Ligue & Amis 🏆
              </button>
            </div>

            {/* TAB A: PUBLIC ARENA */}
            {multiplayerTab === 'arena' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="arena-cards-container">
                {/* Duel 1v1 selection */}
                <motion.button
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleStart1v1Matchmaking}
                  className="flex flex-col text-left p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl border-4 border-amber-600 shadow-[0_6px_0_0_#d97706] cursor-pointer"
                  id="btn-multi-1v1"
                >
                  <div className="flex justify-between items-center w-full mb-3">
                    <div className="p-3.5 bg-white/20 rounded-2xl">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] bg-white text-orange-600 font-extrabold px-2.5 py-1 rounded-full uppercase">
                      Duel Rapide
                    </span>
                  </div>
                  <h3 className="font-black text-xl mb-1">DUEL 1v1 DE CHOC</h3>
                  <p className="text-xs text-amber-50/90 leading-normal">
                    Règles du ring : <strong>+3 points</strong> par bonne réponse, <strong>-1 point</strong> par erreur ! Affronte un candidat en direct.
                  </p>
                </motion.button>

                {/* 25 Player Room creation */}
                <motion.button
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCreateRoom}
                  className="flex flex-col text-left p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl border-4 border-indigo-700 shadow-[0_6px_0_0_#4338ca] cursor-pointer"
                  id="btn-multi-25"
                >
                  <div className="flex justify-between items-center w-full mb-3">
                    <div className="p-3.5 bg-white/20 rounded-2xl">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-[10px] bg-white text-indigo-600 font-extrabold px-2.5 py-1 rounded-full uppercase">
                      Jusqu'à 25 Joueurs
                    </span>
                  </div>
                  <h3 className="font-black text-xl mb-1">SALON MULTI (MAX 25)</h3>
                  <p className="text-xs text-indigo-50/90 leading-normal">
                    Crée ton propre salon de jeu, partage un code d'invitation avec ton groupe de révision, et jouez tous ensemble !
                  </p>
                </motion.button>
              </div>
            )}

            {/* TAB B: FRIENDLY 3-DAY LEAGUE */}
            {multiplayerTab === 'league' && (
              <div className="space-y-6 animate-fade-in" id="league-friends-view">
                {/* 1. Season Timer & Description Card */}
                <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white p-5 rounded-3xl border-4 border-amber-600 shadow-[0_6px_0_0_#d97706] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      Saison de 3 Jours
                    </span>
                    <span className="text-xs font-black bg-white text-amber-600 px-3 py-1 rounded-full uppercase">
                      Période active
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-black text-xl flex items-center gap-2">
                      <Trophy className="w-6 h-6" />
                      LIGUE DES AMIS (3-JOURS)
                    </h3>
                    <p className="text-xs text-amber-50/90 leading-relaxed mt-1">
                      Chaque bonne réponse dans n'importe quel mode d'entraînement rapporte <strong>+10 pts</strong> de Ligue. Plus ta série de combo augmente, plus tu gagnes de bonus (jusqu'à <strong>+40 pts</strong> supplémentaires) !
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-black/15 p-3 rounded-2xl flex items-center justify-between border border-white/10 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <Clock className="w-4 h-4 text-amber-200" />
                      <span>Saison se réinitialise dans :</span>
                    </div>
                    <span className="font-mono font-black text-sm bg-white/25 px-2.5 py-1 rounded-lg">
                      {timeRemaining}
                    </span>
                  </div>
                </div>

                {/* 2. Leaderboard Card */}
                <div className="bg-white p-5 rounded-3xl border-4 border-indigo-200 shadow-[4px_4px_0_0_#e0e7ff] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-black text-sm text-gray-700 uppercase tracking-wider">
                        Classement de la Ligue
                      </h4>
                    </div>
                    
                    <button
                      onClick={handleRefreshLeague}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-black uppercase"
                      title="Actualiser les scores des amis"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Actualiser</span>
                    </button>
                  </div>

                  {/* Leaderboard list container */}
                  <div className="space-y-2">
                    {(() => {
                      // Construct sorted participants
                      const participants = [
                        { id: 'user', username: 'Toi', avatar: '👑', targetSchool: 'Mon ENCG', status: 'Online' as const, leagueScore: leagueScore },
                        ...friends
                      ].sort((a, b) => b.leagueScore - a.leagueScore);

                      return participants.map((p, idx) => {
                        const isMe = p.id === 'user';
                        const rankColors = [
                          'bg-amber-100 text-amber-800 border-amber-300 ring-amber-400',
                          'bg-slate-100 text-slate-800 border-slate-300 ring-slate-400',
                          'bg-orange-100 text-orange-800 border-orange-300 ring-orange-400'
                        ];
                        
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                              isMe 
                                ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                                : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Rank badge */}
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border ${
                                idx < 3 ? rankColors[idx] : 'bg-gray-200 text-gray-600 border-gray-300'
                              }`}>
                                {idx + 1}
                              </div>

                              {/* Avatar */}
                              <div className="text-2xl">{p.avatar}</div>

                              {/* Name & Target */}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-black text-xs ${isMe ? 'text-indigo-800' : 'text-gray-700'}`}>
                                    {p.username}
                                  </span>
                                  {isMe && (
                                    <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">
                                      Toi
                                    </span>
                                  )}
                                  
                                  {/* Status indicator */}
                                  <span 
                                    className={`w-2 h-2 rounded-full ${
                                      p.status === 'Online' 
                                        ? 'bg-emerald-500 animate-pulse' 
                                        : p.status === 'Studying' 
                                          ? 'bg-amber-500 animate-bounce' 
                                          : 'bg-gray-300'
                                    }`}
                                    title={p.status}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold block">
                                  Cible : {p.targetSchool}
                                </span>
                              </div>
                            </div>

                            {/* Score info */}
                            <div className="text-right">
                              <span className={`font-black text-sm block ${isMe ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {p.leagueScore} <span className="text-[10px] font-black text-gray-400">PTS</span>
                              </span>
                              {idx === 0 && <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider block">🏆 Leader</span>}
                            </div>
                          </motion.div>
                        );
                      });
                    })()}
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-center text-[11px] text-gray-500 font-semibold leading-relaxed">
                    💡 Entraîne-toi en <strong>Répétition Espacée</strong> ou en <strong>Mode Solo</strong> pour marquer des points de Ligue de manière autonome et sécuriser ton classement !
                  </div>
                </div>

                {/* 3. Manage Friends Box */}
                <div className="bg-white p-5 rounded-3xl border-4 border-indigo-200 shadow-[4px_4px_0_0_#e0e7ff] space-y-4">
                  <div className="flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-black text-sm text-gray-700 uppercase tracking-wider">
                      Gestion des Amis & Invitations
                    </h4>
                  </div>

                  {/* Add Friend Form */}
                  <form onSubmit={handleSendRequestSubmit} className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      ✉️ Envoyer une demande d'ami (Saisir un Code d'Ami ou Nom)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={friendInput}
                        onChange={(e) => setFriendInput(e.target.value)}
                        placeholder="Ex: TAF-504-SOF ou Kenza"
                        className="flex-grow px-4 py-3 text-xs bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-indigo-400 focus:outline-none font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 border-indigo-700 border-b-4 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer</span>
                      </button>
                    </div>
                  </form>

                  {/* Feedback status */}
                  <AnimatePresence>
                    {requestStatus && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-3 rounded-xl text-xs font-bold ${
                          requestStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {requestStatus.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pending requests received */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-2.5 pt-2 border-t border-gray-100">
                      <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        📩 Demandes Reçues en Attente :
                      </span>
                      {pendingRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{req.avatar}</span>
                            <div>
                              <p className="text-xs font-black text-gray-700">{req.username}</p>
                              <p className="text-[9px] text-gray-400 font-bold">Cible : {req.targetSchool}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleAcceptRequest(req.id)}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg cursor-pointer"
                              title="Accepter"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(req.id)}
                              className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                              title="Refuser"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Info about own code */}
                  <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between text-xs">
                    <div className="font-bold text-gray-500">
                      🗝️ Ton propre Code d'Ami :
                    </div>
                    <span className="font-mono font-black text-indigo-700 bg-white border border-indigo-100 px-3 py-1 rounded-xl uppercase tracking-wider select-all">
                      TAFEM-PRO-750
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 25 PLAYERS LOBBY HOST PANEL */}
        {subView === 'lobby_25' && (
          <motion.div
            key="lobby_25"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white p-6 rounded-3xl border-4 border-indigo-300 shadow-[6px_6px_0_0_#c7d2fe] space-y-6 text-center"
            id="lobby-25-container"
          >
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
              <button onClick={() => setSubView('selection')} className="text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h3 className="font-black text-lg text-indigo-700">Configuration du Salon</h3>
              <div className="w-6 h-6" />
            </div>

            {/* Chosen Question QCM Count Selection with Funny Animation */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                ⚙️ HÔTE : CHOISIS LA QUANTITÉ DE QCM POUR CETTE PARTIE
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 40, 50].map((num) => (
                  <motion.button
                    key={num}
                    whileHover={{ scale: 1.1, rotate: [0, 3, -3, 0] }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQcmCount(num as any)}
                    className={`py-3 rounded-2xl font-black border-3 text-sm transition-all cursor-pointer ${
                      qcmCount === num
                        ? 'bg-indigo-500 border-indigo-700 text-white shadow-md'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-300'
                    }`}
                  >
                    {num} QCM
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Share Code panel */}
            <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Code de partage (à envoyer à tes amis)
              </span>
              <h2 className="text-3xl font-black text-indigo-600 tracking-wider animate-pulse select-all" id="room-code-display">
                {roomCode}
              </h2>
            </div>

            {/* Real-time players connected list */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase">
                  Joueurs connectés ({players.length}/25)
                </span>
                {isLobbyFull && (
                  <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    Complet !
                  </span>
                )}
              </div>

              <div 
                className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5 text-[11px] font-bold text-gray-600"
                id="connected-players-list"
              >
                {players.map((p, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 p-1 bg-white border rounded-lg"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="truncate">{p}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Launch Game button */}
            <button
              onClick={handleStart25PlayerBattle}
              disabled={players.length < 3}
              className={`w-full py-4 font-black text-base rounded-2xl border-b-4 uppercase tracking-wider flex items-center justify-center gap-2 ${
                players.length < 3
                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-[#58CC02] hover:bg-[#58CC02]/95 border-[#46A302] text-white shadow-md active:translate-y-0.5'
              }`}
              id="btn-start-25-battle"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Démarrer le Tournoi ({qcmCount} QCM)</span>
            </button>
            {players.length < 3 && (
              <p className="text-[10px] text-gray-400">Attente de la connexion d'au moins 3 candidats...</p>
            )}
          </motion.div>
        )}

        {/* 1V1 MATCHMAKING SCREEN */}
        {subView === 'matchmaking_1v1' && (
          <motion.div
            key="matchmaking_1v1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-3xl border-4 border-amber-300 shadow-[6px_6px_0_0_#fde68a] text-center space-y-6"
            id="matchmaking-1v1-container"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-amber-600 flex items-center gap-1.5">
                <Users className="w-5 h-5" />
                Arène de Duel 1v1
              </h3>
              <button onClick={() => setSubView('selection')} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 flex justify-around items-center relative">
              {/* User Avatar */}
              <div className="flex flex-col items-center gap-1 w-24">
                <div className="w-16 h-16 bg-indigo-100 rounded-full border-4 border-indigo-400 flex items-center justify-center text-3xl shadow-md">
                  🧑‍🎓
                </div>
                <span className="text-xs font-black text-gray-700">Toi</span>
              </div>

              {/* Verses indicator with loading spark */}
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 bg-amber-500 rounded-full text-white font-black text-lg flex items-center justify-center border-4 border-white shadow-md animate-bounce">
                  VS
                </div>
                <span className="text-[10px] text-gray-400 mt-2 font-bold animate-pulse">RECHERCHE...</span>
              </div>

              {/* Rival Avatar (Reveals as progress increases) */}
              <div className="flex flex-col items-center gap-1 w-24">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl shadow-md transition-all duration-300 ${
                  matchmakingPercent >= 60 
                    ? 'bg-rose-100 border-rose-400 scale-100' 
                    : 'bg-gray-100 border-dashed border-gray-300 scale-90 opacity-40'
                }`}>
                  {matchmakingPercent >= 60 ? '🎓' : '?'}
                </div>
                <span className="text-xs font-black text-gray-700">
                  {matchmakingPercent >= 60 ? rivalName : '???'}
                </span>
                {matchmakingPercent >= 60 && (
                  <span className="text-[9px] text-gray-400 uppercase font-black">{rivalCity}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${matchmakingPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">
                Recherche d'un candidat disponible au Maroc...
              </p>
            </div>
          </motion.div>
        )}

        {/* 1V1 ACTIVE MATCH SCREEN (+3 / -1 Rule) */}
        {subView === 'game_1v1' && (
          <motion.div
            key="game_1v1"
            className="space-y-4"
            id="arena-1v1-play"
          >
            {/* Duel Scoreboard bar */}
            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border-4 border-amber-300 shadow-md">
              {/* User stats */}
              <div className="text-center">
                <span className="block text-[10px] font-black text-indigo-500 uppercase">Toi</span>
                <span className="text-xl font-black text-indigo-700">{userScore} pts</span>
              </div>

              {/* Current Status Badge */}
              <div className="flex flex-col items-center justify-center bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[9px] font-black text-amber-600 uppercase">Question</span>
                <span className="text-sm font-black text-gray-700">{currentIndex + 1}/5</span>
              </div>

              {/* Rival stats */}
              <div className="text-center">
                <span className="block text-[10px] font-black text-rose-500 uppercase">{rivalName}</span>
                <span className="text-xl font-black text-rose-700">{rivalScore} pts</span>
              </div>
            </div>

            {/* Duel Progress Tracks */}
            <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 space-y-2 text-xs font-extrabold">
              {/* User track */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Ton Avancement</span>
                  <span>{currentIndex}/5</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${(currentIndex / 5) * 100}%` }} />
                </div>
              </div>

              {/* Rival track */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Avancement de {rivalName}</span>
                  <span>{rivalIndex}/5</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${(rivalIndex / 5) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Question Display Card */}
            <div className="bg-white p-5 rounded-3xl border-4 border-amber-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-2 right-2 text-xs font-black px-3 py-1 bg-red-500 text-white rounded-full animate-pulse">
                ⏱️ {timer}s
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full mb-1.5 inline-block">
                DUEL • {activeQuestions[currentIndex]?.section}
              </span>
              <h2 className="text-sm font-extrabold text-gray-800 leading-snug">
                {activeQuestions[currentIndex]?.text}
              </h2>
            </div>

            {/* Answer choices */}
            <div className="grid grid-cols-1 gap-2">
              {activeQuestions[currentIndex]?.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === activeQuestions[currentIndex].correctOptionIndex;

                let btnStyle = "border-gray-200 bg-white hover:border-gray-300";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (isSelected) {
                    btnStyle = "border-red-500 bg-red-50 text-red-800";
                  } else {
                    btnStyle = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3.5 rounded-2xl border-3 text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* Next question */}
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl border-b-4 border-amber-700 uppercase shadow-md cursor-pointer"
              >
                {currentIndex + 1 === activeQuestions.length ? 'Terminer le duel' : 'Question suivante ➔'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 25-PLAYER ACTIVE GAME SCREEN */}
        {subView === 'game_25' && (
          <motion.div
            key="game_25"
            className="space-y-4"
            id="arena-25-play"
          >
            {/* Header progress info */}
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-4 border-indigo-300 shadow-md">
              <span className="text-xs font-black text-gray-700">
                Tournoi : QCM {currentIndex + 1}/{activeQuestions.length}
              </span>
              <div className="px-3 py-1 bg-red-500 text-white font-black text-xs rounded-full animate-pulse">
                ⏱️ {timer}s
              </div>
              <span className="text-xs font-black text-indigo-600">
                Tes Points : {userScore}
              </span>
            </div>

            {/* Quick real-time leader-board summary of top players */}
            <div className="bg-white p-3.5 rounded-2xl border-2 border-gray-100 space-y-2">
              <span className="block text-[9px] font-black text-gray-400 uppercase">Classement en direct (Top 4)</span>
              <div className="grid grid-cols-4 gap-1.5">
                {finalLeaderboard.slice(0, 4).map((p, idx) => (
                  <div 
                    key={idx} 
                    className={`p-1.5 rounded-lg border text-center font-bold text-[10px] ${
                      p.name.includes('Toi') 
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-extrabold' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="block font-black text-[9px]">#{idx + 1}</span>
                    <span className="truncate block w-full">{p.name.split(' ')[0]}</span>
                    <span className="text-[8px] opacity-75">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question display card */}
            <div className="bg-white p-5 rounded-3xl border-4 border-indigo-300 shadow-sm text-left">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full mb-1.5 inline-block">
                MULTIPLATEFORME • {activeQuestions[currentIndex]?.section}
              </span>
              <h2 className="text-sm font-extrabold text-gray-800 leading-snug">
                {activeQuestions[currentIndex]?.text}
              </h2>
            </div>

            {/* Options selection */}
            <div className="grid grid-cols-1 gap-2">
              {activeQuestions[currentIndex]?.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === activeQuestions[currentIndex].correctOptionIndex;

                let btnStyle = "border-gray-200 bg-white hover:border-gray-300";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (isSelected) {
                    btnStyle = "border-red-500 bg-red-50 text-red-800";
                  } else {
                    btnStyle = "border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-3.5 rounded-2xl border-3 text-left font-bold text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* Next question button */}
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-2xl border-b-4 border-indigo-800 uppercase shadow-md cursor-pointer"
              >
                {currentIndex + 1 === activeQuestions.length ? 'Terminer la partie' : 'Question suivante ➔'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* RESULTS SCREEN */}
        {subView === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border-4 border-amber-400 shadow-xl text-center space-y-6"
            id="arena-results-container"
          >
            <Trophy className="w-16 h-16 text-amber-500 fill-amber-500 mx-auto animate-bounce" />
            
            <div>
              <h3 className="font-black text-2xl text-gray-800">Partie Terminée !</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Voici le palmarès final de la compétition
              </p>
            </div>

            {/* 1v1 specific results display */}
            {activeQuestions.length === 5 && !roomCode ? (
              <div className="space-y-4">
                <div className="flex justify-around items-center py-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                  <div className="text-center">
                    <span className="block text-xs font-black text-indigo-500 uppercase">Toi</span>
                    <span className="text-3xl font-black text-indigo-700">{userScore} pts</span>
                  </div>
                  <div className="font-black text-gray-400">vs</div>
                  <div className="text-center">
                    <span className="block text-xs font-black text-rose-500 uppercase">{rivalName}</span>
                    <span className="text-3xl font-black text-rose-700">{rivalScore} pts</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 font-bold text-gray-700 text-sm">
                  {userScore > rivalScore ? (
                    <span className="text-emerald-700">👑 Victoire écrasante ! Tu as vaincu {rivalName} de {rivalCity} ! Tu gagnes +300 points de palmarès ENCG !</span>
                  ) : userScore === rivalScore ? (
                    <span className="text-amber-700">⚖️ Égalité parfaite ! Un superbe affrontement d'esprits ! +100 points de palmarès.</span>
                  ) : (
                    <span className="text-rose-700">❌ Défaite ! {rivalName} a été plus rapide et plus précis. Révise encore un peu pour prendre ta revanche ! (+50 points de participation)</span>
                  )}
                </div>
              </div>
            ) : (
              // 25-player results display
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl text-center">
                  <p className="text-xs text-indigo-500 font-extrabold uppercase">Ton Classement final</p>
                  <h1 className="text-4xl font-black text-indigo-700">
                    #{userRank} <span className="text-xl">sur 25 joueurs</span>
                  </h1>
                  <p className="text-xs font-extrabold text-gray-500 mt-1">Score final : {userScore} pts</p>
                </div>

                <div className="space-y-2">
                  <span className="block text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                    🏆 Podium du Salon :
                  </span>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 space-y-1 text-xs">
                    {finalLeaderboard.slice(0, 3).map((p, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-2 rounded-xl font-bold ${
                          p.name.includes('Toi') ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-black text-indigo-600">#{idx + 1}</span>
                          <span>{p.name}</span>
                        </div>
                        <span>{p.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const gained = userScore > rivalScore ? 300 : userScore === rivalScore ? 100 : 50;
                onFinishArena(gained);
              }}
              className="w-full py-4 bg-[#58CC02] hover:bg-[#58CC02]/95 border-[#46A302] border-b-4 text-white font-black rounded-2xl shadow-md uppercase tracking-wider cursor-pointer"
            >
              Enregistrer mes scores et quitter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, BookOpen, Clock, HelpCircle, Layers, ArrowRight, Zap, Coffee } from 'lucide-react';
import { Question } from '../types';
import { Mascot } from './Mascot';
import { interleaveQuestionsByTopic } from '../utils/topicRotator';

interface SectionSoloProps {
  allQuestions: Question[];
  onStartSoloQuiz: (questions: Question[], modeTitle: string) => void;
}

export const SectionSolo: React.FC<SectionSoloProps> = ({
  allQuestions,
  onStartSoloQuiz,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Facile' | 'Moyen' | 'Difficile'>('Moyen');

  // Gordo the wise snail mascot bubble dialogue
  const gordoBubble = "Salut... C'est Gordo... Réviser pour le TAFEM, ça prend du temps. Mais petit à petit, l'escargot arrive à sa cible ! Entraîne-toi bien en mode Rapide ou Infini ! 🐌🍵";

  const handleStartQuickMode = () => {
    // Filter questions by difficulty
    let filtered = allQuestions.filter(q => q.difficulty === selectedDifficulty);
    if (filtered.length === 0) {
      filtered = allQuestions; // fallback if none match
    }

    // Rotate/interleave and slice to 20
    const rotated = interleaveQuestionsByTopic(filtered);
    const selected = rotated.slice(0, Math.min(rotated.length, 20));

    onStartSoloQuiz(selected, `EXPRESS (20 QCM - ${selectedDifficulty})`);
  };

  const handleStartUnlimitedMode = () => {
    // Rotated list of all questions to loop through infinitely
    const rotated = interleaveQuestionsByTopic(allQuestions);
    onStartSoloQuiz(rotated, "ENTRAÎNEMENT INFINI (MÉMORISATION)");
  };

  return (
    <div className="space-y-6" id="section-solo">
      {/* Mascot Friend Gordo */}
      <Mascot expression="neutral" bubbleText={gordoBubble} name="Gordo l'Escargot" animal="snail" />

      {/* Modes cards selection */}
      <div className="space-y-4" id="solo-modes-deck">
        
        {/* Mode 1: Quick Mode Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-4"
          id="card-quick-mode"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-800">Mode Express (20 QCM)</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Série rapide de 20 questions calibrées</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-normal">
            Parfait pour une session d'étude quotidienne concentrée. Sélectionne ta difficulté cible pour configurer la série d'apprentissage.
          </p>

          {/* Difficulty selector with cute wiggle hover */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Niveau de Difficulté :
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Facile', 'Moyen', 'Difficile'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`py-2 rounded-xl font-black text-xs border-2 transition-all cursor-pointer ${
                    selectedDifficulty === level
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300'
                  }`}
                >
                  {level}
                </motion.button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartQuickMode}
            className="w-full py-3.5 bg-[#58CC02] hover:bg-[#58CC02]/95 border-b-4 border-[#46A302] text-white font-black text-xs rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            id="btn-play-quick"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Démarrer la série express</span>
          </button>
        </motion.div>

        {/* Mode 2: Unlimited Mode Card */}
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-4"
          id="card-unlimited-mode"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-800">Mode Entraînement Infini</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Maîtrise absolue sans limites de cœurs</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-normal">
            Le mode d'apprentissage ultime par répétition. Réponds aux questions sans aucune limite. Les notions non acquises réapparaîtront automatiquement jusqu'à parfaite mémorisation !
          </p>

          <button
            onClick={handleStartUnlimitedMode}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 text-white font-black text-xs rounded-2xl shadow-md transition-all active:translate-y-0.5 active:border-b-2 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            id="btn-play-unlimited"
          >
            <Sparkles className="w-4 h-4 fill-indigo-200 text-white animate-pulse" />
            <span>Lancer l'entraînement infini</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
};

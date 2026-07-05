import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, AlertTriangle, XCircle, Brain, RefreshCw, Play, Save, ChevronLeft, Send, Info } from 'lucide-react';
import { Question } from '../types';
import { Mascot } from './Mascot';

interface AiHelperProps {
  onCancel: () => void;
  onPlayCustomQuiz: (questions: Question[]) => void;
  onSaveCustomQuestions: (questions: Question[]) => void;
}

interface AiResponse {
  isValid: 'correct' | 'partiellement_correct' | 'incorrect';
  correctionText: string;
  generatedQuestions: Question[];
}

export const AiHelper: React.FC<AiHelperProps> = ({
  onCancel,
  onPlayCustomQuiz,
  onSaveCustomQuestions,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiResponse | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Suggested TAFEM prompt pills for quick testing
  const suggestions = [
    "La Fête du Trône au Maroc est célébrée le 30 juillet depuis 1999.",
    "L'ENCG Settat est la première école de commerce créée au Maroc en 1984.",
    "La Banque Mondiale a été créée par l'accord du GATT à Genève en 1947.",
    "Le PIB mesure la richesse financière totale des résidents marocains à l'étranger."
  ];

  const handleVerify = async (textToVerify: string) => {
    if (!textToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/verify-culture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infoText: textToVerify })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la communication avec l'IA.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de se connecter au serveur IA.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: AiResponse['isValid']) => {
    switch (status) {
      case 'correct':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          badgeBg: 'bg-emerald-500',
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          label: 'Information Exacte 👑',
          mascotExp: 'cheering' as const,
          mascotBubble: "Incroyable ! Tes informations sont 100% correctes et conformes pour le concours TAFEM !"
        };
      case 'partiellement_correct':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          badgeBg: 'bg-amber-500',
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          label: 'Partiellement Correct ⚠️',
          mascotExp: 'thinking' as const,
          mascotBubble: "C'est presque ça, mais attention à certains détails importants pour l'examen TAFEM !"
        };
      case 'incorrect':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          badgeBg: 'bg-rose-500',
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          label: 'Erreurs Détectées 🛑',
          mascotExp: 'sad' as const,
          mascotBubble: "Aïe, il y a des contresens historiques ou économiques majeurs. Lis attentivement la correction !"
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200 text-gray-800',
          badgeBg: 'bg-gray-500',
          icon: <Info className="w-6 h-6 text-gray-600" />,
          label: 'Analyse Terminée',
          mascotExp: 'neutral' as const,
          mascotBubble: "Voici l'analyse détaillée de tes informations générales."
        };
    }
  };

  const currentStatusConfig = result ? getStatusConfig(result.isValid) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12" id="ai-helper-view">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          id="btn-ai-helper-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse fill-indigo-200" />
            Vérificateur IA de Fiches
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
            Évalue tes notes et génère des QCMs TAFEM personnalisés !
          </p>
        </div>
      </div>

      {/* Intro Mascot card */}
      {!result && !loading && (
        <div className="mb-6">
          <Mascot 
            expression="neutral" 
            bubbleText="Colle ici tes notes de révision, un QCM à tester ou un fait d'actualité. Je vais vérifier s'ils sont corrects pour le TAFEM et te créer 3 questions de révision !" 
          />
        </div>
      )}

      {/* Main Form container */}
      <AnimatePresence mode="wait">
        {!loading && !result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-4"
          >
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-2">
                Texte d'information ou Notes de culture générale :
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Exemple : Sa Majesté le Roi Mohammed VI a lancé l'INDH le 18 mai 2005 au Maroc..."
                rows={5}
                className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium text-sm text-gray-700 placeholder-gray-400"
                id="ai-info-textarea"
              />
            </div>

            {/* Suggested Pills */}
            <div className="space-y-2">
              <span className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                💡 Suggestions d'exemples à tester :
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(sug)}
                    className="px-3.5 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 text-gray-600 hover:text-indigo-700 font-semibold text-xs rounded-xl border border-gray-200 transition-all text-left max-w-full truncate cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3.5 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-bold text-xs">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={() => handleVerify(inputText)}
              disabled={!inputText.trim()}
              className={`w-full py-4 text-white font-black text-base rounded-2xl border-b-4 transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                !inputText.trim()
                  ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800 shadow-md active:translate-y-0.5 cursor-pointer'
              }`}
              id="btn-submit-verify-ai"
            >
              <Send className="w-5 h-5" />
              <span>Vérifier par l'IA et créer des QCMs</span>
            </button>
          </motion.div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-8 rounded-3xl border-4 border-indigo-400 shadow-[6px_6px_0_0_#cbd5e1] text-center space-y-6 flex flex-col items-center justify-center"
            id="ai-loading-container"
          >
            <div className="relative w-24 h-24">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 animate-ping" />
              <div className="relative p-5 bg-indigo-600 rounded-full text-white w-20 h-20 flex items-center justify-center">
                <Brain className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="font-black text-lg text-indigo-900">Analyse de l'IA en cours...</h3>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase">
                Vérification des faits historiques & génération des questions d'entraînement
              </p>
            </div>

            <div className="w-1/2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 w-full animate-pulse" />
            </div>

            <p className="text-xs text-gray-500 font-medium italic">
              "L'IA compare vos données avec l'historique officiel du concours TAFEM."
            </p>
          </motion.div>
        )}

        {/* RESULTS SUMMARY */}
        {result && currentStatusConfig && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
            id="ai-result-panel"
          >
            {/* Mascot explaining result status */}
            <Mascot expression={currentStatusConfig.mascotExp} bubbleText={currentStatusConfig.mascotBubble} />

            {/* Validation Overview Card */}
            <div className={`p-5 rounded-3xl border-4 shadow-md space-y-3 ${currentStatusConfig.bg}`}>
              <div className="flex items-center gap-2">
                {currentStatusConfig.icon}
                <span className={`px-2.5 py-0.5 rounded-full text-white font-extrabold text-xs uppercase ${currentStatusConfig.badgeBg}`}>
                  {currentStatusConfig.label}
                </span>
              </div>
              <p className="text-sm font-extrabold uppercase tracking-wider text-gray-500 border-b pb-1.5 border-gray-200">
                🔍 ÉVALUATION ET EXPLICATION DE L'IA :
              </p>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {result.correctionText}
              </p>
            </div>

            {/* Dynamic Generated QCM list */}
            <div className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#cbd5e1] space-y-4">
              <h3 className="font-black text-base text-gray-800 flex items-center gap-2 border-b-2 border-gray-100 pb-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Vos 3 QCMs IA sur-mesure générés :
              </h3>

              <div className="space-y-3">
                {result.generatedQuestions.map((q, index) => (
                  <div key={q.id || index} className="p-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-1 text-left">
                    <div className="flex justify-between items-center text-[10px] font-extrabold uppercase text-indigo-600">
                      <span>Question #{index + 1}</span>
                      <span className="bg-indigo-100 px-2 py-0.5 rounded-full">{q.section}</span>
                    </div>
                    <p className="font-extrabold text-xs text-gray-700 leading-snug">
                      {q.text}
                    </p>
                    <div className="grid grid-cols-2 gap-1 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`px-2.5 py-1.5 rounded-xl border-2 text-[10px] font-semibold ${
                            oIdx === q.correctOptionIndex 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold' 
                              : 'bg-white border-gray-200 text-gray-500'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interaction Call-To-Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Play the custom Quiz */}
                <button
                  onClick={() => onPlayCustomQuiz(result.generatedQuestions)}
                  className="w-full py-3.5 bg-[#58CC02] hover:bg-[#58CC02]/95 text-white font-extrabold rounded-2xl border-b-4 border-[#46A302] shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Jouer ce Quiz (+30 XP)</span>
                </button>

                {/* Save Questions to Leitner SRS */}
                <button
                  onClick={() => {
                    onSaveCustomQuestions(result.generatedQuestions);
                    setIsSaved(true);
                  }}
                  disabled={isSaved}
                  className={`w-full py-3.5 text-white font-extrabold rounded-2xl border-b-4 shadow-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer ${
                    isSaved
                      ? 'bg-gray-400 border-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  <span>{isSaved ? 'Enregistré dans le SRS !' : 'Ajouter aux boîtes SRS'}</span>
                </button>
              </div>
            </div>

            {/* Test another fact */}
            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-sm transition-all border-b-2 border-indigo-600 pb-0.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tester d'autres notes de révision</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

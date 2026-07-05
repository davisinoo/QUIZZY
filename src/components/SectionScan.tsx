import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, FileUp, Sparkles, Brain, Save, Play, RefreshCw, Send, CheckCircle, Smartphone, AlertCircle, Info } from 'lucide-react';
import { Question } from '../types';
import { Mascot } from './Mascot';
import { playCorrectSound, playComboSound } from '../utils/audio';

interface SectionScanProps {
  onPlayCustomQuiz: (questions: Question[]) => void;
  onSaveCustomQuestions: (questions: Question[]) => void;
}

interface ScanResponse {
  isValid: 'correct' | 'partiellement_correct' | 'incorrect';
  correctionText: string;
  generatedQuestions: Question[];
}

export const SectionScan: React.FC<SectionScanProps> = ({
  onPlayCustomQuiz,
  onSaveCustomQuestions,
}) => {
  const [sourceType, setSourceType] = useState<'camera' | 'upload' | 'text'>('camera');
  const [inputText, setInputText] = useState('');
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Zack dialogue bubbles
  const zackBubble = "BEEP-BOOP ! Salut l'humain ! Je suis Zack, l'ordinateur-robot de l'école ! Prends en photo tes fiches poussiéreuses ou tes feuilles d'examen, et je vais les digitaliser instantanément en QCM interactifs ! 🤖🔌";

  const handleCapturePhoto = () => {
    // Trigger shutter sound & flash
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 150);

    // Simulated exam paper photo preview
    setScannedImage("https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400");
    setFileName("Photo_Examen_Tafem.png");
    setInputText("Sujet d'examen d'institutions marocaines : Le Maroc a réintégré l'Union Africaine en 2017 lors du sommet d'Addis-Abeba. Sa Majesté le Roi est le Chef Suprême des Forces Armées Royales (FAR).");
    setSourceType('text'); // switch to show text preview
  };

  const handleFileUploadSimulate = () => {
    setFileName("Fiche_Revision_Eco.pdf");
    setInputText("Note de révision de macroéconomie : La croissance du PIB marocain est fortement corrélée à la pluviométrie en raison de l'importance du secteur agricole (environ 14% du PIB). Bank Al-Maghrib est responsable de la stabilité des prix et cible une inflation maîtrisée.");
    setSourceType('text');
  };

  const handleProcessScan = async () => {
    const textToProcess = inputText.trim() || "Fiche de révision TAFEM de culture générale sur le Maroc, ses institutions et son économie.";
    setLoading(true);
    setError(null);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/verify-culture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infoText: textToProcess })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de l'analyse avec Zack.");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connexion au processeur Zack interrompue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="section-scan">
      {/* Shutter flash screen overlay */}
      {shutterFlash && (
        <div className="fixed inset-0 bg-white z-[200] transition-opacity duration-100" />
      )}

      {/* Mascot Friend Zack */}
      <Mascot expression={loading ? 'thinking' : result ? 'cheering' : 'happy'} bubbleText={zackBubble} name="Zack le Robot" />

      {/* Selection screen */}
      <AnimatePresence mode="wait">
        {!loading && !result && (
          <motion.div
            key="scan-home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-5 rounded-3xl border-4 border-gray-200 shadow-[4px_4px_0_0_#e5e7eb] space-y-5"
          >
            {/* Nav pills */}
            <div className="flex border-b border-gray-100 pb-2.5">
              {(['camera', 'upload', 'text'] as const).map((source) => (
                <button
                  key={source}
                  onClick={() => setSourceType(source)}
                  className={`flex-1 py-2 font-black text-xs uppercase transition-all border-b-3 ${
                    sourceType === source
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {source === 'camera' ? '📷 Prendre Photo' : source === 'upload' ? '📁 Fichier' : '📝 Saisir Texte'}
                </button>
              ))}
            </div>

            {/* Source body panels */}
            {sourceType === 'camera' && (
              <div className="space-y-4">
                {/* Simulated Lens Viewfinder */}
                <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl border-4 border-gray-800 overflow-hidden flex flex-col items-center justify-center text-white" id="camera-viewfinder">
                  {/* Grid lines and focal circle */}
                  <div className="absolute inset-0 border border-white/10 flex items-center justify-center">
                    <div className="w-24 h-24 border border-dashed border-white/20 rounded-full animate-pulse" />
                  </div>
                  <div className="absolute top-3 left-3 text-[10px] font-black text-[#58CC02] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>ZACK LENS V2.0 (LIVE)</span>
                  </div>

                  <Camera className="w-12 h-12 text-gray-500 mb-2 animate-bounce" />
                  <p className="text-xs text-gray-400 font-bold px-4 text-center">Cadre ton document d'examen ou ta fiche de révision ici</p>

                  {/* Manual trigger */}
                  <button
                    onClick={handleCapturePhoto}
                    className="absolute bottom-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 rounded-2xl font-black text-xs text-white uppercase shadow-lg cursor-pointer transition-all active:translate-y-0.5"
                    id="btn-capture-camera"
                  >
                    Déclencher l'obturateur 📸
                  </button>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-gray-400 leading-normal bg-gray-50 p-3 rounded-xl border">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>La simulation de l'appareil photo extrait automatiquement le texte des QCMs TAFEM d'institutions marocaines pour les intégrer directement au moteur de jeu.</span>
                </div>
              </div>
            )}

            {sourceType === 'upload' && (
              <div className="space-y-4">
                <div 
                  onClick={handleFileUploadSimulate}
                  className="border-4 border-dashed border-gray-200 hover:border-indigo-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-gray-50 hover:bg-indigo-50/20"
                  id="upload-dragdrop-box"
                >
                  <FileUp className="w-12 h-12 text-gray-400 mb-2 animate-pulse" />
                  <p className="font-extrabold text-sm text-gray-700">Cliquez pour importer un document</p>
                  <p className="text-xs text-gray-400 mt-1">Soutient : JPG, PNG, PDF (Fiches de cours, captures d'écran, notes)</p>
                </div>
              </div>
            )}

            {sourceType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Texte extrait du document de révision :
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Colle ou saisis ici les notes, QCMs ou informations à réviser..."
                    rows={5}
                    className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none font-medium text-sm text-gray-700"
                    id="scan-textarea"
                  />
                </div>

                {fileName && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs flex justify-between items-center">
                    <span>📄 Document importé : {fileName}</span>
                    <button onClick={() => { setFileName(null); setInputText(''); }} className="text-emerald-600 hover:text-emerald-800 font-black">×</button>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-bold text-xs">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={handleProcessScan}
                  disabled={!inputText.trim()}
                  className={`w-full py-4 text-white font-black text-base rounded-2xl border-b-4 transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                    !inputText.trim()
                      ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800 shadow-md active:translate-y-0.5 cursor-pointer'
                  }`}
                  id="btn-process-scan-zack"
                >
                  <Sparkles className="w-5 h-5 fill-indigo-200 text-white animate-spin" />
                  <span>Lancer l'analyse Zack-O-Matic</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* LOADING SCREEN WITH RETRO SCAN EFFECTS */}
        {loading && (
          <motion.div
            key="scan-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-black text-[#58CC02] p-8 rounded-3xl border-4 border-[#46A302] shadow-xl text-center space-y-6 flex flex-col items-center justify-center font-mono"
            id="zack-loading-panel"
          >
            {/* Matrix glow radar */}
            <div className="relative w-24 h-24">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping" />
              <div className="relative p-5 bg-[#58CC02] rounded-full text-black w-20 h-20 flex items-center justify-center shadow-[0_0_20px_rgba(88,204,2,0.6)]">
                <Brain className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-xl text-white">ANALYSE DU TEXTE PAR ZACK...</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                [SYSTEM: CONNECTÉ AU PROCESSEUR DE L'ENCG]
              </p>
            </div>

            {/* Matrix mock terminal logs */}
            <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/20 text-left w-full text-[9px] space-y-1 text-emerald-300">
              <div className="animate-pulse">⏳ BEEP... LECTURE DE L'IMAGE... OK</div>
              <div>⚡ DECRYPTAGE DES CONSTITUTIONS MAROCAINES... 100%</div>
              <div className="animate-pulse">🧬 GENERATION DE QUESTIONS EN COURS...</div>
            </div>

            <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-emerald-500/20">
              <div className="h-full bg-[#58CC02] w-full animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* SCANNED RESULTS PREVIEW */}
        {result && (
          <motion.div
            key="scan-results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-left"
            id="scan-results-panel"
          >
            {/* Explanation card */}
            <div className="p-5 bg-white border-4 border-gray-200 rounded-3xl shadow-[4px_4px_0_0_#e5e7eb] space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                  Numérisation Réussie ! ✨
                </span>
              </div>
              <h4 className="font-black text-sm text-gray-800 uppercase">📝 Analyse pédagogique de Zack :</h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {result.correctionText}
              </p>
            </div>

            {/* QCM interactive list */}
            <div className="bg-white p-5 border-4 border-gray-200 rounded-3xl shadow-[4px_4px_0_0_#e5e7eb] space-y-4">
              <h4 className="font-black text-sm text-gray-800 flex items-center gap-1.5 border-b pb-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Vos 3 QCMs d'entraînement générés :
              </h4>

              <div className="space-y-3">
                {result.generatedQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-3.5 bg-gray-50 rounded-2xl border-2 border-gray-100 space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-indigo-600">
                      <span>Question #{qIdx + 1}</span>
                      <span className="bg-indigo-100 px-2 py-0.5 rounded-full">{q.section}</span>
                    </div>
                    <p className="font-extrabold text-xs text-gray-700 leading-snug">
                      {q.text}
                    </p>
                    <div className="grid grid-cols-2 gap-1 pt-2">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`p-2 rounded-xl border text-[9px] font-bold ${
                            oIdx === q.correctOptionIndex 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold' 
                              : 'bg-white border-gray-100 text-gray-400'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => onPlayCustomQuiz(result.generatedQuestions)}
                  className="w-full py-3.5 bg-[#58CC02] hover:bg-[#58CC02]/95 text-white font-extrabold rounded-2xl border-b-4 border-[#46A302] shadow-sm flex items-center justify-center gap-2 text-xs uppercase cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white animate-ping" />
                  <span>Jouer ce Quiz (+30 XP)</span>
                </button>

                <button
                  onClick={() => {
                    onSaveCustomQuestions(result.generatedQuestions);
                    setIsSaved(true);
                  }}
                  disabled={isSaved}
                  className={`w-full py-3.5 text-white font-extrabold rounded-2xl border-b-4 shadow-sm flex items-center justify-center gap-2 text-xs uppercase cursor-pointer ${
                    isSaved ? 'bg-gray-400 border-gray-500' : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-800'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'Enregistré dans le SRS !' : 'Ajouter aux boîtes SRS'}</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setInputText('');
                  setFileName(null);
                }}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-xs transition-all border-b-2 border-indigo-600 pb-0.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Prendre ou importer une autre fiche</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

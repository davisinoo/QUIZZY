import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MascotExpression } from '../types';

interface MascotProps {
  expression: MascotExpression;
  bubbleText?: string;
  animal?: 'fox' | 'bear' | 'snail';
  name?: string;
}

export const Mascot: React.FC<MascotProps> = ({ 
  expression, 
  bubbleText,
  animal = 'fox',
  name
}) => {
  // Variations of SVG paths / properties based on expression (for Fox & Bear)
  const getEyePaths = () => {
    switch (expression) {
      case 'happy':
      case 'cheering':
        // Closed smiling eyes
        return {
          left: 'M 35,55 Q 45,45 55,55',
          right: 'M 95,55 Q 105,45 115,55',
          strokeWidth: 4,
          fill: 'none',
          stroke: '#374151',
        };
      case 'sad':
        // Sad curved down eyes
        return {
          left: 'M 35,58 Q 45,63 55,58',
          right: 'M 95,58 Q 105,63 115,58',
          strokeWidth: 4,
          fill: 'none',
          stroke: '#374151',
        };
      case 'thinking':
        // Left eye looking up/side, right eye squinting
        return {
          left: 'M 45,50 A 6,6 0 1,1 45,50.1', // Small dot looking up
          right: 'M 95,55 Q 105,50 115,55', // Curved
          strokeWidth: 5,
          fill: '#374151',
          stroke: '#374151',
        };
      case 'neutral':
      default:
        // Nice big round shiny eyes
        return {
          left: 'circle',
          right: 'circle',
          strokeWidth: 0,
          fill: '#374151',
          stroke: 'none',
        };
    }
  };

  const getMouthPath = () => {
    switch (expression) {
      case 'happy':
      case 'cheering':
        // Wide happy open mouth
        return 'M 65,75 Q 75,90 85,75 Z';
      case 'sad':
        // Downturned mouth
        return 'M 67,82 Q 75,74 83,82';
      case 'thinking':
        // Straight-ish worried line or small circle
        return 'M 70,78 Q 75,78 80,78';
      case 'neutral':
      default:
        // Small cute smile
        return 'M 68,76 Q 75,82 82,76';
    }
  };

  const eyeConfig = getEyePaths();
  const mouthPath = getMouthPath();

  // Animation values for mascot bouncing/vibe
  const mascotVariants = {
    neutral: {
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    happy: {
      scale: [1, 1.04, 1],
      y: [0, -5, 0],
      transition: { duration: 0.5, ease: "easeOut" }
    },
    cheering: {
      y: [0, -12, 0, -8, 0],
      rotate: [0, -4, 4, -2, 0],
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    sad: {
      y: [0, 3, 0],
      transition: { duration: 0.6 }
    },
    thinking: {
      rotate: [0, 1.5, -1.5, 0],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center select-none" id={`mascot-container-${animal}`}>
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {bubbleText && (
          <motion.div
            key={bubbleText}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="relative mb-4 max-w-xs bg-white text-gray-800 p-3.5 rounded-2xl shadow-md border-2 border-indigo-100 text-xs font-semibold leading-relaxed"
            id={`mascot-bubble-${animal}`}
          >
            {/* Mascot Name Header */}
            {name && (
              <span className="block font-black text-[10px] text-indigo-600 uppercase tracking-widest mb-1">
                {name} :
              </span>
            )}
            <p className="text-gray-600">{bubbleText}</p>
            {/* Speech bubble tail */}
            <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white" />
            <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[11px] border-t-indigo-100 -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Graphic */}
      <motion.div
        variants={mascotVariants}
        animate={expression}
        className="relative w-32 h-32 drop-shadow-xl"
        id={`mascot-svg-wrapper-${animal}`}
      >
        <svg viewBox="0 0 150 150" className="w-full h-full overflow-visible">
          {/* Sparkles for Cheering */}
          {expression === 'cheering' && (
            <g>
              <motion.circle cx="20" cy="20" r="3" fill="#FDD835" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} />
              <motion.path d="M 15 20 L 25 20 M 20 15 L 20 25" stroke="#FDD835" strokeWidth="1.5" />
              <motion.circle cx="130" cy="25" r="4" fill="#FDD835" animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.8, 0.4, 0.8] }} transition={{ repeat: Infinity, duration: 1.2 }} />
              <motion.path d="M 125 25 L 135 25 M 130 20 L 130 30" stroke="#FDD835" strokeWidth="1.5" />
            </g>
          )}

          {/* Tear for Sad */}
          {expression === 'sad' && (
            <motion.path
              d="M 45,65 Q 43,80 40,85 Q 45,90 48,85 Z"
              fill="#64B5F6"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, 15, 25, 30] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeIn" }}
            />
          )}

          {/* ANIMAL TYPE 1: FOX (First section) */}
          {animal === 'fox' && (
            <g id="fox-g">
              {/* Left Ear */}
              <motion.path
                d="M 50,45 C 40,10 5,-15 15,35 C 22,48 35,53 50,45 Z"
                fill="#FFA726" // Sandy Fennec Orange
                stroke="#E65100"
                strokeWidth="3"
                animate={expression === 'sad' ? { rotate: -15, y: 8 } : expression === 'cheering' ? { y: [0, -4, 0] } : {}}
                className="origin-bottom-right"
              />
              {/* Left Ear Inner */}
              <motion.path
                d="M 45,42 C 37,16 12,-4 20,34 C 25,44 35,46 45,42 Z"
                fill="#FFCDD2" // Soft pink
                animate={expression === 'sad' ? { rotate: -15, y: 8 } : expression === 'cheering' ? { y: [0, -4, 0] } : {}}
                className="origin-bottom-right"
              />

              {/* Right Ear */}
              <motion.path
                d="M 100,45 C 110,10 145,-15 135,35 C 128,48 115,53 100,45 Z"
                fill="#FFA726"
                stroke="#E65100"
                strokeWidth="3"
                animate={expression === 'sad' ? { rotate: 15, y: 8 } : expression === 'cheering' ? { y: [0, -4, 0] } : {}}
                className="origin-bottom-left"
              />
              {/* Right Ear Inner */}
              <motion.path
                d="M 105,42 C 113,16 138,-4 130,34 C 125,44 115,46 105,42 Z"
                fill="#FFCDD2"
                animate={expression === 'sad' ? { rotate: 15, y: 8 } : expression === 'cheering' ? { y: [0, -4, 0] } : {}}
                className="origin-bottom-left"
              />

              {/* Body */}
              <path d="M 45,110 Q 75,135 105,110 L 95,140 L 55,140 Z" fill="#FFB74D" stroke="#E65100" strokeWidth="3" />
              {/* White Chest Patch */}
              <path d="M 55,115 Q 75,130 95,115 Q 75,122 55,115 Z" fill="#FFFFFF" />

              {/* Head */}
              <ellipse cx="75" cy="78" rx="42" ry="34" fill="#FFA726" stroke="#E65100" strokeWidth="3" />

              {/* White Cheeks */}
              <path d="M 35,85 Q 50,94 62,85 Q 50,72 35,85 Z" fill="#FFFFFF" opacity="0.9" />
              <path d="M 115,85 Q 100,94 88,85 Q 100,72 115,85 Z" fill="#FFFFFF" opacity="0.9" />

              {/* EYES */}
              {eyeConfig.left === 'circle' ? (
                <g>
                  <circle cx="48" cy="62" r="9" fill={eyeConfig.fill} />
                  <circle cx="45" cy="59" r="3" fill="#FFFFFF" />
                  <circle cx="102" cy="62" r="9" fill={eyeConfig.fill} />
                  <circle cx="99" cy="59" r="3" fill="#FFFFFF" />
                </g>
              ) : (
                <g>
                  <path d={eyeConfig.left} stroke={eyeConfig.stroke} strokeWidth={eyeConfig.strokeWidth} strokeLinecap="round" fill={eyeConfig.fill} />
                  <path d={eyeConfig.right} stroke={eyeConfig.stroke} strokeWidth={eyeConfig.strokeWidth} strokeLinecap="round" fill={eyeConfig.fill} />
                </g>
              )}

              {/* Nose */}
              <polygon points="71,70 79,70 75,75" fill="#374151" />

              {/* Mouth */}
              {expression === 'happy' || expression === 'cheering' ? (
                <path d={mouthPath} fill="#E57373" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d={mouthPath} fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
              )}

              {/* Pink Cheeks */}
              <circle cx="38" cy="73" r="5" fill="#FF8A80" opacity="0.6" />
              <circle cx="112" cy="73" r="5" fill="#FF8A80" opacity="0.6" />
            </g>
          )}

          {/* ANIMAL TYPE 2: BEAR (Second section) */}
          {animal === 'bear' && (
            <g id="bear-g">
              {/* Bear Ears */}
              <motion.circle 
                cx="42" 
                cy="46" 
                r="14" 
                fill="#8D6E63" 
                stroke="#4E342E" 
                strokeWidth="3" 
                animate={expression === 'sad' ? { y: 3 } : {}}
              />
              <motion.circle 
                cx="42" 
                cy="46" 
                r="8" 
                fill="#FFCDD2" 
                animate={expression === 'sad' ? { y: 3 } : {}}
              />

              <motion.circle 
                cx="108" 
                cy="46" 
                r="14" 
                fill="#8D6E63" 
                stroke="#4E342E" 
                strokeWidth="3" 
                animate={expression === 'sad' ? { y: 3 } : {}}
              />
              <motion.circle 
                cx="108" 
                cy="46" 
                r="8" 
                fill="#FFCDD2" 
                animate={expression === 'sad' ? { y: 3 } : {}}
              />

              {/* Body */}
              <path d="M 45,110 Q 75,130 105,110 L 95,145 L 55,145 Z" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />
              {/* Lighter chest patch */}
              <path d="M 55,115 Q 75,130 95,115 Q 75,122 55,115 Z" fill="#D7CCC8" />

              {/* Head */}
              <ellipse cx="75" cy="78" rx="42" ry="34" fill="#8D6E63" stroke="#4E342E" strokeWidth="3" />

              {/* Snout/Muzzle */}
              <ellipse cx="75" cy="81" rx="14" ry="10" fill="#D7CCC8" />

              {/* EYES */}
              {eyeConfig.left === 'circle' ? (
                <g>
                  <circle cx="48" cy="62" r="8" fill={eyeConfig.fill} />
                  <circle cx="46" cy="60" r="2.5" fill="#FFFFFF" />
                  <circle cx="102" cy="62" r="8" fill={eyeConfig.fill} />
                  <circle cx="100" cy="60" r="2.5" fill="#FFFFFF" />
                </g>
              ) : (
                <g>
                  <path d={eyeConfig.left} stroke={eyeConfig.stroke} strokeWidth={eyeConfig.strokeWidth} strokeLinecap="round" fill={eyeConfig.fill} />
                  <path d={eyeConfig.right} stroke={eyeConfig.stroke} strokeWidth={eyeConfig.strokeWidth} strokeLinecap="round" fill={eyeConfig.fill} />
                </g>
              )}

              {/* Nose */}
              <ellipse cx="75" cy="76" rx="6" ry="4" fill="#374151" />

              {/* Mouth */}
              {expression === 'happy' || expression === 'cheering' ? (
                <path d={mouthPath} fill="#E57373" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d={mouthPath} fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
              )}

              {/* Pink Cheeks */}
              <circle cx="38" cy="73" r="5" fill="#FF8A80" opacity="0.5" />
              <circle cx="112" cy="73" r="5" fill="#FF8A80" opacity="0.5" />
            </g>
          )}

          {/* ANIMAL TYPE 3: SNAIL / ESCARGOT (Third section) */}
          {animal === 'snail' && (
            <g id="snail-g">
              {/* Snail Shell (Coiled home on the back) */}
              <ellipse cx="50" cy="100" rx="35" ry="32" fill="#D1C4E9" stroke="#512DA8" strokeWidth="3" />
              {/* Beautiful spiral line */}
              <path 
                d="M 50,100 A 24,22 0 0,0 74,100 A 18,16 0 0,0 56,84 A 12,10 0 0,0 44,96 A 6,5 0 0,0 50,100" 
                fill="none" 
                stroke="#512DA8" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />

              {/* Snail Foot / Body sliding along the floor */}
              <path 
                d="M 12,128 C 12,128 35,115 65,115 C 95,115 110,105 115,92 C 120,78 115,62 100,62 C 88,62 85,75 85,88 C 85,100 75,120 40,122 C 25,123 15,128 12,128 Z" 
                fill="#FFF59D" 
                stroke="#F57F17" 
                strokeWidth="3" 
              />

              {/* Stalks (Tentacles with eyes on top!) */}
              <motion.line 
                x1="92" 
                y1="64" 
                x2="84" 
                y2="38" 
                stroke="#F57F17" 
                strokeWidth="4" 
                strokeLinecap="round" 
                animate={expression === 'sad' ? { y2: 44, x2: 86 } : expression === 'cheering' ? { y: [0, -3, 0] } : {}}
              />
              <motion.line 
                x1="104" 
                y1="64" 
                x2="112" 
                y2="38" 
                stroke="#F57F17" 
                strokeWidth="4" 
                strokeLinecap="round" 
                animate={expression === 'sad' ? { y2: 44, x2: 110 } : expression === 'cheering' ? { y: [0, -3, 0] } : {}}
              />

              {/* Eye balls at the top of stalks */}
              <motion.circle 
                cx="84" 
                cy="34" 
                r="7" 
                fill="#FFFFFF" 
                stroke="#F57F17" 
                strokeWidth="2" 
                animate={expression === 'sad' ? { y: 6, x: 2 } : {}}
              />
              <motion.circle 
                cx="112" 
                cy="34" 
                r="7" 
                fill="#FFFFFF" 
                stroke="#F57F17" 
                strokeWidth="2" 
                animate={expression === 'sad' ? { y: 6, x: -2 } : {}}
              />

              {/* Dynamic Snail Eye Pupils or Closed arcs */}
              {expression === 'happy' || expression === 'cheering' ? (
                <g>
                  <motion.path d="M 80,34 Q 84,31 88,34" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                  <motion.path d="M 108,34 Q 112,31 116,34" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : (
                <g>
                  {/* Left Eye pupil */}
                  <motion.circle 
                    cx="84" 
                    cy="34" 
                    r="3.5" 
                    fill="#374151" 
                    animate={expression === 'sad' ? { y: 6, x: 2 } : expression === 'thinking' ? { x: -1 } : {}} 
                  />
                  <motion.circle 
                    cx="82" 
                    cy="32" 
                    r="1" 
                    fill="#FFFFFF" 
                    animate={expression === 'sad' ? { y: 6, x: 2 } : expression === 'thinking' ? { x: -1 } : {}} 
                  />

                  {/* Right Eye pupil */}
                  <motion.circle 
                    cx="112" 
                    cy="34" 
                    r="3.5" 
                    fill="#374151" 
                    animate={expression === 'sad' ? { y: 6, x: -2 } : expression === 'thinking' ? { x: 1 } : {}} 
                  />
                  <motion.circle 
                    cx="110" 
                    cy="32" 
                    r="1" 
                    fill="#FFFFFF" 
                    animate={expression === 'sad' ? { y: 6, x: -2 } : expression === 'thinking' ? { x: 1 } : {}} 
                  />
                </g>
              )}

              {/* Snail Face cheeks / smile */}
              {expression === 'happy' || expression === 'cheering' ? (
                <path d="M 97,74 Q 100,81 103,74 Z" fill="#E57373" stroke="#374151" strokeWidth="2.5" />
              ) : expression === 'sad' ? (
                <path d="M 97,78 Q 100,74 103,78" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <path d="M 96,75 Q 100,80 104,75" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
              )}

              {/* Blush cheeks */}
              <circle cx="91" cy="74" r="3" fill="#FF8A80" opacity="0.6" />
              <circle cx="109" cy="74" r="3" fill="#FF8A80" opacity="0.6" />
            </g>
          )}

        </svg>
      </motion.div>
    </div>
  );
};

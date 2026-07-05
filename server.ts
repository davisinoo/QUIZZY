import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Verify culture info and generate QCMs
app.post('/api/verify-culture', async (req, res) => {
  try {
    const { infoText } = req.body;
    if (!infoText || typeof infoText !== 'string' || infoText.trim().length === 0) {
      return res.status(400).json({ error: "Le texte d'information est requis." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Clé API Gemini manquante. Veuillez configurer GEMINI_API_KEY dans les Secrets de l'application." 
      });
    }

    // Lazy initialize Gemini SDK client on-demand to prevent crashing on startup
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `Tu es un expert du concours TAFEM (concours national d'accès aux ENCG du Maroc) spécialisé dans la section "Culture Générale".
Ta mission est d'analyser le texte d'information fourni par l'utilisateur.
1. Évalue si les informations sont rigoureusement exactes, partiellement correctes ou incorrectes dans le cadre du concours TAFEM.
2. Rédige une correction et explication pédagogique détaillée en français (dates précises, contextes politiques, économiques ou institutionnels du Maroc et du monde, auteurs, définitions économiques).
3. Génère exactement 3 questions QCM de très haute qualité en rapport direct avec les informations vérifiées ou le contexte historique/économique lié.
Les questions doivent cibler l'une de ces sections : 'Maroc & Institutions', 'Économie & Finance', 'Histoire & Géographie', 'Arts, Lettres & Sciences' ou 'Mémorisation'.
Chaque question doit posséder 4 options, un correctOptionIndex (0, 1, 2 ou 3), et une explication pédagogique complète.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Voici les informations à vérifier : \n\n"${infoText}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: {
              type: Type.STRING,
              description: "Le statut de validité. Doit être l'un des suivants : 'correct', 'partiellement_correct', 'incorrect'"
            },
            correctionText: {
              type: Type.STRING,
              description: "Analyse et correction pédagogique détaillée en français des faits présentés dans le texte."
            },
            generatedQuestions: {
              type: Type.ARRAY,
              description: "Liste d'exactement 3 questions QCM générées en français à partir du contenu.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Un ID unique pour cette question (ex: 'ai-1', 'ai-2')" },
                  section: { 
                    type: Type.STRING, 
                    description: "Section : 'Maroc & Institutions' ou 'Économie & Finance' ou 'Histoire & Géographie' ou 'Arts, Lettres & Sciences' ou 'Mémorisation'"
                  },
                  text: { type: Type.STRING, description: "La question posée." },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Tableau de 4 options de réponse distinctes."
                  },
                  correctOptionIndex: { type: Type.INTEGER, description: "L'index de la réponse correcte (0 à 3)." },
                  explanation: { type: Type.STRING, description: "Explication de la réponse correcte." },
                  difficulty: { type: Type.STRING, description: "Difficulté : 'Facile' ou 'Moyen' ou 'Difficile'" },
                  subtopic: { type: Type.STRING, description: "Le sous-thème spécifique (ex: 'Sports', 'Musique', 'Politique Marocaine', 'Géographie', 'Histoire du Maroc', 'Économie', 'Sciences')" }
                },
                required: ["id", "section", "text", "options", "correctOptionIndex", "explanation", "difficulty", "subtopic"]
              }
            }
          },
          required: ["isValid", "correctionText", "generatedQuestions"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Une erreur est survenue lors du traitement par l'IA.", 
      details: error.message || error 
    });
  }
});

// Setup Vite in Dev or static folder in Prod
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware integrated into Express.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static files in production mode.");
  }
}

setupVite().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

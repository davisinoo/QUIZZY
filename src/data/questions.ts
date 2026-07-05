import { Question } from '../types';

export const TAFEM_QUESTIONS: Question[] = [
  // --- 1. MOROCCAN POLITICS & INSTITUTIONS ---
  {
    id: 'cul-maroc-pol-1',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Marocaine',
    text: "Qui est le Chef du Gouvernement marocain nommé à la suite des élections législatives de septembre 2021 ?",
    options: ["Saâdeddine El Othmani", "Abdelilah Benkirane", "Aziz Akhannouch", "Chakib Benmoussa"],
    correctOptionIndex: 2,
    explanation: "Aziz Akhannouch a été nommé Chef du Gouvernement par Sa Majesté le Roi Mohammed VI le 10 septembre 2021, suite au succès de son parti (RNI) aux élections législatives.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-maroc-pol-2',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Marocaine',
    text: "Quelle est la durée du mandat (en années) des membres de la Chambre des Représentants au Maroc ?",
    options: ["4 ans", "5 ans", "6 ans", "9 ans"],
    correctOptionIndex: 1,
    explanation: "Conformément à la Constitution marocaine, les députés de la Chambre des Représentants sont élus pour un mandat de 5 ans au suffrage universel direct.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-maroc-pol-3',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Marocaine',
    text: "Depuis la réforme territoriale et constitutionnelle, le Royaume du Maroc est découpé en combien de régions administratives ?",
    options: ["8 régions", "12 régions", "16 régions", "24 régions"],
    correctOptionIndex: 1,
    explanation: "Depuis l'adoption du projet de régionalisation avancée en 2015, le Maroc est officiellement divisé en 12 régions administratives distinctes.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-maroc-pol-4',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Marocaine',
    text: "Quelle commission nationale, créée au Maroc, a remis son rapport final sur le 'Nouveau Modèle de Développement' (CSMD) en mai 2021 ?",
    options: [
      "La Commission Spéciale sur le Modèle de Développement",
      "Le Conseil Économique, Social et Environnemental (CESE)",
      "Le Haut-Commissariat au Plan",
      "La Cour des Comptes"
    ],
    correctOptionIndex: 0,
    explanation: "La CSMD (Commission Spéciale sur le Modèle de Développement), présidée par Chakib Benmoussa, a présenté son rapport sur le nouveau modèle de développement du Royaume en mai 2021.",
    difficulty: 'Moyen'
  },

  // --- 2. SPORTS ---
  {
    id: 'cul-sports-1',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sports',
    text: "Quels pays co-organiseront officiellement la Coupe du Monde de football de la FIFA en 2030 aux côtés du Maroc ?",
    options: [
      "Le Maroc, la France et l'Espagne",
      "Le Maroc, l'Espagne et le Portugal",
      "Le Maroc, l'Italie et la Tunisie",
      "Le Maroc, l'Algérie et l'Égypte"
    ],
    correctOptionIndex: 1,
    explanation: "En octobre 2023, la FIFA a retenu la candidature conjointe du Maroc, de l'Espagne et du Portugal comme hôtes uniques pour l'édition 2030 du Mondial, avec trois matchs célébrant le centenaire en Amérique du Sud.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-sports-2',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sports',
    text: "Quel athlète marocain a conservé son titre olympique en remportant la médaille d'or sur 3000 m steeple aux Jeux Olympiques de Paris 2024 ?",
    options: ["Hicham El Guerrouj", "Soufiane El Bakkali", "Said Aouita", "Salah Hissou"],
    correctOptionIndex: 1,
    explanation: "Soufiane El Bakkali a marqué l'histoire du sport marocain en remportant la médaille d'or du 3000 m steeple à Paris en 2024, conservant ainsi sa couronne olympique après Tokyo 2020.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-sports-3',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sports',
    text: "Quel exploit historique l'équipe nationale marocaine de football a-t-elle accompli lors de la Coupe du Monde de la FIFA 2022 au Qatar ?",
    options: [
      "Elle a remporté la Coupe du Monde",
      "Elle a atteint la finale",
      "Elle est devenue la première nation africaine et arabe à atteindre les demi-finales",
      "Elle s'est qualifiée pour les huitièmes de finale sans encaisser de but"
    ],
    correctOptionIndex: 2,
    explanation: "Au Qatar en décembre 2022, les Lions de l'Atlas ont réalisé une performance historique en devenant la toute première équipe d'Afrique et du monde arabe à se hisser en demi-finale d'un Mondial.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-sports-4',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sports',
    text: "Quel pays détient le record absolu du nombre de victoires en Coupe du Monde de football de la FIFA ?",
    options: ["Allemagne", "Italie", "Argentine", "Brésil"],
    correctOptionIndex: 3,
    explanation: "Le Brésil est la nation la plus titrée de l'histoire du football mondial, avec 5 Coupes du Monde remportées (1958, 1962, 1970, 1994, 2002).",
    difficulty: 'Facile'
  },

  // --- 3. MUSIC & ARTS ---
  {
    id: 'cul-arts-1',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Musique & Arts',
    text: "Chaque année, quelle ville côtière marocaine accueille le célèbre Festival d'Essaouira - Gnaoua et Musiques du Monde ?",
    options: ["Tanger", "Essaouira", "Agadir", "Safi"],
    correctOptionIndex: 1,
    explanation: "Créé en 1998, le Festival d'Essaouira - Gnaoua et Musiques du Monde a lieu chaque année dans la ville d'Essaouira (ancienne Mogador).",
    difficulty: 'Facile'
  },
  {
    id: 'cul-arts-2',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Musique & Arts',
    text: "Quel festival international de musique, l'un des plus grands au monde, se tient chaque année dans la ville de Rabat ?",
    options: ["Le Festival Mawazine", "Le Festival des Musiques Sacrées", "Le Festival Oasis", "L'Boulevard"],
    correctOptionIndex: 0,
    explanation: "Le Festival Mawazine - Rythmes du Monde est un festival de musique international organisé chaque année en mai ou juin à Rabat, attirant des millions de spectateurs.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-arts-3',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Musique & Arts',
    text: "L'écrivaine franco-marocaine Leila Slimani a remporté le prestigieux Prix Goncourt en 2016 pour quel roman à succès ?",
    options: ["Dans le jardin de l'ogre", "Chanson douce", "Le pays des autres", "La Boîte à merveilles"],
    correctOptionIndex: 1,
    explanation: "Leila Slimani a obtenu le Prix Goncourt en 2016 pour son deuxième roman 'Chanson douce', un thriller psychologique captivant.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-arts-4',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Musique & Arts',
    text: "Quel auteur marocain a écrit le célèbre ouvrage autobiographique 'La Boîte à merveilles' (1954), incontournable de la littérature maghrébine d'expression française ?",
    options: ["Driss Chraïbi", "Ahmed Sefrioui", "Tahar Ben Jelloun", "Abdelkebir Khatibi"],
    correctOptionIndex: 1,
    explanation: "'La Boîte à merveilles' a été rédigée par l'écrivain marocain Ahmed Sefrioui. Le roman raconte l'enfance traditionnelle à Fès à travers les yeux du petit Sidi Mohammed.",
    difficulty: 'Facile'
  },

  // --- 4. INTERNATIONAL POLITICS & COOPERATION ---
  {
    id: 'cul-int-pol-1',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Internationale',
    text: "Dans quelle capitale africaine le Maroc a-t-il officiellement signé son acte d'adhésion pour réintégrer l'Union Africaine (UA) en 2017 ?",
    options: ["Rabat (Maroc)", "Addis-Abeba (Éthiopie)", "Dakar (Sénégal)", "Le Caire (Égypte)"],
    correctOptionIndex: 1,
    explanation: "Le Maroc a officiellement réintégré l'Union Africaine le 30 janvier 2017, lors du 28e sommet de l'organisation panafricaine qui s'est tenu à Addis-Abeba, siège de l'UA.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-int-pol-2',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Internationale',
    text: "Qui est le Secrétaire général de l'Organisation des Nations Unies (ONU) depuis le 1er janvier 2017, reconduit pour un second mandat ?",
    options: ["Ban Ki-moon", "Kofi Annan", "António Guterres", "Boutros Boutros-Ghali"],
    correctOptionIndex: 2,
    explanation: "L'ancien Premier ministre portugais António Guterres est le Secrétaire général de l'ONU depuis janvier 2017.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-int-pol-3',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Internationale',
    text: "Quel organe de l'ONU, composé de 15 membres dont 5 membres permanents avec droit de veto, est chargé du maintien de la paix internationale ?",
    options: ["L'Assemblée Générale", "Le Conseil de Sécurité", "La Cour Internationale de Justice", "Le Conseil de Tutelle"],
    correctOptionIndex: 1,
    explanation: "Le Conseil de Sécurité de l'ONU est le seul organe disposant du pouvoir de voter des résolutions contraignantes pour le maintien de la paix internationale.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-int-pol-4',
    section: 'Maroc & Institutions',
    subtopic: 'Politique Internationale',
    text: "La COP22, conférence internationale majeure sur les changements climatiques, s'est tenue en novembre 2016 dans quelle ville marocaine ?",
    options: ["Casablanca", "Rabat", "Marrakech", "Tanger"],
    correctOptionIndex: 2,
    explanation: "Le Maroc a accueilli avec succès la COP22 sur le climat du 7 au 18 novembre 2016 à Marrakech, sur le site de Bab Ighli.",
    difficulty: 'Facile'
  },

  // --- 5. ECONOMY & FINANCE ---
  {
    id: 'cul-eco-1',
    section: 'Économie & Finance',
    subtopic: 'Économie & Finance',
    text: "Qui est l'actuel Wali (Gouverneur) de Bank Al-Maghrib, la banque centrale du Royaume du Maroc ?",
    options: ["Abdellatif Jouahri", "Nizar Baraka", "Mohamed Boussaïd", "Salaheddine Mezouar"],
    correctOptionIndex: 0,
    explanation: "Abdellatif Jouahri occupe le poste de Wali de Bank Al-Maghrib depuis sa nomination par Dahir en mars 2003.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-eco-2',
    section: 'Économie & Finance',
    subtopic: 'Économie & Finance',
    text: "Quel est le plus grand complexe portuaire d'Afrique et de la Méditerranée en volume de conteneurs, situé au nord du Maroc ?",
    options: ["Port de Casablanca", "Port de Jorf Lasfar", "Port Tanger Med", "Port d'Agadir"],
    correctOptionIndex: 2,
    explanation: "Inauguré en 2007, Tanger Med est le premier port de conteneurs d'Afrique et de la Méditerranée, constituant un hub logistique mondial majeur.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-eco-3',
    section: 'Économie & Finance',
    subtopic: 'Économie & Finance',
    text: "Le régime de change du Dirham marocain est ancré à un panier de devises. Quelle est la répartition officielle de ce panier ?",
    options: [
      "50% Euro / 50% Dollar américain",
      "60% Euro / 40% Dollar américain",
      "70% Euro / 30% Dollar américain",
      "80% Euro / 20% Dollar américain"
    ],
    correctOptionIndex: 1,
    explanation: "Depuis la réforme d'avril 2015, le panier de référence du Dirham marocain est fixé à 60% pour l'Euro (€) et 40% pour le Dollar américain ($).",
    difficulty: 'Difficile'
  },
  {
    id: 'cul-eco-4',
    section: 'Économie & Finance',
    subtopic: 'Économie & Finance',
    text: "Quel pays ou groupe de pays constitue le premier partenaire commercial et économique historique du Royaume du Maroc ?",
    options: ["Les États-Unis", "La Chine", "L'Union Européenne", "Les pays de l'Union du Maghreb Arabe"],
    correctOptionIndex: 2,
    explanation: "L'Union Européenne (principalement l'Espagne et la France) est le premier partenaire commercial du Maroc, représentant plus de 60% de ses échanges extérieurs.",
    difficulty: 'Facile'
  },

  // --- 6. GEOGRAPHY ---
  {
    id: 'cul-geo-1',
    section: 'Histoire & Géographie',
    subtopic: 'Géographie',
    text: "Quel est le plus haut sommet du Maroc et de l'Afrique du Nord, culminant à 4 167 mètres d'altitude ?",
    options: ["Jbel Ayachi", "Jbel Toubkal", "Jbel Sirwa", "Jbel Bou Naceur"],
    correctOptionIndex: 1,
    explanation: "Le Jbel Toubkal, situé dans le Haut Atlas marocain à 63 km au sud de Marrakech, culmine à 4 167 m d'altitude et constitue le point le plus élevé d'Afrique du Nord.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-geo-2',
    section: 'Histoire & Géographie',
    subtopic: 'Géographie',
    text: "Quel fleuve marocain est considéré comme le plus long du pays avec un cours d'environ 1 100 km se jetant dans l'océan Atlantique ?",
    options: ["L'Oum Er-Rbia", "Le Sebou", "L'Oued Draâ", "La Moulouya"],
    correctOptionIndex: 2,
    explanation: "L'Oued Draâ est le plus long cours d'eau du Maroc (environ 1 100 km). Il prend sa source dans le Haut Atlas et descend jusqu'à l'Atlantique (sec sur une grande partie de sa fin de parcours aujourd'hui).",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-geo-3',
    section: 'Histoire & Géographie',
    subtopic: 'Géographie',
    text: "Quelle ville est la capitale politique de l'Australie (souvent confondue avec Sydney ou Melbourne) ?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctOptionIndex: 2,
    explanation: "Canberra a été choisie comme capitale nationale de l'Australie en 1908 comme compromis entre les deux rivales Sydney et Melbourne.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-geo-4',
    section: 'Histoire & Géographie',
    subtopic: 'Géographie',
    text: "Quelle est la capitale administrative et politique du Canada ?",
    options: ["Toronto", "Montréal", "Vancouver", "Ottawa"],
    correctOptionIndex: 3,
    explanation: "Ottawa a été choisie comme capitale officielle du Canada par la reine Victoria en 1857.",
    difficulty: 'Facile'
  },

  // --- 7. MOROCCAN HISTORY ---
  {
    id: 'cul-hist-1',
    section: 'Histoire & Géographie',
    subtopic: 'Histoire du Maroc',
    text: "À quelle date historique Sa Majesté le Roi Hassan II a-t-il lancé la glorieuse Marche Verte pour libérer les provinces sahariennes ?",
    options: ["2 mars 1956", "6 novembre 1975", "18 novembre 1956", "20 août 1953"],
    correctOptionIndex: 1,
    explanation: "La Marche Verte, qui a rassemblé 350 000 marcheurs marocains pacifiques, a été lancée le 6 novembre 1975.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-hist-2',
    section: 'Histoire & Géographie',
    subtopic: 'Histoire du Maroc',
    text: "Sous quelle dynastie arabo-berbère la ville impériale de Marrakech a-t-elle été fondée au XIe siècle ?",
    options: ["Les Almoravides", "Les Almohades", "Les Mérinides", "Les Saadiens"],
    correctOptionIndex: 0,
    explanation: "Marrakech a été fondée vers 1070 par Youssef Ibn Tachfine, souverain de la dynastie des Almoravides (Al-Murabitun).",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-hist-3',
    section: 'Histoire & Géographie',
    subtopic: 'Histoire du Maroc',
    text: "En quelle année le Maroc a-t-il recouvré officiellement son indépendance nationale de la France et de l'Espagne ?",
    options: ["1952", "1956", "1959", "1961"],
    correctOptionIndex: 1,
    explanation: "Le Maroc a obtenu son indépendance de la France et de l'Espagne en 1956, proclamée par Sa Majesté le Roi Mohammed V à son retour d'exil.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-hist-4',
    section: 'Histoire & Géographie',
    subtopic: 'Histoire du Maroc',
    text: "Quel est le nom du célèbre voyageur, explorateur et géographe marocain du XIVe siècle, originaire de Tanger, ayant parcouru plus de 120 000 km ?",
    options: ["Ibn Khaldoun", "Ibn Battuta", "Al Idrissi", "Ibn Rochd (Averroès)"],
    correctOptionIndex: 1,
    explanation: "Ibn Battuta (1304-1368) est un explorateur originaire de Tanger dont les récits de voyage ('Rihla') sont fondamentaux pour l'histoire médiévale du monde islamique et de l'Asie.",
    difficulty: 'Facile'
  },

  // --- 8. SCIENCES & TECHNOLOGY ---
  {
    id: 'cul-sci-1',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sciences & Technologie',
    text: "Quel est le nom du premier satellite marocain d'observation de la Terre, lancé en novembre 2017 depuis la Guyane française ?",
    options: ["Maroc-Sat 1", "Mohammed VI-A", "Al-Massira 1", "Atlas-Ona 2"],
    correctOptionIndex: 1,
    explanation: "Le satellite Mohammed VI-A a été mis sur orbite avec succès le 8 novembre 2017 pour surveiller le territoire national, l'agriculture et les frontières.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-sci-2',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sciences & Technologie',
    text: "Quel pays a été le premier au monde à adopter officiellement le Bitcoin comme monnaie légale en septembre 2021 ?",
    options: ["Le Salvador", "La Suisse", "Singapour", "Le Venezuela"],
    correctOptionIndex: 0,
    explanation: "Le Salvador est devenu le premier pays au monde à donner un cours légal au Bitcoin le 7 septembre 2021 sous l'impulsion du président Nayib Bukele.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-sci-3',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sciences & Technologie',
    text: "Quel savant d'origine allemande a formulé la théorie de la relativité restreinte puis générale au début du XXe siècle ?",
    options: ["Isaac Newton", "Albert Einstein", "Marie Curie", "Max Planck"],
    correctOptionIndex: 1,
    explanation: "Albert Einstein a publié ses théories de la relativité en 1905 (restreinte) puis en 1915 (générale), révolutionnant la physique moderne.",
    difficulty: 'Facile'
  },
  {
    id: 'cul-sci-4',
    section: 'Arts, Lettres & Sciences',
    subtopic: 'Sciences & Technologie',
    text: "Quelle entreprise de recherche en intelligence artificielle a lancé ChatGPT en novembre 2022, déclenchant l'essor mondial de l'IA générative ?",
    options: ["Google", "Microsoft", "OpenAI", "Meta"],
    correctOptionIndex: 2,
    explanation: "ChatGPT a été développé et publié par le laboratoire de recherche américain OpenAI le 30 novembre 2022.",
    difficulty: 'Facile'
  },

  // --- 9. SRS MEMORIZATION PARAGRAPHS ---
  {
    id: 'cul-memo-1',
    section: 'Mémorisation',
    subtopic: 'Fiche Mémorisation',
    text: "[TEXTE À MÉMORISER] L'Initiative Nationale pour le Développement Humain (INDH) a été lancée au Maroc le 18 mai 2005 par Sa Majesté le Roi Mohammed VI. Son but est de lutter contre la pauvreté, la précarité et l'exclusion sociale à travers des projets de développement de proximité. L'INDH repose sur trois axes majeurs : l'amélioration des conditions de vie, le soutien aux personnes vulnérables et l'accompagnement des générations montantes.\n\nQUESTION : Quel jour et en quelle année l'INDH a-t-elle été lancée par le Roi Mohammed VI ?",
    options: ["18 mai 2005", "30 juillet 1999", "6 novembre 1975", "2 mars 1956"],
    correctOptionIndex: 0,
    explanation: "Le texte indique explicitement : 'lancée au Maroc le 18 mai 2005 par Sa Majesté le Roi Mohammed VI'.",
    difficulty: 'Moyen'
  },
  {
    id: 'cul-memo-2',
    section: 'Mémorisation',
    subtopic: 'Fiche Mémorisation',
    text: "[TEXTE À MÉMORISER] Le complexe solaire NOOR de Ouarzazate est l'un des plus grands parcs solaires thermodynamiques au monde. Lancé en 2013, il s'étend sur plus de 3 000 hectares et dispose d'une capacité de production globale de 580 MW. Il permet d'éviter l'émission de près de 760 000 tonnes de dioxyde de carbone par an, soutenant l'objectif du Maroc de porter la part des énergies renouvelables à plus de 52% du mix électrique d'ici 2030.\n\nQUESTION : Quelle est la capacité de production globale du complexe solaire NOOR de Ouarzazate ?",
    options: ["300 MW", "580 MW", "760 MW", "1000 MW"],
    correctOptionIndex: 1,
    explanation: "Le texte de mémorisation mentionne explicitement que le parc solaire Noor 'dispose d'une capacité de production globale de 580 MW'.",
    difficulty: 'Moyen'
  }
];

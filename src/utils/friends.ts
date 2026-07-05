export interface Friend {
  id: string;
  username: string;
  avatar: string;
  targetSchool: string;
  status: 'Online' | 'Offline' | 'Studying';
  friendCode: string;
  leagueScore: number;
}

export interface FriendRequest {
  id: string;
  username: string;
  avatar: string;
  targetSchool: string;
  friendCode: string;
}

// Initial mock friends to start the competition
const DEFAULT_FRIENDS: Friend[] = [
  {
    id: 'f-1',
    username: 'Sofia Mansouri',
    avatar: '👩‍🎓',
    targetSchool: 'ENCG Settat',
    status: 'Studying',
    friendCode: 'TAF-504-SOF',
    leagueScore: 320,
  },
  {
    id: 'f-2',
    username: 'Anas Bennani',
    avatar: '👨‍💻',
    targetSchool: 'ENCG Casablanca',
    status: 'Online',
    friendCode: 'TAF-189-ANA',
    leagueScore: 450,
  },
  {
    id: 'f-3',
    username: 'Youssef El Alami',
    avatar: '🦁',
    targetSchool: 'ENCG Marrakech',
    status: 'Offline',
    friendCode: 'TAF-773-YOU',
    leagueScore: 180,
  },
  {
    id: 'f-4',
    username: 'Ghita Kadiri',
    avatar: '🦊',
    targetSchool: 'ENCG Rabat',
    status: 'Online',
    friendCode: 'TAF-412-GHI',
    leagueScore: 280,
  }
];

const DEFAULT_PENDING_REQUESTS: FriendRequest[] = [
  {
    id: 'r-1',
    username: 'Walid Slaoui',
    avatar: '🦉',
    targetSchool: 'ENCG Tangier',
    friendCode: 'TAF-910-WAL',
  }
];

// Helper to get remaining time for the 3-day cyclic league
export function getLeagueTimeRemaining(): string {
  // We simulate a 3-day cycle starting from a fixed anchor date or current day
  const cycleMs = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
  const now = Date.now();
  
  // Anchor date in the past (Sunday, June 28, 2026, 00:00:00)
  const anchorTime = 1782604800000; 
  const elapsed = now - anchorTime;
  const remainingMs = cycleMs - (elapsed % cycleMs);
  
  const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  
  return `${days}j ${hours}h ${minutes}m`;
}

// Load friends list
export function getFriends(): Friend[] {
  const stored = localStorage.getItem('tafem_friends_list');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_FRIENDS;
    }
  }
  // If not set, initialize and save
  localStorage.setItem('tafem_friends_list', JSON.stringify(DEFAULT_FRIENDS));
  return DEFAULT_FRIENDS;
}

// Save friends list
export function saveFriends(friends: Friend[]): void {
  localStorage.setItem('tafem_friends_list', JSON.stringify(friends));
}

// Load pending requests
export function getPendingRequests(): FriendRequest[] {
  const stored = localStorage.getItem('tafem_pending_requests');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_PENDING_REQUESTS;
    }
  }
  localStorage.setItem('tafem_pending_requests', JSON.stringify(DEFAULT_PENDING_REQUESTS));
  return DEFAULT_PENDING_REQUESTS;
}

// Save pending requests
export function savePendingRequests(requests: FriendRequest[]): void {
  localStorage.setItem('tafem_pending_requests', JSON.stringify(requests));
}

// Send Friend Request
export function sendFriendRequest(usernameOrCode: string): { success: boolean; message: string; target?: FriendRequest } {
  const friends = getFriends();
  const pending = getPendingRequests();

  const query = usernameOrCode.trim().toUpperCase();
  if (!query) {
    return { success: false, message: "Le code ou nom ne peut pas être vide." };
  }

  // Check if already friends
  const isAlreadyFriend = friends.some(f => 
    f.friendCode.toUpperCase() === query || 
    f.username.toUpperCase() === query
  );
  if (isAlreadyFriend) {
    return { success: false, message: "Vous êtes déjà ami avec ce candidat." };
  }

  // Check if already in pending requests
  const isAlreadyPending = pending.some(r => 
    r.friendCode.toUpperCase() === query || 
    r.username.toUpperCase() === query
  );
  if (isAlreadyPending) {
    return { success: false, message: "Une demande d'ami est déjà en attente." };
  }

  // Generate a random mock ENCG user who accepted the invitation
  const schools = ['ENCG Agadir', 'ENCG Casablanca', 'ENCG El Jadida', 'ENCG Marrakech', 'ENCG Settat', 'ENCG Fez', 'ENCG Oujda'];
  const avatars = ['🧑‍🎓', '👩‍🎓', '🦁', '🦊', '🦉', '🐱'];
  
  // Create a cute mock name if they used a TAF-code
  let generatedName = usernameOrCode;
  if (query.startsWith('TAF-')) {
    const firstNames = ['Amine', 'Kenza', 'Yassine', 'Ranya', 'Hassan', 'Meriem', 'Zineb', 'Omar'];
    const lastNames = ['Fassi', 'Alami', 'Tahiri', 'Berrada', 'Amrani', 'El Fassi', 'Sbaa'];
    generatedName = firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)];
  }

  const newRequest: FriendRequest = {
    id: 'req-' + Date.now(),
    username: generatedName,
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    targetSchool: schools[Math.floor(Math.random() * schools.length)],
    friendCode: query.startsWith('TAF-') ? query : 'TAF-' + Math.floor(100 + Math.random() * 900) + '-' + query.substring(0, 3).toUpperCase()
  };

  return { 
    success: true, 
    message: `Demande d'ami envoyée avec succès à ${newRequest.username} !`,
    target: newRequest 
  };
}

// User league score
export function getUserLeagueScore(): number {
  const score = localStorage.getItem('tafem_user_league_score');
  return score ? parseInt(score, 10) : 0;
}

export function saveUserLeagueScore(score: number): void {
  localStorage.setItem('tafem_user_league_score', score.toString());
}

// Simulate other friends earning some scores periodically to keep the championship competitive
export function simulateFriendsActiveScores(): void {
  const friends = getFriends();
  const updated = friends.map(f => {
    // 35% chance that a friend earns some points when simulated
    if (Math.random() > 0.65) {
      const addedPoints = Math.floor(10 + Math.random() * 4) * 10; // 100 to 130 pts
      return {
        ...f,
        leagueScore: f.leagueScore + addedPoints,
        status: Math.random() > 0.5 ? 'Studying' as const : 'Online' as const
      };
    }
    return f;
  });
  saveFriends(updated);
}

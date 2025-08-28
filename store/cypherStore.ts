import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

interface UserPreferences {
  sniffaVoiceEnabled: boolean;
  sniffaAccent: 'urban' | 'cajun' | 'posh' | 'glitchy';
  notificationTone: 'balanced' | 'clinical' | 'humor';
  parentalMode: boolean;
  dailySugarLimit: number;
}

interface ScanHistory {
  id: string;
  productName: string;
  barcode?: string;
  scanDate: number;
  sugarContent: number;
  hiddenSugars: string[];
  cypherMode: 'cypher' | 'sniffa' | 'guardian';
  userRating?: number;
}

interface CypherState {
  badges: Badge[];
  preferences: UserPreferences;
  scanHistory: ScanHistory[];
  totalScans: number;
  hiddenSugarsFound: number;
  
  // Actions
  addScan: (scan: Omit<ScanHistory, 'id'>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  earnBadge: (badgeId: string) => void;
  checkBadgeEligibility: () => void;
  getSniffaResponse: (productName: string, sugarContent: number) => string;
}

const initialBadges: Badge[] = [
  {
    id: 'sugar-cypher-initiate',
    name: 'Sugar Cypher Initiate',
    description: 'Completed your first scan',
    icon: '🔍',
    earned: false
  },
  {
    id: 'alias-spotter',
    name: 'Alias Spotter',
    description: 'Found 10 hidden sugars',
    icon: '🕵️',
    earned: false
  },
  {
    id: 'label-assassin',
    name: 'Label Assassin',
    description: 'Scanned 50 products',
    icon: '🎯',
    earned: false
  },
  {
    id: 'sweet-sleuth',
    name: 'Sweet Sleuth',
    description: 'Identified 25 different sugar aliases',
    icon: '🔎',
    earned: false
  },
  {
    id: 'cypher-master',
    name: 'Cypher Master',
    description: 'Scanned 100 products',
    icon: '👑',
    earned: false
  }
];

const sniffaResponses = {
  lowSugar: [
    "Not bad, Shoog! This one's playing it straight.",
    "Clean scan, Shoog. No sweet tricks here.",
    "This one's honest about its sugar game."
  ],
  mediumSugar: [
    "Shoog, this one's got some sugar swagger but nothing too wild.",
    "Middle of the road sweetness, Shoog. Could be worse.",
    "This one's sweet but not trying to hide it."
  ],
  highSugar: [
    "Whoa there, Shoog! This thing's packing serious sugar heat.",
    "Damn, Shoog... that's a sugar bomb in disguise.",
    "This one's sweet enough to lie about it on its dating profile."
  ],
  veryHighSugar: [
    "SHOOG! That's not food, that's a glucose ambush!",
    "Sweet mother of sugar, Shoog! That's candy pretending to be food.",
    "This thing's got more sugar than a candy factory explosion."
  ]
};

export const useCypherStore = create<CypherState>()(
  persist(
    (set, get) => ({
      badges: initialBadges,
      preferences: {
        sniffaVoiceEnabled: true,
        sniffaAccent: 'urban',
        notificationTone: 'balanced',
        parentalMode: false,
        dailySugarLimit: 25
      },
      scanHistory: [],
      totalScans: 0,
      hiddenSugarsFound: 0,
      
      addScan: (scanData) => {
        const scan: ScanHistory = {
          ...scanData,
          id: Date.now().toString()
        };
        
        const hiddenSugarCount = scanData.hiddenSugars.length;
        
        set(state => ({
          scanHistory: [scan, ...state.scanHistory],
          totalScans: state.totalScans + 1,
          hiddenSugarsFound: state.hiddenSugarsFound + hiddenSugarCount
        }));
        
        // Check for badge eligibility after adding scan
        get().checkBadgeEligibility();
      },
      
      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },
      
      earnBadge: (badgeId) => {
        set(state => ({
          badges: state.badges.map(badge =>
            badge.id === badgeId
              ? { ...badge, earned: true, earnedAt: Date.now() }
              : badge
          )
        }));
      },
      
      checkBadgeEligibility: () => {
        const state = get();
        
        // Sugar Cypher Initiate - first scan
        if (state.totalScans >= 1 && !state.badges.find(b => b.id === 'sugar-cypher-initiate')?.earned) {
          get().earnBadge('sugar-cypher-initiate');
        }
        
        // Alias Spotter - 10 hidden sugars
        if (state.hiddenSugarsFound >= 10 && !state.badges.find(b => b.id === 'alias-spotter')?.earned) {
          get().earnBadge('alias-spotter');
        }
        
        // Label Assassin - 50 scans
        if (state.totalScans >= 50 && !state.badges.find(b => b.id === 'label-assassin')?.earned) {
          get().earnBadge('label-assassin');
        }
        
        // Cypher Master - 100 scans
        if (state.totalScans >= 100 && !state.badges.find(b => b.id === 'cypher-master')?.earned) {
          get().earnBadge('cypher-master');
        }
      },
      
      getSniffaResponse: (productName, sugarContent) => {
        let responses;
        
        if (sugarContent <= 5) {
          responses = sniffaResponses.lowSugar;
        } else if (sugarContent <= 15) {
          responses = sniffaResponses.mediumSugar;
        } else if (sugarContent <= 25) {
          responses = sniffaResponses.highSugar;
        } else {
          responses = sniffaResponses.veryHighSugar;
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }),
    {
      name: 'cypher-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
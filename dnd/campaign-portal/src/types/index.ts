export interface Campaign {
  id: string;
  name: string;
  campaignTheme: string;
  summary: string;
  dungeonmaster: User | null;
}

export interface User {
  id: string;
  username: string;
  role: 'dm' | 'player';
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  campaignId: string;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  campaignId: string;
}

export interface Character {
  userId: string;
  id: string;
  name: string;
  class: string;
  level: number;
  campaignId: string;
  dndBeyondUrl: string | undefined;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  campaignId: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestsCollection {
  totalQuests: number;
  active: Quest[];
  completed: Quest[];
  failed: Quest[];
}

export interface Campaign {
  id: string;
  name: string;
  campaignTheme: string;
  summary: string;
  dungeonMasterId: any;
  dungeonmaster: User | null;
}

export interface User {
  id: string;
  username: string;
  email: string;
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
  ownerId: string;
  campaignId: string;
  dndBeyondUrl: string;
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

export interface CardProps {
  title: string;
  icon: React.ComponentType;
  theme: string;
  className?: string;
  onClick?: () => void;
}

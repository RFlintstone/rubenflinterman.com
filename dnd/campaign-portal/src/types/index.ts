export interface Campaign {
  id: string;
  name: string;
  theme: 'amber' | 'blue';
  summary: string;
}

export interface User {
  name: string;
  role: 'admin' | 'player';
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
}

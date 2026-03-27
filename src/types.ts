export interface Zone {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Reading {
  id: string;
  zoneId: string;
  timestamp: string;
  dryBulb: number;
  wetBulb: number;
  relativeHumidity: number;
  notes?: string;
}

export type ViewState = 'dashboard' | 'new-reading' | 'settings';

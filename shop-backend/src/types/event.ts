// src/types/event.ts
export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string;
  imageUrl?: string;
  isActive: boolean;
}

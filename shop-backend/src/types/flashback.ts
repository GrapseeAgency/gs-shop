// src/types/flashback.ts
export interface FlashbackProduct {
  id: number;
  productId: number;
  startDate: string; // ISO date
  endDate?: string;
  discountPercent: number;
  isActive: boolean;
}

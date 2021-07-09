export interface Player {
  id: string;
  databaseId: string;
  email: string;
  balance: number;
  avatarURL: string;
  totalBetValue: number;
  folded: boolean;
  isTurn: boolean;
  position?: string;
  cards?: string[];
}
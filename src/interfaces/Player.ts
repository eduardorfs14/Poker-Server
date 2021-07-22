export interface Player {
  id: string;
  databaseId: string;
  name: string;
  email: string;
  balance: number;
  avatarURL: string | null;
  totalBetValue: number;
  folded: boolean;
  isTurn: boolean;
  timer: number;
  position?: string;
  cards?: string[];
}
export interface Player {
  id: string;
  databaseId: string;
  name: string;
  email: string;
  balance: number;
  avatar_url: string | null;
  totalBetValue: number;
  totalBetValueOnRound: number;
  folded: boolean;
  isTurn: boolean;
  allIn: boolean;
  timer: number;
  position?: string;
  cards?: string[];
}
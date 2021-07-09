import { Socket } from "socket.io";
import { Player } from "./Player";

export interface Table {
  id: string;
  name: string;
  bigBlind: number;
  minPlayers: number;
  maxPlayers: number;
  houseSlice: number;
  highestBet: number;
  totalHighestBet: number;
  totalBets: number;
  roundPot: number;
  roundStatus: boolean;
  flopStatus: boolean;
  turnStatus: boolean;
  riverStatus: boolean;
  deck: string[];
  cards: string[];
  players: Player[];
  sockets: Socket[];
  active: boolean;
}
import { Player } from "../interfaces/Player";

export function getPosition(players: Player[]) {
  if (players.length === 0) {
    return 'SB';
  } else if (players.length === 1) {
    return 'BB';
  } else if (players.length === 2) {
    return 'UTG-1';
  } else if (players.length === 3) {
    return 'UTG-2';
  } else if (players.length === 4) {
    return 'UTG-3';
  } else if (players.length === 5) {
    return 'MP-1';
  } else if (players.length === 6) {
    return 'MP-2';
  } else if (players.length === 7) {
    return 'CO';
  } else if (players.length === 8) {
    return 'DEALER';
  }
}
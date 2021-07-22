import { generateDeck } from "../functions/generateDeck";
import { Player } from "../interfaces/Player";

export function gameSetup(players: Player[]) {
  const deck = generateDeck();
  players.forEach(player => {
    player.cards = [deck[0], deck[1]]
    deck.shift();
    deck.shift();
  });

  players.forEach((player, index) => {
    if (index === 0) player.position = 'SB';
    if (index === 1) player.position = 'BB';
    if (index === 2) player.position = 'UTG-1';
    if (index === 3) player.position = 'UTG-2';
    if (index === 4) player.position = 'UTG-3';
    if (index === 5) player.position = 'MP-1';
    if (index === 6) player.position = 'MP-2';
    if (index === 7) player.position = 'CO';
    if (index === 8) player.position = 'DEALER';

    player.folded = false;
    player.timer = 45;
  });

  if (players.length <= 2) {
    players.forEach(player => {
      player.isTurn = false;
    });
    const sb = players.find(player => player.position === 'SB');
    if (sb) {
      sb.isTurn = true;
    }
  } else if (players.length >= 3) {
    players.forEach(player => {
        player.isTurn = false;
    });
    const utg1 = players.find(player => player.position === 'UTG-1');
    if (utg1) {
      utg1.isTurn = true;
    }
  }

  return {
    deck
  }
}
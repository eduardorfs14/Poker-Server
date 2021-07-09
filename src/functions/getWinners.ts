import { Hand } from 'pokersolver';
import { Player } from '../interfaces/Player';
import { getCombination } from './getCombination';

export function getWinners(players: Player[], tableCards: string[]) {
  let winners: Player[] = [];

  const hands: any[] = [];

  players.forEach(player => {
    if (!player.cards) {
      throw new Error('Player does not have cards');
    };
    const playerHand = getCombination(player.cards, tableCards);
    hands.push(playerHand);
  });

  const solvedHands: Array<any> = Hand.winners(hands);

  if (solvedHands.length > 1) {
    // Empate...
    players.forEach(player => {
      if (!player.cards) {
        throw new Error('Player does not have cards');
      };
      const playerHand = getCombination(player.cards, tableCards);

      const solvedHandsFormated: string = solvedHands.toString().replace(/\s/g, '');
      const playerHandCardsFormated: string = playerHand.toString().repeat(solvedHands.length).replace(/\s/g, '').replace(/([a-z][A-Z])/g, ',');

      if (solvedHandsFormated === playerHandCardsFormated.replace(/([a-z][0-9])/g, ',')) {
        winners.push(player);
      };
    });
  };

  players.forEach(player => {
    if (!player.cards) {
      throw new Error('Player does not have cards');
    };
    const playerHand = getCombination(player.cards, tableCards);

    const solvedHandsFormated: string = solvedHands.toString().replace(/\s/g, '');
    const playerHandCardsFormated: string = playerHand.cards.toString().replace(/\s/g, '');

    if (solvedHandsFormated === playerHandCardsFormated) {
      winners.push(player);
    };
  });

  return winners;
}
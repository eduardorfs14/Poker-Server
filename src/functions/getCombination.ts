import { Hand } from 'pokersolver';

export function getCombination(playerCards: string[], tableCards: string[] | undefined) {
  if(!tableCards) {
    const combination = Hand.solve(playerCards)
    return combination;
  };

  const hand = playerCards.concat(tableCards);
  const combination = Hand.solve(hand);
  return combination
}
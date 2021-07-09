export const generateTurn = (deck: string[]) => {
  const turn = [deck[0]];
  deck.shift();

  return {
    generatedTurn: turn,
    newDeck: deck,
  };
};
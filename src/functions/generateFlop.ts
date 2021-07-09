export const generateFlop = (deck: string[]) => {
  const flop = [deck[0], deck[1], deck[2]];
  deck.shift();
  deck.shift();
  deck.shift();

  return {
    generatedFlop: flop,
    newDeck: deck
  };
};
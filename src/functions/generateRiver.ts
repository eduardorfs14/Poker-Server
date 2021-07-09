export const generateRiver = (deck: string[]) => {
  const river = [deck[0]];
  deck.shift();

  return {
    generatedRiver: river,
    newDeck: deck,
  };
};
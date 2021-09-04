import { Socket } from "socket.io";
import { generateTurn } from "../functions/generateTurn";
import { Table } from "../interfaces/Table";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";

export function turn(table: Table, socket: Socket) {
  socket.emit('round_pot', table.roundPot);
  socket.to(table.id).emit('round_pot', table.roundPot);

  // const { generatedTurn, newDeck } = generateTurn(table.deck);
  table.players.forEach(player => {
    // Adicionar propriedade "totalBetValueOnRound" aos "players"
    player.totalBetValueOnRound = 0;
    const equivalentSocket = table.sockets.find(s => s.id === player.id);
    equivalentSocket?.emit('player', player);
  });
  // table.deck = newDeck;
  // table.cards = table.cards.concat(generatedTurn);
  const flop = [table.cards[0], table.cards[1], table.cards[2]];
  const turn = flop.concat(table.cards[3]);
  table.turnStatus = true;
  table.highestBet = 0,
  table.totalHighestBet = 0,
  table.totalBets = 0;
  const minBet = (table.highestBet + table.bigBlind);
  socket.emit('min_bet', minBet);
  socket.emit('table_cards', turn);
  socket.to(table.id).emit('table_cards', turn);
  socket.to(table.id).emit('min_bet', minBet);
  emitCardsForEachSocket(table.sockets, table.players, table.cards);
  emitAllPlayersForEachSocket(table.sockets, table.players);
}

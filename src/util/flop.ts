import { Socket } from "socket.io";
import { generateFlop } from "../functions/generateFlop";
import { Table } from "../interfaces/Table";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";

export function flop(table: Table, socket: Socket) {
  socket.emit('round_pot', table.roundPot);
  socket.to(table.id).emit('round_pot', table.roundPot);

  // const { generatedFlop, newDeck } = generateFlop(table.deck);
  table.players.forEach(player => {
    // Adicionar propriedade "totalBetValueOnRound" aos "players"
    player.totalBetValueOnRound = 0;
    const equivalentSocket = table.sockets.find(s => s.id === player.id);
    equivalentSocket?.emit('player', player);
  });
  // table.deck = newDeck;
  // table.cards = table.cards.concat(generatedFlop);
  const flop = [table.cards[0], table.cards[1], table.cards[2]];
  table.flopStatus = true;
  table.highestBet = 0,
  table.totalHighestBet = 0,
  table.totalBets = 0;
  const minBet = (table.highestBet + table.bigBlind);
  socket.emit('min_bet', minBet);
  socket.emit('table_cards', flop);
  socket.to(table.id).emit('table_cards', flop);
  socket.to(table.id).emit('min_bet', minBet);
  emitCardsForEachSocket(table, table.cards);
  emitAllPlayersForEachSocket(table.sockets, table.players);
}
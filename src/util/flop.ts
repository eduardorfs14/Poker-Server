import { Socket } from "socket.io";
import { generateFlop } from "../functions/generateFlop";
import { Table } from "../interfaces/Table";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";

export function flop(table: Table, socket: Socket) {
  const { generatedFlop, newDeck } = generateFlop(table.deck);
  table.players.forEach(player => {
    // Adicionar propriedade "totalBetValue" aos "players"
    player.totalBetValue = 0;
  });
  table.deck = newDeck;
  table.cards = table.cards.concat(generatedFlop);
  table.flopStatus = true;
  table.highestBet = 0,
  table.totalHighestBet = 0,
  table.totalBets = 0;
  socket.emit('table_cards', table.cards)
  socket.to(table.id).emit('table_cards', table.cards);
  emitCardsForEachSocket(table.sockets, table.players, table.cards);
}
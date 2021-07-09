import { Socket } from "socket.io";
import { generateTurn } from "../functions/generateTurn";
import { Table } from "../interfaces/Table";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";

export function turn(table: Table, socket: Socket) {
  const { generatedTurn, newDeck } = generateTurn(table.deck);
  table.players.forEach(player => {
    // Adicionar propriedade "totalBetValue" aos "players"
    player.totalBetValue = 0;
  });
  table.deck = newDeck;
  table.turnStatus = true;
  table.highestBet = 0,
  table.totalHighestBet = 0,
  table.totalBets = 0;
  table.cards = table.cards.concat(generatedTurn);
  socket.emit('table_cards', table.cards)
  socket.to(table.id).emit('table_cards', table.cards);
  emitCardsForEachSocket(table.sockets, table.players, table.cards);
}

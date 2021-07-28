import { Socket } from "socket.io";
import { generateRiver } from "../functions/generateRiver";
import { Table } from "../interfaces/Table";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";

export function river(table: Table, socket: Socket ) {
  const { generatedRiver, newDeck } = generateRiver(table.deck);
  table.players.forEach(player => {
    // Adicionar propriedade "totalBetValueOnRound" aos "players"
    player.totalBetValueOnRound = 0;
  });
  table.deck = newDeck;
  table.riverStatus = true;
  table.highestBet = 0,
  table.totalHighestBet = 0,
  table.totalBets = 0;
  table.cards = table.cards.concat(generatedRiver);
  socket.emit('table_cards', table.cards)
  socket.to(table.id).emit('table_cards', table.cards);
  emitCardsForEachSocket(table.sockets, table.players, table.cards);
}
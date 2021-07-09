import { Socket } from "socket.io";
import { Table } from "../interfaces/Table";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";
import { gameSetup } from "./gameSetup";

export async function startRound(table: Table, socket: Socket, isNewRound: boolean): Promise<void> {
  const { deck } = gameSetup(table.players);

  if (table.players.length <= 2) {
    table.players.forEach(player => {
      player.isTurn = false;
    });
    const sb = table.players.find(player => player.position === 'SB');
    if (sb) {
      sb.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === sb.id)
      socket?.emit('your_turn');
    }
  } else if (table.players.length >= 3) {
    table.players.forEach(player => {
        player.isTurn = false;
    });
    const utg1 = table.players.find(player => player.position === 'UTG-1');
    if (utg1) {
      utg1.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === utg1.id)
      socket?.emit('your_turn');
    }
  }

  table.players.forEach(player => {
    // Adicionar propriedade "isTurn" aos "players"
    if (isNewRound) {
      // Adicionar propriedade "totalBetValue" ao "player"
      if (player.position === 'SB') {
        player.totalBetValue = (table.bigBlind / 2);
      } else if (player.position === 'BB') {
        player.totalBetValue = table.bigBlind;
      } else {
        player.totalBetValue = 0;
      }
    } else {
      // Adicionar propriedade "totalBetValue" aos "players"
      player.totalBetValue = 0;
    }
  });

  table.roundStatus = true;
  isNewRound ? table.highestBet = (table.bigBlind) : table.highestBet = 0;
  isNewRound ? table.totalHighestBet = (table.bigBlind) : table.totalHighestBet = 0;
  table.totalBets = 0;
  table.roundPot = (table.bigBlind + (table.bigBlind / 2));
  table.deck = deck;
  table.cards = [];
  table.flopStatus = false;
  table.turnStatus = false;
  table.riverStatus = false;
  socket.emit('round_pot', table.roundPot);
  socket.emit('table_cards', table.cards);
  socket.to(table.id).emit('round_pot', table.roundPot);
  socket.to(table.id).emit('table_cards', table.cards);
  emitCardsForEachSocket(table.sockets, table.players);
  emitAllPlayersForEachSocket(table.sockets, table.players);
}
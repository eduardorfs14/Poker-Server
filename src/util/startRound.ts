import { PrismaClient } from '@prisma/client';
import { Socket } from "socket.io";
import { Table } from "../interfaces/Table";
import { PokerTable } from '../PokerTable/PokerTable';
import { decrementTimer } from "./decrementTimer";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { emitCardsForEachSocket } from "./emitCardsForEachSocket";
import { gameSetup } from "./gameSetup";

const prisma = new PrismaClient();

export async function startRound(table: Table, socket: Socket, isNewRound: boolean, justFolded?: boolean): Promise<void> {
  table.players.forEach(async player => {
    if (player.balance < (table.bigBlind * 5)) {
      const equivalentSocket = table.sockets.find(s => s.id === player.id);
      if (!equivalentSocket) return;
      
      const pokerTable = new PokerTable();
      await pokerTable.leave(table, player, equivalentSocket, true);
      equivalentSocket.emit('error_msg', 'Saldo muito baixo para mesa');
    }
  });

  // Impedir que rodada comece com 1 ou menos jogadores
  if (table.players.length <= 1) {
    return;
  }
  
  const { deck } = gameSetup(table.players);

  if (table.players.length <= 2) {
    table.players.forEach(player => {
      player.isTurn = false;
    });
    const sb = table.players.find(player => player.position === 'SB');
    if (sb) {
      sb.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === sb.id)
      if (!socket) {
        return;
      }
      socket.emit('your_turn');
      socket.emit('player', sb);
      const interval = decrementTimer(sb, table, socket);
      if (justFolded) {
        clearInterval(interval);
      }
    }
  } else if (table.players.length >= 3) {
    table.players.forEach(player => {
        player.isTurn = false;
    });
    const utg1 = table.players.find(player => player.position === 'UTG-1');
    if (utg1) {
      utg1.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === utg1.id)
      if (!socket) {
        return;
      }
      socket.emit('your_turn');
      socket.emit('player', utg1);
      const interval = decrementTimer(utg1, table, socket);
      if (justFolded) {
        clearInterval(interval);
      }
    }
  }

  table.players.forEach(async player => {
    player.allIn = false;
    // Adicionar propriedade "isTurn" aos "players"
    if (isNewRound) {
      // Adicionar propriedade "totalBetValueOnRound e totalBetValue" ao "player"
      if (player.position === 'SB') {
        player.totalBetValue = (table.bigBlind / 2);
        player.totalBetValueOnRound = (table.bigBlind / 2);
        player.balance -= (table.bigBlind / 2);
        await prisma.users.update({ data: { balance: parseInt(player.balance.toFixed(0)) }, where: { id: player.databaseId } })
      } else if (player.position === 'BB') {
        player.totalBetValue = table.bigBlind;
        player.totalBetValueOnRound = table.bigBlind;
        player.balance -= table.bigBlind;
        await prisma.users.update({ data: { balance: parseInt(player.balance.toFixed(0)) }, where: { id: player.databaseId } })
      } else {
        player.totalBetValue = 0;
        player.totalBetValueOnRound = 0;
      }
    } else {
      // Adicionar propriedade "totalBetValue" aos "players"
      player.totalBetValue = 0;
      player.totalBetValueOnRound = 0;
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
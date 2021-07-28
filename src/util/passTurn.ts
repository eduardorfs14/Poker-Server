import { Socket } from 'socket.io';
import { PrismaClient } from "@prisma/client";
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";
import { decrementTimer } from "./decrementTimer";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { movePlayersInTable } from "./movePlayersInTable";
import { startRound } from "./startRound";
import { showdonw } from './showdown';
import { flop } from './flop';
import { turn } from './turn';
import { river } from './river';

const prisma = new PrismaClient();

export async function passTurn(player: Player, table: Table, socket: Socket, isFold?: boolean) {
  table.players.forEach(player => player.isTurn = false);

  const playersWhoDidNotFold = table.players.filter(player => player.folded === false)
  const playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(player => player.allIn === false);

  if (playersWhoDidNotFold.length === 1) {
    // Finalizar o round.
    // Vencedor é o único que não foldou
    const winner = playersWhoDidNotFold[0];
    winner.isTurn = false;
    
    const newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * 2);
    socket.emit('round_pot', table.roundPot);
    socket.emit('table_cards', table.cards);
    socket.emit('winner', winner.databaseId);

    socket.to(table.id).emit('round_pot', table.roundPot);
    socket.to(table.id).emit('table_cards', table.cards);
    socket.to(table.id).emit('winner', winner.databaseId);

    table.roundStatus = false;
    const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } });
    winner.balance = balance
    emitAllPlayersForEachSocket(table.sockets, table.players);
    
    if (isFold) {
      // Caso o jogador tenha saido da mesa, não emitir o player para ele, assim fazendo com que no front ele não apareca na mesa
      socket.emit('player', player);

      movePlayersInTable(table);
      startRound(table, socket, true);
    }

    return;
  } else if (playersWhoDidNotFoldAndAreNotAllIn.length === 1 && table.totalBets >= playersWhoDidNotFold.length) {
      if (playersWhoDidNotFoldAndAreNotAllIn[0].totalBetValue >= table.highestBet || playersWhoDidNotFoldAndAreNotAllIn[0].balance <= 0) {
        if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
          setTimeout(() => flop(table, socket), 1000);
          setTimeout(() => turn(table, socket), 3000);
          setTimeout(() => river(table, socket), 6000);
          setTimeout(() => showdonw(table, socket), 11000);
          return;
        } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
          setTimeout(() => turn(table, socket), 1000);
          setTimeout(() => river(table, socket), 3000);
          setTimeout(() => showdonw(table, socket), 8000);
          return;
        } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
          setTimeout(() => river(table, socket), 1000);
          setTimeout(() => showdonw(table, socket), 5000);
          return;
        } else if (table.flopStatus && table.turnStatus && table.riverStatus) {
          setTimeout(() => showdonw(table, socket), 2000);
          return;
        };
    
        return;
      }
      
      return;
  } else {
    const playerIndex = table.players.indexOf(player);
    const nextPlayer = table.players.find((player, index) => player.folded === false && playerIndex < index);
    table.players.forEach(player => {
      player.timer = 45;
    });

    if (nextPlayer) {
      nextPlayer.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === nextPlayer.id)
      if (!socket) {
        return;
      }
      socket.emit('your_turn');
      const interval = decrementTimer(nextPlayer, table, socket);
      if (isFold) {
        clearInterval(interval);
      }
    } else {
      const nextPlayerThatDidNotFoldAndIsNotAllIn = table.players.find(player => player.folded === false);

      if (nextPlayerThatDidNotFoldAndIsNotAllIn) {
        nextPlayerThatDidNotFoldAndIsNotAllIn.isTurn = true;
        const socket = table.sockets.find(socket => socket.id === nextPlayerThatDidNotFoldAndIsNotAllIn.id)
        if (!socket) {
          return;
        }

        socket.emit('your_turn');
        const interval = decrementTimer(nextPlayerThatDidNotFoldAndIsNotAllIn, table, socket);
        if (isFold) {
          clearInterval(interval);
        }
      }
    }
  }
}

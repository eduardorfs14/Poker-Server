import { Socket } from 'socket.io';
import { PrismaClient } from "@prisma/client";
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";
import { decrementTimer } from "./decrementTimer";
import { emitAllPlayersForEachSocket } from "./emitAllPlayersForEachSocket";
import { movePlayersInTable } from "./movePlayersInTable";
import { startRound } from "./startRound";

const prisma = new PrismaClient();

export async function passTurn(player: Player, table: Table, socket: Socket, isFold?: boolean) {
  player.isTurn = false;
  const playersWhoDidNotFold = table.players.filter(player => player.folded === false)

  if (playersWhoDidNotFold.length === 1) {
    // Finalizar o round.
    // Vencedor é o único que não foldou
    const winner = playersWhoDidNotFold[0];
    winner.isTurn = false;
    
    const newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * 2);
    socket.emit('winner', winner.databaseId);
    socket.to(table.id).emit('winner', winner.databaseId);
    table.roundStatus = false;
    const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } });
    winner.balance = balance
    socket.emit('player', player);
    emitAllPlayersForEachSocket(table.sockets, table.players);

    if (isFold) {
      movePlayersInTable(table);
      startRound(table, socket, true);
    }

    return;
  } else {
    const playerIndex = table.players.indexOf(player);
    const playersWhoDidNotFold = table.players.filter(player => player.folded === false);
    const nextPlayer = playersWhoDidNotFold[playerIndex + 1];
    playersWhoDidNotFold.forEach(player => {
      player.timer = 45;
    });
    if (!nextPlayer) {
      const nextPlayerThatDidNotFold = table.players.find(player => player.folded === false);
      if (nextPlayerThatDidNotFold) {
        nextPlayerThatDidNotFold.isTurn = true;
        const socket = table.sockets.find(socket => socket.id === nextPlayerThatDidNotFold.id)
        if (!socket) {
          return;
        }
        socket.emit('your_turn');
        const interval = decrementTimer(nextPlayerThatDidNotFold, table, socket);
        if (isFold) {
          clearInterval(interval);
        }
      }
    } else {
      const nextPlayerThatDidNotFold = table.players.find((player, index) => player.folded === false && playerIndex < index)
      if (nextPlayerThatDidNotFold) {
        nextPlayerThatDidNotFold.isTurn = true;
        const socket = table.sockets.find(socket => socket.id === nextPlayerThatDidNotFold.id)
        if (!socket) {
          return;
        }
        socket.emit('your_turn');
        const interval = decrementTimer(nextPlayerThatDidNotFold, table, socket);
        if (isFold) {
          clearInterval(interval);
        }
      }
    }
  }

}

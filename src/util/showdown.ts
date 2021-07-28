import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
import { getWinners } from "../functions/getWinners";
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";
import { movePlayersInTable } from "./movePlayersInTable";
import { startRound } from "./startRound";

const prisma = new PrismaClient()

export async function showdonw(table: Table, socket: Socket) {
  const playersThatDidNotFold = table.players.filter(player => player.folded === false);
  const isSomeoneAllIn = playersThatDidNotFold.some(player => player.allIn === true);
  
  let winners = getWinners(playersThatDidNotFold, table.cards);

  if (isSomeoneAllIn) {
    let pot = table.roundPot;

    while (playersThatDidNotFold.length >= 1) {
      if (winners.length === 1) {
        const winner = winners[0];
  
        if (winner.allIn === true) {
          const winnerIndex = playersThatDidNotFold.indexOf(winner);
          playersThatDidNotFold.splice(winnerIndex, 1);
  
          // Multiplicar o saldo pelo número de jogadores na rodada
          const maxWin = (winner.totalBetValue * playersThatDidNotFold.length) - (((winner.totalBetValue * playersThatDidNotFold.length) / 100) * 2);
  
          winner.balance = parseInt(maxWin.toFixed(0))
          socket.emit('winner', winner.databaseId);
          socket.to(table.id).emit('winner', winner.databaseId);
          // table.roundStatus = false;
          pot -= maxWin;

          winners = getWinners(playersThatDidNotFold, table.cards);
  
          await prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } });
        } else {
          playersThatDidNotFold.splice(0, playersThatDidNotFold.length);
          const newBalance = (winner.balance + pot) - ((pot / 100) * 2)
          winner.balance = parseInt(newBalance.toFixed(0))
          socket.emit('winner', winner.databaseId);
          socket.to(table.id).emit('winner', winner.databaseId);
          table.roundStatus = false;
          // Iniciar outro round...
          // movePlayersInTable(table);
          // await startRound(table, socket, true);
          await prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } });
        }
      } else {
        console.log('2 winners');
      }
    }

    // Iniciar outro round...
    movePlayersInTable(table);
    await startRound(table, socket, true);

  };

  const potForEachWinner = table.roundPot / (winners.length);
  winners.forEach(winner => {
    const newBalance = (winner.balance + potForEachWinner) - ((potForEachWinner / 100) * 2)
    winner.balance = parseInt(newBalance.toFixed(0))
    socket.emit('winner', winner.databaseId);
    socket.to(table.id).emit('winner', winner.databaseId);
  });
  table.roundStatus = false;
  
  // Iniciar outro round...
  movePlayersInTable(table);
  await startRound(table, socket, true);
  winners.forEach(async winner => {
    await prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } });
  });
}
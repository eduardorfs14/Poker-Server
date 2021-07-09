import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
import { getWinners } from "../functions/getWinners";
import { Table } from "../interfaces/Table";
import { movePlayersInTable } from "./movePlayersInTable";
import { startRound } from "./startRound";

const prisma = new PrismaClient()

export async function showdonw(table: Table, socket: Socket) {
  const playersThatDidNotFold = table.players.filter(player => player.folded === false);
  const winners = getWinners(playersThatDidNotFold, table.cards);
  const potForEachWinner = table.roundPot / (winners.length);
  winners.forEach(async winner => {
    const newBalance = (winner.balance + potForEachWinner) - ((potForEachWinner / 100) * 2)
    const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } });
    winner.balance = balance
    socket.emit('winner', winner.databaseId);
    socket.to(table.id).emit('winner', winner.databaseId);
  });
  table.roundStatus = false;

  // Iniciar outro round...
  movePlayersInTable(table);
  await startRound(table, socket, true);
}
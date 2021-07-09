import { PrismaClient } from "@prisma/client";
import { Table } from "../interfaces/Table";

const prisma = new PrismaClient();

export async function getTables(): Promise<Table[]> {
  const databaseTables = await prisma.poker_tables.findMany()

  const tables = databaseTables.map(table => {
    const roundPot: number = (table.bigBlind + (table.bigBlind / 2));
    return {
      ...table,
      highestBet: table.bigBlind,
      totalHighestBet: table.bigBlind,
      totalBets: 0,
      roundPot,
      roundStatus: false,
      flopStatus: false,
      turnStatus: false,
      riverStatus: false,
      deck: [],
      cards: [],
      players: [],
      sockets: []
    }
  });

  return tables;
}
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

    // Zerar o pot caso não seja fold, pois se não for fold, não terá outro round.
    if (!isFold) {
      table.roundPot = 0;
    }
    
    const newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * table.houseSlice);
    socket.emit('round_pot', table.roundPot);
    socket.emit('table_cards', table.cards);

    socket.to(table.id).emit('round_pot', table.roundPot);
    socket.to(table.id).emit('table_cards', table.cards);

    table.roundStatus = false;
    const { balance } = await prisma.users.update({ data: { balance: Math.floor(newBalance) }, where: { id: winner.databaseId } });
    winner.balance = balance
    emitAllPlayersForEachSocket(table.sockets, table.players);
    
    if (isFold) {
      // Caso o jogador tenha saido da mesa, não emitir o player para ele, assim fazendo com que no front ele não apareça na mesa
      socket.emit('player', player);

      movePlayersInTable(table);
      startRound(table, socket, true);
    }

    return;
  } else if (playersWhoDidNotFoldAndAreNotAllIn.length === 0) {
    if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
      setTimeout(() => flop(table, socket), 500);
      setTimeout(() => turn(table, socket), 2000);
      setTimeout(() => river(table, socket), 4000);
      setTimeout(() => showdonw(table, socket), 7000);
      return;
    } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
      setTimeout(() => turn(table, socket), 500);
      setTimeout(() => river(table, socket), 2000);
      setTimeout(() => showdonw(table, socket), 4000);
      return;
    } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
      setTimeout(() => river(table, socket), 500);
      setTimeout(() => showdonw(table, socket), 2000);
      return;
    } else if (table.flopStatus && table.turnStatus && table.riverStatus) {
      setTimeout(() => showdonw(table, socket), 500);
      return;
    };
    
    return;
  } else if (playersWhoDidNotFoldAndAreNotAllIn.length === 1 && table.totalBets >= playersWhoDidNotFold.length) {
      if (playersWhoDidNotFoldAndAreNotAllIn[0]?.totalBetValue >= table.highestBet || playersWhoDidNotFoldAndAreNotAllIn[0]?.balance <= 0) {
        if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
          setTimeout(() => flop(table, socket), 500);
          setTimeout(() => turn(table, socket), 2000);
          setTimeout(() => river(table, socket), 4000);
          setTimeout(() => showdonw(table, socket), 7000);
          return;
        } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
          setTimeout(() => turn(table, socket), 500);
          setTimeout(() => river(table, socket), 2000);
          setTimeout(() => showdonw(table, socket), 4000);
          return;
        } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
          setTimeout(() => river(table, socket), 500);
          setTimeout(() => showdonw(table, socket), 2000);
          return;
        } else if (table.flopStatus && table.turnStatus && table.riverStatus) {
          setTimeout(() => showdonw(table, socket), 500);
          return;
        };
    
        return;
      } else {
        const playerIndex = table.players.indexOf(player);
        const nextPlayer = table.players.find((player, index) => player.allIn === false && player.folded === false && playerIndex < index);
        table.players.forEach(player => {
          player.isTurn = false;
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
          const nextPlayerThatDidNotFoldAndIsNotAllIn = table.players.find(player => player.folded === false && player.allIn === false);

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
      
      return;
  } else {
    // O problema pode estar aqui, mas acho que não esteja, pois era pra chamar a condição de quando vai pro showdown direto
    const playerIndex = table.players.indexOf(player);
    const nextPlayer = table.players.find((player, index) => player.allIn === false && player.folded === false && playerIndex < index);
    table.players.forEach(player => {
      player.isTurn = false;
      player.timer = 45;
    });

    if (nextPlayer) {
      nextPlayer.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === nextPlayer.id);
      if (!socket) {
        return;
      }
      socket.emit('your_turn');
      const interval = decrementTimer(nextPlayer, table, socket);
      if (isFold) {
        clearInterval(interval);
      }
    } else {
      const nextPlayerThatDidNotFoldAndIsNotAllIn = table.players.find(player => player.folded === false && player.allIn === false);

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

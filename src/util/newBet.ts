import { PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";
import { emitAllPlayersForEachSocket } from './emitAllPlayersForEachSocket';
import { flop } from './flop';
import { passTurn } from './passTurn';
import { river } from './river';
import { showdonw } from './showdown';
import { turn } from './turn';

const prisma = new PrismaClient()

export async function newBet(
    bet: number | 'fold' | 'check' | 'call', 
    player: Player, 
    table: Table, 
    socket: Socket, 
    leftTable?: boolean,
  ) {
    if (!table.roundStatus) {
      socket.emit('error_msg', 'Rodada não ainda começou, aguarde...');
      return;
    } else if (!player?.isTurn) {
      socket.emit('error_msg', 'Você não pode apostar ainda...');
      return;
    } else if (player?.folded) {
      socket.emit('error_msg', 'Você já saiu da rodada, espere a próxima');
      return;
    }

    if (bet === 'fold') { // Folded
      player.folded = true;
      socket.emit('bet_response', 'Você saiu da rodada.');

      if (leftTable) {
        passTurn(player, table, socket, false);
        return;
      }

      passTurn(player, table, socket, true);
      return;
    }

    if (bet === 'call' || bet === 'check') { // Called
      const bet = table.totalHighestBet - player.totalBetValue;

      if (player?.balance < bet) {
        socket.emit('error_msg', 'Seu saldo não é suficiente!');
        return;
      };

      const newBalance = player.balance -= bet;
      table.roundPot += bet;
      table.totalBets++;

      player.totalBetValue += bet;
      // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
      if (player.totalBetValue > table.totalHighestBet) {
        table.totalHighestBet = player.totalBetValue;
      }

      if (bet > table.highestBet) {
        table.highestBet = bet;
      }

      // Passar o turno para outro jogador...
      passTurn(player, table, socket);

      // Emitir eventos para o front...
      socket.emit('bet_response', 'Aposta feita com sucesso!');
      socket.emit('round_pot', table.roundPot);
      socket.to(table.id).emit('round_pot', table.roundPot);

      const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } });
      player.balance = balance
      socket.emit('player', player);
      emitAllPlayersForEachSocket(table.sockets, table.players);

      const playersWhoDidNotFold = table.players.filter(player => player.folded === false);
      const areBetsEqual = playersWhoDidNotFold.every(player => player.totalBetValue === table.totalHighestBet);

      if (areBetsEqual && table.totalBets >= playersWhoDidNotFold.length) {
        if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
          flop(table, socket);
        } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
          turn(table, socket);
        } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
          river(table, socket);
        }  else if (table.flopStatus && table.turnStatus && table.riverStatus) {
          showdonw(table, socket);
        };
      };

      return;
    }

    const minBet = (table.highestBet + table.bigBlind);
    if (bet < minBet) {
      socket.emit('error_msg', `Valor de aposta mínimo: ${minBet}`);
      return;
    } else if (typeof(bet) !== 'number') {
      socket.emit('error_msg', 'Aposta invalida');
      return;
    }

    // Verificação de saldo...
    if (player.balance < bet) {
      socket.emit('error_msg', 'Seu saldo não é suficiente!');
      return;
    };

    const newBalance = player.balance -= bet;
    table.roundPot += bet;
    table.totalBets++;

    player.totalBetValue += bet;
    // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
    if (player.totalBetValue > table.totalHighestBet) {
      table.totalHighestBet = player.totalBetValue;
    }

    if (bet > table.highestBet) {
      table.highestBet = bet;
    }

    // Passar o turno para outro jogador...
    passTurn(player, table, socket);

    // Emitir eventos para o front...
    socket.emit('bet_response', 'Aposta feita com sucesso!');
    socket.emit('round_pot', table.roundPot);
    socket.to(table.id).emit('round_pot', table.roundPot);
    const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } });
    player.balance = balance
    socket.emit('player', player);
    emitAllPlayersForEachSocket(table.sockets, table.players);
}
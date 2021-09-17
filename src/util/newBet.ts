import { PrismaClient } from '@prisma/client';
import { Socket } from 'socket.io';
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";
import { PokerTable } from '../PokerTable/PokerTable';
import { emitAllPlayersForEachSocket } from './emitAllPlayersForEachSocket';
import { emitCardsForEachSocket } from './emitCardsForEachSocket';
import { flop } from './flop';
import { passTurn } from './passTurn';
import { river } from './river';
import { showdonw } from './showdown';
import { turn } from './turn';

const prisma = new PrismaClient()

export async function newBet(
    bet: number | 'fold' | 'check' | 'call' | 'allin', 
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

      const playersWhoDidNotFold = table.players.filter(player => player.folded === false);

      if (leftTable) {
        await passTurn(player, table, socket, false);
        return;
      } else if (playersWhoDidNotFold.length >= 2) {
        await passTurn(player, table, socket, false);
        return;
      }

      await passTurn(player, table, socket, true);
      return;
    }

    if (bet === 'call' || bet === 'check') { // Called
      const bet = table.totalHighestBet - player.totalBetValueOnRound;
      const minBet = (table.highestBet + table.bigBlind);

      if (player.balance < bet) {
        player.isTurn = false;
        player.allIn = true;
        prisma.users.findUnique({ where: { id: player.databaseId }, select: { balance: true } }).then(async user => {
          if (!user) {
            return;
          }

          const allInBet = user.balance;

          const newBalance = player.balance -= allInBet;
          table.roundPot += allInBet;
          table.totalBets++;

          player.totalBetValue += allInBet;
          player.totalBetValueOnRound += allInBet;
          player.allIn = true;
          // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
          if (player.totalBetValueOnRound > table.totalHighestBet) {
            table.totalHighestBet = player.totalBetValueOnRound;
          }

          if (allInBet > table.highestBet) {
            table.highestBet = allInBet;
          }

          // Passar o turno para outro jogador...
          await passTurn(player, table, socket);

          // Emitir eventos para o front...
          socket.emit('bet_response', 'Aposta feita com sucesso!');
          socket.emit('min_bet', minBet);
          socket.to(table.id).emit('min_bet', minBet);

          const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } });
          player.balance = balance;
          socket.emit('player', player);
          emitAllPlayersForEachSocket(table.sockets, table.players);

          const playersWhoDidNotFold = table.players.filter(player => player.folded === false);
          const playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(player => player.allIn === false);
          const areBetsEqual = playersWhoDidNotFoldAndAreNotAllIn.every(player => player.totalBetValueOnRound === table.totalHighestBet);


          if (areBetsEqual && playersWhoDidNotFoldAndAreNotAllIn.length > 1) {
            if (table.totalBets >= playersWhoDidNotFoldAndAreNotAllIn.length) {
              console.log('G')
              if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
                flop(table, socket);
              } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
                turn(table, socket);
              } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
                river(table, socket);
              }  else if (table.flopStatus && table.turnStatus && table.riverStatus) {
                showdonw(table, socket);
              };
            }
          };

          return;
        });

        player.allIn = true;

        return;
      };

      const newBalance = player.balance -= bet;
      table.roundPot += bet;
      table.totalBets++;

      player.totalBetValue += bet;
      player.totalBetValueOnRound += bet;
      // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
      if (player.totalBetValueOnRound > table.totalHighestBet) {
        table.totalHighestBet = player.totalBetValueOnRound;
      }

      if (bet > table.highestBet) {
        table.highestBet = bet;
      }

      // Passar o turno para outro jogador...
      await passTurn(player, table, socket);

      // Emitir eventos para o front...
      socket.emit('bet_response', 'Aposta feita com sucesso!');
      socket.emit('min_bet', minBet);
      socket.to(table.id).emit('min_bet', minBet);

      const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } });
      player.balance = balance
      socket.emit('player', player);
      emitAllPlayersForEachSocket(table.sockets, table.players);

      const playersWhoDidNotFold = table.players.filter(player => player.folded === false);
      const playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(player => player.allIn === false);
      const areBetsEqual = playersWhoDidNotFoldAndAreNotAllIn.every(player => player.totalBetValueOnRound === table.totalHighestBet);

      if (areBetsEqual) {
        if (table.totalBets >= playersWhoDidNotFoldAndAreNotAllIn.length) {
          console.log('G')
          if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
            flop(table, socket);
          } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
            turn(table, socket);
          } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
            river(table, socket);
          } else if (table.flopStatus && table.turnStatus && table.riverStatus) {
            showdonw(table, socket);
          };
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
    if (newBalance === 0) {
      player.allIn = true;
    }

    table.roundPot += bet;
    table.totalBets++;

    player.totalBetValue += bet;
    player.totalBetValueOnRound += bet;
    // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
    if (player.totalBetValueOnRound > table.totalHighestBet) {
      table.totalHighestBet = player.totalBetValueOnRound;
    }

    if (bet > table.highestBet) {
      table.highestBet = bet;
    }

    // Passar o turno para outro jogador...
    await passTurn(player, table, socket);

    // Emitir eventos para o front...
    const newMinBet = (table.highestBet + table.bigBlind);
    
    socket.emit('bet_response', 'Aposta feita com sucesso!');
    socket.emit('min_bet', newMinBet);
    socket.to(table.id).emit('min_bet', newMinBet);
    const { balance } = await prisma.users.update({ data: { balance: Math.floor(newBalance) }, where: { id: player.databaseId } });
    player.balance = balance;
    emitCardsForEachSocket(table, table.cards);
    emitAllPlayersForEachSocket(table.sockets, table.players);
}
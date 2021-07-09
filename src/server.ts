import express from 'express';
import http from 'http';
import socketio, { Socket } from 'socket.io';

import { Player } from './interfaces/Player';
import { PrismaClient } from '@prisma/client';
import { getPlayersWithoutCards } from './util/getPlayersWithoutCards';
import { passTurn } from './util/passTurn';
import { getPosition } from './util/getPosition';
import { startRound } from './util/startRound';
import { flop } from './util/flop';
import { turn } from './util/turn';
import { river } from './util/river';
import { showdonw } from './util/showdown';
import { getTables } from './util/getTables';
import { movePlayersInTable } from './util/movePlayersInTable';
import { emitAllPlayersForEachSocket } from './util/emitAllPlayersForEachSocket';

const app = express();
const httpServer = http.createServer(app);

const io = new socketio.Server(httpServer, { cors: {} });

const prisma = new PrismaClient()

const tables = getTables();

io.on('connection', async (socket: Socket) => {
  console.log(`[IO] ${socket.id} is connected`);
  let player: Player | null = null
  
  socket.on('join_table', async (tableId: string) => {
    await socket.join(tableId);

    const table = (await tables).find(table => table.id === tableId);
    if (!table) {
      return;
    }

    socket.on('player', async (newPlayer: Player) => {
      // Verificar se a mesa já está cheia
      if (table.players.length >= table.maxPlayers) {
        socket.emit('error_msg', 'Mesa já está cheia');
        return;
      }

      // Verificar se player já está na mesa
      const playerExists = table.players.find(player => player.databaseId === newPlayer.id);
      if (playerExists) {
        socket.emit('error_msg', 'Você já está na mesa');
        return;
      }
      
      /* 
        Para o jogador não entrar 2 vezes na mesa ao clicar muito rapido no botão de entrar na mesa
        envia o jogador sem conferir se ele é quem diz ser
        por conta da query ao banco que demora ele poderia entrar 2 vezes na mesa se isso não fosse feito
      */
      player = newPlayer;
      player.databaseId = newPlayer.id;
      table.players.push(player);

      const databasePlayer = await prisma.users.findUnique({ where: { id: newPlayer.id } });
      if (!databasePlayer) {
        // Retirar o player que já foi colocado caso ele não exista
        const playerIndex = table.players.indexOf(player);
        table.players.splice(playerIndex, 1);
        socket.emit('error_msg', 'Usuário inexistente');
        return;
      }

      // Retirar o player da mesa para adicionar o player com as propriedades verificadas
      const playerIndex = table.players.indexOf(player);
      table.players.splice(playerIndex, 1);

      // Adicionar propriedades ao player já verificadas
      player.balance = databasePlayer.balance;
      player.avatarURL = databasePlayer.avatar_url;
      player.email = databasePlayer.email;
      player.databaseId = databasePlayer.id;

      player.id = socket.id;
      player.folded = false;
      player.position = getPosition(table.players);

      table.players.push(player);
      socket.emit('player', player);
      emitAllPlayersForEachSocket(table.sockets, table.players);
      console.log(`[IO] Player recived. Total of players ${table.players.length}`);
      // Adicionar "socket" no "sockets" array
      table.sockets.push(socket);
      
      // Caso o mínimo de jogadores para a rodada iniciar seja menor ou igual ao número de "players"
      // e a rodada não tenha começado
      // Iniciar a rodada
      if (table.players.length >= table?.minPlayers) {
        if (!table.roundStatus) {
          // Iniciar round...
          startRound(table, socket, true);
        } else {
          // Caso a rodada já tenha começado
          socket.emit('round_already_started', 'Rodada já começou, espere a próxima');
          player.folded = true;
        }
      }
    });

    socket.on('new_bet', async (bet: number | 'fold' | 'check' | 'call') => {
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

        const playersWhoDidNotFold = table.players.filter(player => player.folded === false)

        if (playersWhoDidNotFold.length === 1) {
          // Finalizar o round.
          // Único que não foldou...
          const winner = playersWhoDidNotFold[0];
          // Fazer alguns ajustes...
          // Fazer query no banco de dados...
          const newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * 2);
          socket.emit('winner', winner.databaseId);
          socket.to(tableId).emit('winner', winner.databaseId);
          table.roundStatus = false;
          const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } });
          winner.balance = balance
          socket.emit('player', player);
          emitAllPlayersForEachSocket(table.sockets, table.players);

          // Iniciar outro round...
          movePlayersInTable(table);
          startRound(table, socket, true);
        } else {
          passTurn(player, table);
        }
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
        passTurn(player, table);

        // Emitir eventos para o front...
        socket.emit('bet_response', 'Aposta feita com sucesso!');
        socket.emit('round_pot', table.roundPot);
        socket.to(tableId).emit('round_pot', table.roundPot);

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
      passTurn(player, table);

      // Emitir eventos para o front...
      socket.emit('bet_response', 'Aposta feita com sucesso!');
      socket.emit('round_pot', table.roundPot);
      socket.to(tableId).emit('round_pot', table.roundPot);
      const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } });
      player.balance = balance
      socket.emit('player', player);
      emitAllPlayersForEachSocket(table.sockets, table.players);
    })

    socket.on('disconnect', async () => {
      console.log(`[IO] ${socket.id} is disconnected`)
      if (!player) {
        return
      };

      const playerIndex = table.players.indexOf(player);
      table.players.splice(playerIndex, 1);
      
      const socketIndex = table.sockets.indexOf(socket);
      table.sockets.splice(socketIndex, 1);
      
      socket.leave(tableId);
      socket.to(tableId).emit('all_players', getPlayersWithoutCards(table.players, player));

      if (table.players.length <= 1) {
        // Finalizar o round.
        const winner = table.players[0];
        if (!winner) {
          return;
        }
        const newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * 2);
        socket.to(tableId).emit('winner', winner.databaseId);
        table.roundStatus = false;
        const { balance } = await prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } });
        winner.balance = balance
      } else {
        passTurn(player, table);
      }
    });
  });
});

httpServer.listen(process.env.PORT || 8080, () => console.log('[SERVER] Server running'));
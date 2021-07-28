import express from 'express';
import http from 'http';
import socketio, { Socket } from 'socket.io';

import { Player } from './interfaces/Player';
import { PrismaClient } from '@prisma/client';
import { getPlayersWithoutCards } from './util/getPlayersWithoutCards';
import { passTurn } from './util/passTurn';
import { getPosition } from './util/getPosition';
import { startRound } from './util/startRound';
import { getTables } from './util/getTables';
import { emitAllPlayersForEachSocket } from './util/emitAllPlayersForEachSocket';
import { decrementTimer } from './util/decrementTimer';
import { newBet } from './util/newBet';
import { PokerTable } from './PokerTable/PokerTable';

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

      if (player.balance <= (table.bigBlind * 5)) {
        const pokerTable = new PokerTable();
        pokerTable.leave(table, player, socket);
        socket.emit('error_msg', 'Saldo insuficiente para entrar na mesa');
        return
      }

      player.avatarURL = databasePlayer.avatar_url;
      player.email = databasePlayer.email;
      player.databaseId = databasePlayer.id;

      player.id = socket.id;
      player.folded = false;
      player.allIn = false;
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
      if (!player) {
        return;
      }

      newBet(bet, player, table, socket);
    })

    socket.on('disconnect', async () => {
      console.log(`[IO] ${socket.id} is disconnected`);

      if (!player) {
        return;
      }

      const pokerTable = new PokerTable();
      pokerTable.leave(table, player, socket, true);
    });
  });
});

httpServer.listen(process.env.PORT || 8080, () => console.log('[SERVER] Server running'));
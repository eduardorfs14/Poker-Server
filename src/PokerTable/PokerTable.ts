import { Table } from '../interfaces/Table';
import { Player } from '../interfaces/Player';
import { Socket } from 'socket.io';
import { passTurn } from '../util/passTurn';
import { emitAllPlayersForEachSocket } from '../util/emitAllPlayersForEachSocket';

export class PokerTable {
  constructor() {}

  async leave(table: Table, player: Player, socket: Socket, isRefresh?: boolean) {
    player.isTurn = false;
     
    if (isRefresh) {
      const playerIndex = table.players.indexOf(player);
      table.players.splice(playerIndex, 1);
  
      const socketIndex = table.sockets.indexOf(socket);
      table.sockets.splice(socketIndex, 1);
    }

    socket.emit('player', undefined);
    emitAllPlayersForEachSocket(table.sockets, table.players);


    await passTurn(player, table, socket);
  }
}
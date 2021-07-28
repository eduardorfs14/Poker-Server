import { Table } from '../interfaces/Table';
import { Player } from '../interfaces/Player';
import { Socket } from 'socket.io';
import { passTurn } from '../util/passTurn';
import { getPlayersWithoutCards } from '../util/getPlayersWithoutCards';

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

    socket.to(table.id).emit('all_players', getPlayersWithoutCards(table.players, player));
    socket.emit('player', undefined);


    passTurn(player, table, socket);
  }
}
import { Socket } from 'socket.io';
import { Table } from './../interfaces/Table';
import { Player } from "../interfaces/Player";
import { newBet } from './newBet';

export function decrementTimer(
    player: Player,
    table: Table, 
    socket: Socket, 
    bet?: number | 'fold' | 'check' | 'call'
  ): NodeJS.Timeout {
    const timerInterval = setInterval(async () => {
      // Garantir que o jogador passado para a funcão tem a vez de jogar
      if (!player.isTurn) {
        clearInterval(timerInterval);
        return;
      }

      console.log(player.name);
      console.log(player.timer);
      if (player.timer <= 0) {
        // O Jogador FOLDOU
        clearInterval(timerInterval);
        player.timer = 45;
        await newBet('fold', player, table, socket);
        return;
      }

      player.timer--;
      socket.emit('timer', { name: player.name, timeToPlay: player.timer })
      socket.to(table.id).emit('timer', { name: player.name, timeToPlay: player.timer })
  }, 1000)

  return timerInterval;
}
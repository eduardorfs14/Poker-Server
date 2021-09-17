import { Table } from './../interfaces/Table';
import { Socket } from "socket.io";
import { getCombination } from "../functions/getCombination";
import { Player } from "../interfaces/Player";

export function emitCardsForEachSocket(table: Table, tableCards?: string[]) {
  table.sockets.forEach(async socket => {
    const player = table.players.find(player => player.id === socket.id);
    const cards = player?.cards;
    if (!cards) {
      return;
    }

    let combination; 

    if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
      // Não teve nenhuma carta da mesa liberada
      combination = await getCombination(cards, []);
    } else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
      // Somente o flop foi liberado
      const flop = [table.cards[0], table.cards[1], table.cards[2]];
      combination = await getCombination(cards, flop);
    } else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
      // Flop e trun foram liberados
      const flop = [table.cards[0], table.cards[1], table.cards[2]];
      const turn = flop.concat([table.cards[3]]);
      combination = await getCombination(cards, turn);
    } else if (table.flopStatus && table.turnStatus && table.riverStatus) {
      combination = await getCombination(cards, tableCards);
    }
    
    socket.emit('combination', combination.descr);
    socket.emit('player', player);
  });
}
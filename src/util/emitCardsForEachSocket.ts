import { Socket } from "socket.io";
import { getCombination } from "../functions/getCombination";
import { Player } from "../interfaces/Player";

export function emitCardsForEachSocket(sockets: Socket[], players: Player[], tableCards?: string[]) {
  sockets.forEach(async socket => {
    const player = players.find(player => player.id === socket.id);
    const cards = player?.cards;
    if (!cards) {
      return;
    }

    const combination = await getCombination(cards, tableCards);
    
    socket.emit('combination', combination.descr);
    socket.emit('player', player);
  });
}
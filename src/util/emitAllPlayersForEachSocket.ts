import { Socket } from "socket.io";
import { Player } from "../interfaces/Player";
import { getPlayersWithoutCards } from "./getPlayersWithoutCards";

export function emitAllPlayersForEachSocket(sockets: Socket[], players: Player[]) {
  sockets.forEach(async socket => {
    const player = players.find(player => player.id === socket.id);

    if (!player) {
      return;
    }

    socket.emit('all_players', getPlayersWithoutCards(players, player));
  });
}
import { Player } from "../interfaces/Player";
import { Table } from "../interfaces/Table";

export function passTurn(player: Player, table: Table) {
  player.isTurn = false;
  const playerIndex = table.players.indexOf(player);
  const playersWhoDidNotFold = table.players.filter(player => player.folded === false);
  const nextPlayer = playersWhoDidNotFold[playerIndex + 1];
  if (!nextPlayer) {
    const nextPlayerThatDidNotFold = table.players.find(player => player.folded === false);
    if (nextPlayerThatDidNotFold) {
      nextPlayerThatDidNotFold.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === nextPlayerThatDidNotFold.id)
      socket?.emit('your_turn');
    }
  } else {
    const nextPlayerThatDidNotFold = table.players.find((player, index) => player.folded === false && playerIndex < index)
    if (nextPlayerThatDidNotFold) {
      nextPlayerThatDidNotFold.isTurn = true;
      const socket = table.sockets.find(socket => socket.id === nextPlayerThatDidNotFold.id)
      socket?.emit('your_turn');
    }
  }
}

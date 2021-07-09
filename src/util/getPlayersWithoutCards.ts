import { Player } from "../interfaces/Player";

export function getPlayersWithoutCards(players: Player[], player: Player) {
  const filtredPlayers = players.filter(p => p.databaseId !== player.databaseId);

  const playersWithoutCards = filtredPlayers.map(player => {
    return {
      id: player.id,
      email: player.email,
      balance: player.balance,
      position: player.position,
      folded: player.folded,
      avatarURL: player.avatarURL,
    }
  });

  return playersWithoutCards;
}
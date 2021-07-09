import { Player } from "../interfaces/Player";

export function getPlayersWithoutCards(players: Player[], player: Player) {
  const filtredPlayers = players.filter(p => p.id !== player?.id);

  const playersWithoutCards = filtredPlayers.map(player => {
    return {
      id: player.id,
      email: player.email,
      balance: player.balance,
      position: player.position,
      avatarURL: player.avatarURL,
    }
  });

  return playersWithoutCards;
}
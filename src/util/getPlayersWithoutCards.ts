import { Player } from "../interfaces/Player";

export function getPlayersWithoutCards(players: Player[], player: Player) {
  const filtredPlayers = players.filter(p => p.databaseId !== player.databaseId);

  const playersWithoutCards = filtredPlayers.map(player => {
    return {
      id: player.id,
      name: player.name,
      email: player.email,
      balance: player.balance,
      totalBetValueOnRound: player.totalBetValueOnRound,
      position: player.position,
      folded: player.folded,
      avatar_url: player.avatar_url,
    }
  });

  return playersWithoutCards;
}
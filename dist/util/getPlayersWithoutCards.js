"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayersWithoutCards = void 0;
function getPlayersWithoutCards(players, player) {
    var filtredPlayers = players.filter(function (p) { return p.databaseId !== player.databaseId; });
    var playersWithoutCards = filtredPlayers.map(function (player) {
        return {
            id: player.id,
            name: player.name,
            email: player.email,
            balance: player.balance,
            totalBetValueOnRound: player.totalBetValueOnRound,
            position: player.position,
            folded: player.folded,
            avatar_url: player.avatar_url,
        };
    });
    return playersWithoutCards;
}
exports.getPlayersWithoutCards = getPlayersWithoutCards;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turn = void 0;
var generateTurn_1 = require("../functions/generateTurn");
var emitAllPlayersForEachSocket_1 = require("./emitAllPlayersForEachSocket");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
function turn(table, socket) {
    socket.emit('round_pot', table.roundPot);
    socket.to(table.id).emit('round_pot', table.roundPot);
    var _a = generateTurn_1.generateTurn(table.deck), generatedTurn = _a.generatedTurn, newDeck = _a.newDeck;
    table.players.forEach(function (player) {
        // Adicionar propriedade "totalBetValueOnRound" aos "players"
        player.totalBetValueOnRound = 0;
        var equivalentSocket = table.sockets.find(function (s) { return s.id === player.id; });
        equivalentSocket === null || equivalentSocket === void 0 ? void 0 : equivalentSocket.emit('player', player);
    });
    table.deck = newDeck;
    table.turnStatus = true;
    table.highestBet = 0,
        table.totalHighestBet = 0,
        table.totalBets = 0;
    table.cards = table.cards.concat(generatedTurn);
    var minBet = (table.highestBet + table.bigBlind);
    socket.emit('min_bet', minBet);
    socket.emit('table_cards', table.cards);
    socket.to(table.id).emit('table_cards', table.cards);
    socket.to(table.id).emit('min_bet', minBet);
    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
}
exports.turn = turn;

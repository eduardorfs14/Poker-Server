"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.river = void 0;
var generateRiver_1 = require("../functions/generateRiver");
var emitAllPlayersForEachSocket_1 = require("./emitAllPlayersForEachSocket");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
function river(table, socket) {
    socket.emit('round_pot', table.roundPot);
    socket.to(table.id).emit('round_pot', table.roundPot);
    var _a = generateRiver_1.generateRiver(table.deck), generatedRiver = _a.generatedRiver, newDeck = _a.newDeck;
    table.players.forEach(function (player) {
        // Adicionar propriedade "totalBetValueOnRound" aos "players"
        player.totalBetValueOnRound = 0;
        var equivalentSocket = table.sockets.find(function (s) { return s.id === player.id; });
        equivalentSocket === null || equivalentSocket === void 0 ? void 0 : equivalentSocket.emit('player', player);
    });
    // table.deck = newDeck;
    // table.cards = table.cards.concat(generatedRiver);
    var flop = [table.cards[0], table.cards[1], table.cards[2]];
    var turn = flop.concat(table.cards[3]);
    var river = turn.concat(table.cards[4]);
    table.riverStatus = true;
    table.highestBet = 0,
        table.totalHighestBet = 0,
        table.totalBets = 0;
    var minBet = (table.highestBet + table.bigBlind);
    socket.emit('min_bet', minBet);
    socket.emit('table_cards', river);
    socket.to(table.id).emit('table_cards', river);
    socket.to(table.id).emit('min_bet', minBet);
    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
}
exports.river = river;

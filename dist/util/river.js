"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.river = void 0;
var generateRiver_1 = require("../functions/generateRiver");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
function river(table, socket) {
    var _a = generateRiver_1.generateRiver(table.deck), generatedRiver = _a.generatedRiver, newDeck = _a.newDeck;
    table.players.forEach(function (player) {
        // Adicionar propriedade "totalBetValue" aos "players"
        player.totalBetValue = 0;
    });
    table.deck = newDeck;
    table.riverStatus = true;
    table.highestBet = 0,
        table.totalHighestBet = 0,
        table.totalBets = 0;
    table.cards = table.cards.concat(generatedRiver);
    socket.emit('table_cards', table.cards);
    socket.to(table.id).emit('table_cards', table.cards);
    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
}
exports.river = river;

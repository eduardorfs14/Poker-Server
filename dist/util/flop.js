"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flop = void 0;
var generateFlop_1 = require("../functions/generateFlop");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
function flop(table, socket) {
    var _a = generateFlop_1.generateFlop(table.deck), generatedFlop = _a.generatedFlop, newDeck = _a.newDeck;
    table.players.forEach(function (player) {
        // Adicionar propriedade "totalBetValue" aos "players"
        player.totalBetValue = 0;
    });
    table.deck = newDeck;
    table.cards = table.cards.concat(generatedFlop);
    table.flopStatus = true;
    table.highestBet = 0,
        table.totalHighestBet = 0,
        table.totalBets = 0;
    socket.emit('table_cards', table.cards);
    socket.to(table.id).emit('table_cards', table.cards);
    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
}
exports.flop = flop;

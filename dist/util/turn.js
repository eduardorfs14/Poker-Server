"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turn = void 0;
var generateTurn_1 = require("../functions/generateTurn");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
function turn(table, socket) {
    var _a = generateTurn_1.generateTurn(table.deck), generatedTurn = _a.generatedTurn, newDeck = _a.newDeck;
    table.players.forEach(function (player) {
        // Adicionar propriedade "totalBetValueOnRound" aos "players"
        player.totalBetValueOnRound = 0;
    });
    table.deck = newDeck;
    table.turnStatus = true;
    table.highestBet = 0,
        table.totalHighestBet = 0,
        table.totalBets = 0;
    table.cards = table.cards.concat(generatedTurn);
    socket.emit('table_cards', table.cards);
    socket.to(table.id).emit('table_cards', table.cards);
    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
}
exports.turn = turn;

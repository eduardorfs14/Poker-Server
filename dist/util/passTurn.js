"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passTurn = void 0;
function passTurn(player, table) {
    player.isTurn = false;
    var playerIndex = table.players.indexOf(player);
    var playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
    var nextPlayer = playersWhoDidNotFold[playerIndex + 1];
    if (!nextPlayer) {
        var nextPlayerThatDidNotFold_1 = table.players.find(function (player) { return player.folded === false; });
        if (nextPlayerThatDidNotFold_1) {
            nextPlayerThatDidNotFold_1.isTurn = true;
            var socket = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFold_1.id; });
            socket === null || socket === void 0 ? void 0 : socket.emit('your_turn');
        }
    }
    else {
        var nextPlayerThatDidNotFold_2 = table.players.find(function (player, index) { return player.folded === false && playerIndex < index; });
        if (nextPlayerThatDidNotFold_2) {
            nextPlayerThatDidNotFold_2.isTurn = true;
            var socket = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFold_2.id; });
            socket === null || socket === void 0 ? void 0 : socket.emit('your_turn');
        }
    }
}
exports.passTurn = passTurn;

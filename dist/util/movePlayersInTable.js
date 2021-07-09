"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movePlayersInTable = void 0;
function movePlayersInTable(table) {
    var dealer = table.players.pop();
    if (dealer) {
        table.players.unshift(dealer);
    }
    // Dar posição os players
    table.players.forEach(function (player, index) {
        if (index === 0)
            player.position = 'SB';
        if (index === 1)
            player.position = 'BB';
        if (index === 2)
            player.position = 'UTG-1';
        if (index === 3)
            player.position = 'UTG-2';
        if (index === 4)
            player.position = 'UTG-3';
        if (index === 5)
            player.position = 'MP-1';
        if (index === 6)
            player.position = 'MP-2';
        if (index === 7)
            player.position = 'CO';
        if (index === 8)
            player.position = 'DEALER';
    });
}
exports.movePlayersInTable = movePlayersInTable;

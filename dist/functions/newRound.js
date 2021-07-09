"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newRound = void 0;
var generateDeck_1 = require("./generateDeck");
var givePosition = function (players) {
    players.forEach(function (player, index) {
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
};
var newRound = function (players) {
    var deck = generateDeck_1.generateDeck();
    var dealer = players.pop();
    if (dealer)
        players.unshift(dealer);
    players.forEach(function (player) {
        player.cards = [deck[0], deck[1]];
        deck.shift();
        deck.shift();
    });
    givePosition(players);
    return {
        deck: deck,
        roundPlayers: players
    };
};
exports.newRound = newRound;

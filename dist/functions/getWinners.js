"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWinners = void 0;
var pokersolver_1 = require("pokersolver");
var getCombination_1 = require("./getCombination");
function getWinners(players, tableCards) {
    var winners = [];
    var hands = [];
    players.forEach(function (player) {
        if (!player.cards) {
            throw new Error('Player does not have cards');
        }
        ;
        var playerHand = getCombination_1.getCombination(player.cards, tableCards);
        hands.push(playerHand);
    });
    var solvedHands = pokersolver_1.Hand.winners(hands);
    if (solvedHands.length > 1) {
        for (var i = 0; i < solvedHands.length; i++) {
            winners.push(players[i]);
        }
    }
    ;
    players.forEach(function (player) {
        if (!player.cards) {
            throw new Error('Player does not have cards');
        }
        ;
        var playerHand = getCombination_1.getCombination(player.cards, tableCards);
        var solvedHandsFormated = solvedHands.toString().replace(/\s/g, '').replace(/,/g, '');
        var playerHandCardsFormated = playerHand.cards.toString().replace(/\s/g, '').replace(/,/g, '');
        if (solvedHandsFormated === playerHandCardsFormated) {
            winners.push(player);
        }
        ;
    });
    return winners;
}
exports.getWinners = getWinners;

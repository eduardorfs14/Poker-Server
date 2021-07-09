"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCombination = void 0;
var pokersolver_1 = require("pokersolver");
function getCombination(playerCards, tableCards) {
    if (!tableCards) {
        var combination_1 = pokersolver_1.Hand.solve(playerCards);
        return combination_1;
    }
    ;
    var hand = playerCards.concat(tableCards);
    var combination = pokersolver_1.Hand.solve(hand);
    return combination;
}
exports.getCombination = getCombination;

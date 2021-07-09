"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTurn = void 0;
var generateTurn = function (deck) {
    var turn = [deck[0]];
    deck.shift();
    return {
        generatedTurn: turn,
        newDeck: deck,
    };
};
exports.generateTurn = generateTurn;

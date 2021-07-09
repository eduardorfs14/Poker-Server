"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlop = void 0;
var generateFlop = function (deck) {
    var flop = [deck[0], deck[1], deck[2]];
    deck.shift();
    deck.shift();
    deck.shift();
    return {
        generatedFlop: flop,
        newDeck: deck
    };
};
exports.generateFlop = generateFlop;

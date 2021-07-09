"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRiver = void 0;
var generateRiver = function (deck) {
    var river = [deck[0]];
    deck.shift();
    return {
        generatedRiver: river,
        newDeck: deck,
    };
};
exports.generateRiver = generateRiver;

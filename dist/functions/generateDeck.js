"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeck = void 0;
function generateDeck() {
    var suits = ['s', 'd', 'c', 'h'];
    var values = [
        'A',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'T',
        'J',
        'Q',
        'K',
    ];
    var deck = [];
    for (var i = 0; i < suits.length; i++) {
        for (var x = 0; x < values.length; x++) {
            var card = "" + values[x] + suits[i];
            deck.push(card);
        }
    }
    for (var i = 0; i < 1000; i++) {
        var location1 = Math.floor(Math.random() * deck.length);
        var location2 = Math.floor(Math.random() * deck.length);
        var tmp = deck[location1];
        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
    return deck;
}
exports.generateDeck = generateDeck;

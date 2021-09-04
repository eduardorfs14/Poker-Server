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
    // P1
    deck[4] = 'As';
    deck[5] = 'Ah';
    // P2
    deck[0] = 'Ac';
    deck[1] = 'Ad';
    // P3
    deck[2] = '2c';
    deck[3] = '3d';
    // FLOP
    deck[6] = '8h';
    deck[7] = '9d';
    deck[8] = '4c';
    // TURN
    deck[9] = 'Kh';
    // RIVER
    deck[10] = 'Qd';
    return deck;
}
exports.generateDeck = generateDeck;

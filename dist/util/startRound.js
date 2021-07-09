"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRound = void 0;
var emitAllPlayersForEachSocket_1 = require("./emitAllPlayersForEachSocket");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
var gameSetup_1 = require("./gameSetup");
function startRound(table, socket, isNewRound) {
    return __awaiter(this, void 0, void 0, function () {
        var deck, sb_1, socket_1, utg1_1, socket_2;
        return __generator(this, function (_a) {
            deck = gameSetup_1.gameSetup(table.players).deck;
            if (table.players.length <= 2) {
                table.players.forEach(function (player) {
                    player.isTurn = false;
                });
                sb_1 = table.players.find(function (player) { return player.position === 'SB'; });
                if (sb_1) {
                    sb_1.isTurn = true;
                    socket_1 = table.sockets.find(function (socket) { return socket.id === sb_1.id; });
                    socket_1 === null || socket_1 === void 0 ? void 0 : socket_1.emit('your_turn');
                }
            }
            else if (table.players.length >= 3) {
                table.players.forEach(function (player) {
                    player.isTurn = false;
                });
                utg1_1 = table.players.find(function (player) { return player.position === 'UTG-1'; });
                if (utg1_1) {
                    utg1_1.isTurn = true;
                    socket_2 = table.sockets.find(function (socket) { return socket.id === utg1_1.id; });
                    socket_2 === null || socket_2 === void 0 ? void 0 : socket_2.emit('your_turn');
                }
            }
            table.players.forEach(function (player) {
                // Adicionar propriedade "isTurn" aos "players"
                if (isNewRound) {
                    // Adicionar propriedade "totalBetValue" ao "player"
                    if (player.position === 'SB') {
                        player.totalBetValue = (table.bigBlind / 2);
                    }
                    else if (player.position === 'BB') {
                        player.totalBetValue = table.bigBlind;
                    }
                    else {
                        player.totalBetValue = 0;
                    }
                }
                else {
                    // Adicionar propriedade "totalBetValue" aos "players"
                    player.totalBetValue = 0;
                }
            });
            table.roundStatus = true;
            isNewRound ? table.highestBet = (table.bigBlind) : table.highestBet = 0;
            isNewRound ? table.totalHighestBet = (table.bigBlind) : table.totalHighestBet = 0;
            table.totalBets = 0;
            table.roundPot = (table.bigBlind + (table.bigBlind / 2));
            table.deck = deck;
            table.cards = [];
            table.flopStatus = false;
            table.turnStatus = false;
            table.riverStatus = false;
            socket.emit('round_pot', table.roundPot);
            socket.emit('table_cards', table.cards);
            socket.to(table.id).emit('round_pot', table.roundPot);
            socket.to(table.id).emit('table_cards', table.cards);
            emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players);
            emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
            return [2 /*return*/];
        });
    });
}
exports.startRound = startRound;

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
exports.passTurn = void 0;
var client_1 = require("@prisma/client");
var decrementTimer_1 = require("./decrementTimer");
var emitAllPlayersForEachSocket_1 = require("./emitAllPlayersForEachSocket");
var movePlayersInTable_1 = require("./movePlayersInTable");
var startRound_1 = require("./startRound");
var showdown_1 = require("./showdown");
var flop_1 = require("./flop");
var turn_1 = require("./turn");
var river_1 = require("./river");
var prisma = new client_1.PrismaClient();
function passTurn(player, table, socket, isFold) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var playersWhoDidNotFold, playersWhoDidNotFoldAndAreNotAllIn, winner, newBalance, balance, playerIndex_1, nextPlayer_1, socket_1, interval, nextPlayerThatDidNotFoldAndIsNotAllIn_1, socket_2, interval, playerIndex_2, nextPlayer_2, socket_3, interval, nextPlayerThatDidNotFoldAndIsNotAllIn_2, socket_4, interval;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    table.players.forEach(function (player) { return player.isTurn = false; });
                    playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(function (player) { return player.allIn === false; });
                    if (!(playersWhoDidNotFold.length === 1)) return [3 /*break*/, 2];
                    winner = playersWhoDidNotFold[0];
                    winner.isTurn = false;
                    // Zerar o pot caso não seja fold, pois se não for fold, não terá outro round.
                    if (!isFold) {
                        table.roundPot = 0;
                    }
                    newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * table.houseSlice);
                    socket.emit('round_pot', table.roundPot);
                    socket.emit('table_cards', table.cards);
                    socket.to(table.id).emit('round_pot', table.roundPot);
                    socket.to(table.id).emit('table_cards', table.cards);
                    table.roundStatus = false;
                    return [4 /*yield*/, prisma.users.update({ data: { balance: Math.floor(newBalance) }, where: { id: winner.databaseId } })];
                case 1:
                    balance = (_c.sent()).balance;
                    winner.balance = balance;
                    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                    if (isFold) {
                        // Caso o jogador tenha saido da mesa, não emitir o player para ele, assim fazendo com que no front ele não apareça na mesa
                        socket.emit('player', player);
                        movePlayersInTable_1.movePlayersInTable(table);
                        startRound_1.startRound(table, socket, true);
                    }
                    return [2 /*return*/];
                case 2:
                    if (playersWhoDidNotFoldAndAreNotAllIn.length === 0) {
                        if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
                            setTimeout(function () { return flop_1.flop(table, socket); }, 500);
                            setTimeout(function () { return turn_1.turn(table, socket); }, 2000);
                            setTimeout(function () { return river_1.river(table, socket); }, 4000);
                            setTimeout(function () { return showdown_1.showdonw(table, socket); }, 7000);
                            return [2 /*return*/];
                        }
                        else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
                            setTimeout(function () { return turn_1.turn(table, socket); }, 500);
                            setTimeout(function () { return river_1.river(table, socket); }, 2000);
                            setTimeout(function () { return showdown_1.showdonw(table, socket); }, 4000);
                            return [2 /*return*/];
                        }
                        else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
                            setTimeout(function () { return river_1.river(table, socket); }, 500);
                            setTimeout(function () { return showdown_1.showdonw(table, socket); }, 2000);
                            return [2 /*return*/];
                        }
                        else if (table.flopStatus && table.turnStatus && table.riverStatus) {
                            setTimeout(function () { return showdown_1.showdonw(table, socket); }, 500);
                            return [2 /*return*/];
                        }
                        ;
                        return [2 /*return*/];
                    }
                    else if (playersWhoDidNotFoldAndAreNotAllIn.length === 1 && table.totalBets >= playersWhoDidNotFold.length) {
                        if (((_a = playersWhoDidNotFoldAndAreNotAllIn[0]) === null || _a === void 0 ? void 0 : _a.totalBetValue) >= table.highestBet || ((_b = playersWhoDidNotFoldAndAreNotAllIn[0]) === null || _b === void 0 ? void 0 : _b.balance) <= 0) {
                            if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                setTimeout(function () { return flop_1.flop(table, socket); }, 500);
                                setTimeout(function () { return turn_1.turn(table, socket); }, 2000);
                                setTimeout(function () { return river_1.river(table, socket); }, 4000);
                                setTimeout(function () { return showdown_1.showdonw(table, socket); }, 7000);
                                return [2 /*return*/];
                            }
                            else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                setTimeout(function () { return turn_1.turn(table, socket); }, 500);
                                setTimeout(function () { return river_1.river(table, socket); }, 2000);
                                setTimeout(function () { return showdown_1.showdonw(table, socket); }, 4000);
                                return [2 /*return*/];
                            }
                            else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
                                setTimeout(function () { return river_1.river(table, socket); }, 500);
                                setTimeout(function () { return showdown_1.showdonw(table, socket); }, 2000);
                                return [2 /*return*/];
                            }
                            else if (table.flopStatus && table.turnStatus && table.riverStatus) {
                                setTimeout(function () { return showdown_1.showdonw(table, socket); }, 500);
                                return [2 /*return*/];
                            }
                            ;
                            return [2 /*return*/];
                        }
                        else {
                            playerIndex_1 = table.players.indexOf(player);
                            nextPlayer_1 = table.players.find(function (player, index) { return player.allIn === false && player.folded === false && playerIndex_1 < index; });
                            table.players.forEach(function (player) {
                                player.isTurn = false;
                                player.timer = 45;
                            });
                            if (nextPlayer_1) {
                                nextPlayer_1.isTurn = true;
                                socket_1 = table.sockets.find(function (socket) { return socket.id === nextPlayer_1.id; });
                                if (!socket_1) {
                                    return [2 /*return*/];
                                }
                                socket_1.emit('your_turn');
                                interval = decrementTimer_1.decrementTimer(nextPlayer_1, table, socket_1);
                                if (isFold) {
                                    clearInterval(interval);
                                }
                            }
                            else {
                                nextPlayerThatDidNotFoldAndIsNotAllIn_1 = table.players.find(function (player) { return player.folded === false && player.allIn === false; });
                                if (nextPlayerThatDidNotFoldAndIsNotAllIn_1) {
                                    nextPlayerThatDidNotFoldAndIsNotAllIn_1.isTurn = true;
                                    socket_2 = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFoldAndIsNotAllIn_1.id; });
                                    if (!socket_2) {
                                        return [2 /*return*/];
                                    }
                                    socket_2.emit('your_turn');
                                    interval = decrementTimer_1.decrementTimer(nextPlayerThatDidNotFoldAndIsNotAllIn_1, table, socket_2);
                                    if (isFold) {
                                        clearInterval(interval);
                                    }
                                }
                            }
                        }
                        return [2 /*return*/];
                    }
                    else {
                        playerIndex_2 = table.players.indexOf(player);
                        nextPlayer_2 = table.players.find(function (player, index) { return player.allIn === false && player.folded === false && playerIndex_2 < index; });
                        table.players.forEach(function (player) {
                            player.isTurn = false;
                            player.timer = 45;
                        });
                        if (nextPlayer_2) {
                            nextPlayer_2.isTurn = true;
                            socket_3 = table.sockets.find(function (socket) { return socket.id === nextPlayer_2.id; });
                            if (!socket_3) {
                                return [2 /*return*/];
                            }
                            socket_3.emit('your_turn');
                            interval = decrementTimer_1.decrementTimer(nextPlayer_2, table, socket_3);
                            if (isFold) {
                                clearInterval(interval);
                            }
                        }
                        else {
                            nextPlayerThatDidNotFoldAndIsNotAllIn_2 = table.players.find(function (player) { return player.folded === false && player.allIn === false; });
                            if (nextPlayerThatDidNotFoldAndIsNotAllIn_2) {
                                nextPlayerThatDidNotFoldAndIsNotAllIn_2.isTurn = true;
                                socket_4 = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFoldAndIsNotAllIn_2.id; });
                                if (!socket_4) {
                                    return [2 /*return*/];
                                }
                                socket_4.emit('your_turn');
                                interval = decrementTimer_1.decrementTimer(nextPlayerThatDidNotFoldAndIsNotAllIn_2, table, socket_4);
                                if (isFold) {
                                    clearInterval(interval);
                                }
                            }
                        }
                    }
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.passTurn = passTurn;

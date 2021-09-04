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
exports.newBet = void 0;
var client_1 = require("@prisma/client");
var emitAllPlayersForEachSocket_1 = require("./emitAllPlayersForEachSocket");
var emitCardsForEachSocket_1 = require("./emitCardsForEachSocket");
var flop_1 = require("./flop");
var passTurn_1 = require("./passTurn");
var river_1 = require("./river");
var showdown_1 = require("./showdown");
var turn_1 = require("./turn");
var prisma = new client_1.PrismaClient();
function newBet(bet, player, table, socket, leftTable) {
    return __awaiter(this, void 0, void 0, function () {
        var playersWhoDidNotFold, bet_1, minBet_1, newBalance_1, balance_1, playersWhoDidNotFold, playersWhoDidNotFoldAndAreNotAllIn, areBetsEqual, minBet, newBalance, newMinBet, balance;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!table.roundStatus) {
                        socket.emit('error_msg', 'Rodada não ainda começou, aguarde...');
                        return [2 /*return*/];
                    }
                    else if (!(player === null || player === void 0 ? void 0 : player.isTurn)) {
                        socket.emit('error_msg', 'Você não pode apostar ainda...');
                        return [2 /*return*/];
                    }
                    else if (player === null || player === void 0 ? void 0 : player.folded) {
                        socket.emit('error_msg', 'Você já saiu da rodada, espere a próxima');
                        return [2 /*return*/];
                    }
                    if (!(bet === 'fold')) return [3 /*break*/, 6];
                    player.folded = true;
                    socket.emit('bet_response', 'Você saiu da rodada.');
                    playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    if (!leftTable) return [3 /*break*/, 2];
                    return [4 /*yield*/, passTurn_1.passTurn(player, table, socket, false)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    if (!(playersWhoDidNotFold.length >= 2)) return [3 /*break*/, 4];
                    return [4 /*yield*/, passTurn_1.passTurn(player, table, socket, false)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, passTurn_1.passTurn(player, table, socket, true)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
                case 6:
                    if (!(bet === 'call' || bet === 'check')) return [3 /*break*/, 9];
                    bet_1 = table.totalHighestBet - player.totalBetValueOnRound;
                    minBet_1 = (table.highestBet + table.bigBlind);
                    if (player.balance < bet_1) {
                        player.isTurn = false;
                        player.allIn = true;
                        prisma.users.findUnique({ where: { id: player.databaseId }, select: { balance: true } }).then(function (user) { return __awaiter(_this, void 0, void 0, function () {
                            var allInBet, newBalance, balance, playersWhoDidNotFold, playersWhoDidNotFoldAndAreNotAllIn, areBetsEqual;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!user) {
                                            return [2 /*return*/];
                                        }
                                        allInBet = user.balance;
                                        newBalance = player.balance -= allInBet;
                                        table.roundPot += allInBet;
                                        table.totalBets++;
                                        player.totalBetValue += allInBet;
                                        player.totalBetValueOnRound += allInBet;
                                        player.allIn = true;
                                        // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
                                        if (player.totalBetValueOnRound > table.totalHighestBet) {
                                            table.totalHighestBet = player.totalBetValueOnRound;
                                        }
                                        if (allInBet > table.highestBet) {
                                            table.highestBet = allInBet;
                                        }
                                        // Passar o turno para outro jogador...
                                        return [4 /*yield*/, passTurn_1.passTurn(player, table, socket)];
                                    case 1:
                                        // Passar o turno para outro jogador...
                                        _a.sent();
                                        // Emitir eventos para o front...
                                        socket.emit('bet_response', 'Aposta feita com sucesso!');
                                        socket.emit('min_bet', minBet_1);
                                        socket.to(table.id).emit('min_bet', minBet_1);
                                        return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: player.databaseId } })];
                                    case 2:
                                        balance = (_a.sent()).balance;
                                        player.balance = balance;
                                        socket.emit('player', player);
                                        emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                                        playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                                        playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(function (player) { return player.allIn === false; });
                                        areBetsEqual = playersWhoDidNotFoldAndAreNotAllIn.every(function (player) { return player.totalBetValueOnRound === table.totalHighestBet; });
                                        if (areBetsEqual && playersWhoDidNotFoldAndAreNotAllIn.length > 1) {
                                            if (table.totalBets >= playersWhoDidNotFoldAndAreNotAllIn.length) {
                                                console.log('G');
                                                if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                                    flop_1.flop(table, socket);
                                                }
                                                else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                                    turn_1.turn(table, socket);
                                                }
                                                else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
                                                    river_1.river(table, socket);
                                                }
                                                else if (table.flopStatus && table.turnStatus && table.riverStatus) {
                                                    showdown_1.showdonw(table, socket);
                                                }
                                                ;
                                            }
                                        }
                                        ;
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        player.allIn = true;
                        return [2 /*return*/];
                    }
                    ;
                    newBalance_1 = player.balance -= bet_1;
                    table.roundPot += bet_1;
                    table.totalBets++;
                    player.totalBetValue += bet_1;
                    player.totalBetValueOnRound += bet_1;
                    // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
                    if (player.totalBetValueOnRound > table.totalHighestBet) {
                        table.totalHighestBet = player.totalBetValueOnRound;
                    }
                    if (bet_1 > table.highestBet) {
                        table.highestBet = bet_1;
                    }
                    // Passar o turno para outro jogador...
                    return [4 /*yield*/, passTurn_1.passTurn(player, table, socket)];
                case 7:
                    // Passar o turno para outro jogador...
                    _a.sent();
                    // Emitir eventos para o front...
                    socket.emit('bet_response', 'Aposta feita com sucesso!');
                    socket.emit('min_bet', minBet_1);
                    socket.to(table.id).emit('min_bet', minBet_1);
                    return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(newBalance_1.toFixed(0)) }, where: { id: player.databaseId } })];
                case 8:
                    balance_1 = (_a.sent()).balance;
                    player.balance = balance_1;
                    socket.emit('player', player);
                    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                    playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    playersWhoDidNotFoldAndAreNotAllIn = playersWhoDidNotFold.filter(function (player) { return player.allIn === false; });
                    areBetsEqual = playersWhoDidNotFoldAndAreNotAllIn.every(function (player) { return player.totalBetValueOnRound === table.totalHighestBet; });
                    if (areBetsEqual) {
                        if (table.totalBets >= playersWhoDidNotFoldAndAreNotAllIn.length) {
                            console.log('G');
                            if (!table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                flop_1.flop(table, socket);
                            }
                            else if (table.flopStatus && !table.turnStatus && !table.riverStatus) {
                                turn_1.turn(table, socket);
                            }
                            else if (table.flopStatus && table.turnStatus && !table.riverStatus) {
                                river_1.river(table, socket);
                            }
                            else if (table.flopStatus && table.turnStatus && table.riverStatus) {
                                showdown_1.showdonw(table, socket);
                            }
                            ;
                        }
                        ;
                    }
                    ;
                    return [2 /*return*/];
                case 9:
                    minBet = (table.highestBet + table.bigBlind);
                    if (bet < minBet) {
                        socket.emit('error_msg', "Valor de aposta m\u00EDnimo: " + minBet);
                        return [2 /*return*/];
                    }
                    else if (typeof (bet) !== 'number') {
                        socket.emit('error_msg', 'Aposta invalida');
                        return [2 /*return*/];
                    }
                    // Verificação de saldo...
                    if (player.balance < bet) {
                        socket.emit('error_msg', 'Seu saldo não é suficiente!');
                        return [2 /*return*/];
                    }
                    ;
                    newBalance = player.balance -= bet;
                    if (newBalance === 0) {
                        player.allIn = true;
                    }
                    table.roundPot += bet;
                    table.totalBets++;
                    player.totalBetValue += bet;
                    player.totalBetValueOnRound += bet;
                    // Aumentar a maior bet do round caso a bet total do usuário seja maior que a maior bet do round...
                    if (player.totalBetValueOnRound > table.totalHighestBet) {
                        table.totalHighestBet = player.totalBetValueOnRound;
                    }
                    if (bet > table.highestBet) {
                        table.highestBet = bet;
                    }
                    // Passar o turno para outro jogador...
                    return [4 /*yield*/, passTurn_1.passTurn(player, table, socket)];
                case 10:
                    // Passar o turno para outro jogador...
                    _a.sent();
                    newMinBet = (table.highestBet + table.bigBlind);
                    socket.emit('bet_response', 'Aposta feita com sucesso!');
                    socket.emit('min_bet', newMinBet);
                    socket.to(table.id).emit('min_bet', newMinBet);
                    return [4 /*yield*/, prisma.users.update({ data: { balance: Math.floor(newBalance) }, where: { id: player.databaseId } })];
                case 11:
                    balance = (_a.sent()).balance;
                    player.balance = balance;
                    emitCardsForEachSocket_1.emitCardsForEachSocket(table.sockets, table.players, table.cards);
                    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                    return [2 /*return*/];
            }
        });
    });
}
exports.newBet = newBet;

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
exports.showdonw = void 0;
var client_1 = require("@prisma/client");
var getWinners_1 = require("../functions/getWinners");
var movePlayersInTable_1 = require("./movePlayersInTable");
var startRound_1 = require("./startRound");
var prisma = new client_1.PrismaClient();
function showdonw(table, socket) {
    return __awaiter(this, void 0, void 0, function () {
        var oldBalances, playersThatDidNotFold, playersInTable, winners, pot, i, winner, winnerIndex, newWinners, i_1, winner_1, maxWin, newBalance, roundResultInfo_1, newBalance, i, winner, maxWin, newBalance, roundResultInfo_2, newBalance, roundResultInfo_3, roundResultInfo;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    oldBalances = table.players.map(function (player) {
                        return {
                            id: player.id,
                            balance: player.balance,
                        };
                    });
                    playersThatDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    playersInTable = table.players.filter(function (player) { return player.folded === false; });
                    winners = getWinners_1.getWinners(playersThatDidNotFold, table.cards);
                    pot = table.roundPot;
                    if (!(winners.length > 1)) return [3 /*break*/, 2];
                    // Ocorreu um empate
                    winners.forEach(function (winner) { return __awaiter(_this, void 0, void 0, function () {
                        var amountThatShouldReturnToWinnerInPercentage, newBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    amountThatShouldReturnToWinnerInPercentage = (winner.totalBetValue / table.roundPot) * 100;
                                    newBalance = winner.balance + ((table.roundPot / 100) * amountThatShouldReturnToWinnerInPercentage);
                                    winner.balance = Math.floor(newBalance);
                                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Acabar o round.
                    table.roundStatus = false;
                    // Iniciar outro round.
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2:
                    if (!(winners.length === 1)) return [3 /*break*/, 34];
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < playersThatDidNotFold.length)) return [3 /*break*/, 18];
                    winner = winners[i];
                    if (winner.allIn === false) {
                        i = playersThatDidNotFold.length;
                    }
                    ;
                    winnerIndex = playersInTable.indexOf(winner);
                    playersInTable.splice(winnerIndex, 1);
                    newWinners = getWinners_1.getWinners(playersInTable, table.cards);
                    if (!(newWinners.length > 1)) return [3 /*break*/, 16];
                    i_1 = 0;
                    _a.label = 4;
                case 4:
                    if (!(i_1 < winners.length)) return [3 /*break*/, 14];
                    winner_1 = winners[i_1];
                    if (!(winner_1.allIn === true)) return [3 /*break*/, 10];
                    maxWin = (winner_1.totalBetValue * playersThatDidNotFold.length) - (((winner_1.totalBetValue * playersThatDidNotFold.length) / 100) * table.houseSlice);
                    newBalance = (winner_1.balance + pot) - ((pot / 100) * table.houseSlice);
                    if (!(maxWin < newBalance)) return [3 /*break*/, 5];
                    winner_1.balance = Math.floor(maxWin);
                    pot -= maxWin;
                    return [3 /*break*/, 8];
                case 5:
                    // Ganhou o pot inteiro, portanto j?? pode acabar a rodada
                    winner_1.balance = Math.floor(newBalance);
                    // Acabar o round
                    table.roundStatus = false;
                    roundResultInfo_1 = table.players.map(function (player) {
                        var oldBalance = oldBalances.find(function (balance) { return balance.id === player.id; });
                        if (!oldBalance)
                            return;
                        var profit = ((player.balance - (oldBalance === null || oldBalance === void 0 ? void 0 : oldBalance.balance)) - player.totalBetValue);
                        return {
                            id: player.databaseId,
                            name: player.name,
                            avatar_url: player.avatar_url,
                            totalBetValue: player.totalBetValue,
                            folded: player.folded,
                            cards: player.cards,
                            profit: profit,
                        };
                    });
                    socket.emit('round_result', roundResultInfo_1);
                    socket.to(table.id).emit('round_result', roundResultInfo_1);
                    // Garantir que o pot seja 0, para que caso o loop n??o funcione por algum motivo n??o pague ningu??m a mais.
                    pot -= pot;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner_1.balance }, where: { id: winner_1.databaseId } })];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
                case 8: return [4 /*yield*/, prisma.users.update({ data: { balance: winner_1.balance }, where: { id: winner_1.databaseId } })];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 10:
                    newBalance = (winner_1.balance + pot) - ((pot / 100) * table.houseSlice);
                    winner_1.balance = Math.floor(newBalance);
                    pot -= pot;
                    table.roundStatus = false;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner_1.balance }, where: { id: winner_1.databaseId } })];
                case 12:
                    _a.sent();
                    return [2 /*return*/];
                case 13:
                    i_1++;
                    return [3 /*break*/, 4];
                case 14:
                    newWinners.forEach(function (winner) { return __awaiter(_this, void 0, void 0, function () {
                        var amountThatShouldReturnToWinnerInPercentage, newBalance;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    amountThatShouldReturnToWinnerInPercentage = (winner.totalBetValue / table.roundPot) * 100;
                                    newBalance = winner.balance + ((pot / 100) * amountThatShouldReturnToWinnerInPercentage);
                                    winner.balance = Math.floor(newBalance);
                                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    // Acabar o round.
                    table.roundStatus = false;
                    // Iniciar outro round.
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 15:
                    _a.sent();
                    i = playersThatDidNotFold.length;
                    return [2 /*return*/];
                case 16:
                    winners.push(newWinners[0]);
                    _a.label = 17;
                case 17:
                    i++;
                    return [3 /*break*/, 3];
                case 18:
                    i = 0;
                    _a.label = 19;
                case 19:
                    if (!(i < winners.length)) return [3 /*break*/, 32];
                    winner = winners[i];
                    console.log(winner.name, i);
                    if (!(pot <= 0)) return [3 /*break*/, 21];
                    table.roundStatus = false;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 20:
                    _a.sent();
                    return [2 /*return*/];
                case 21:
                    if (!table.roundStatus) {
                        return [2 /*return*/];
                    }
                    if (!(winner.allIn === true)) return [3 /*break*/, 27];
                    maxWin = (winner.totalBetValue * playersThatDidNotFold.length) - (((winner.totalBetValue * playersThatDidNotFold.length) / 100) * table.houseSlice);
                    newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);
                    console.log(maxWin, newBalance, i);
                    if (!(maxWin < newBalance)) return [3 /*break*/, 22];
                    // O ganho tem que ser limitado
                    winner.balance = Math.floor(maxWin);
                    pot -= maxWin;
                    return [3 /*break*/, 25];
                case 22:
                    // Ganhou o pot inteiro, portanto j?? pode acabar a rodada
                    winner.balance = Math.floor(newBalance);
                    // Acabar o round
                    table.roundStatus = false;
                    roundResultInfo_2 = table.players.map(function (player) {
                        var oldBalance = oldBalances.find(function (balance) { return balance.id === player.id; });
                        if (!oldBalance)
                            return;
                        var profit = ((player.balance - (oldBalance === null || oldBalance === void 0 ? void 0 : oldBalance.balance)) - player.totalBetValue);
                        return {
                            id: player.databaseId,
                            name: player.name,
                            avatar_url: player.avatar_url,
                            totalBetValue: player.totalBetValue,
                            folded: player.folded,
                            cards: player.cards,
                            profit: profit,
                        };
                    });
                    socket.emit('round_result', roundResultInfo_2);
                    socket.to(table.id).emit('round_result', roundResultInfo_2);
                    // Garantir que o pot seja 0, para que caso o loop n??o funcione por algum motivo n??o pague ningu??m a mais.
                    pot -= pot;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 23:
                    _a.sent();
                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } })];
                case 24:
                    _a.sent();
                    return [2 /*return*/];
                case 25: return [4 /*yield*/, prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } })];
                case 26:
                    _a.sent();
                    return [3 /*break*/, 30];
                case 27:
                    console.log('Hi', i, table.roundStatus, winner.allIn, winner.totalBetValue);
                    newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);
                    winner.balance = Math.floor(newBalance);
                    table.roundStatus = false;
                    roundResultInfo_3 = table.players.map(function (player) {
                        var oldBalance = oldBalances.find(function (balance) { return balance.id === player.id; });
                        if (!oldBalance)
                            return;
                        var profit = ((player.balance - (oldBalance === null || oldBalance === void 0 ? void 0 : oldBalance.balance)) - player.totalBetValue);
                        return {
                            id: player.databaseId,
                            name: player.name,
                            avatar_url: player.avatar_url,
                            totalBetValue: player.totalBetValue,
                            folded: player.folded,
                            cards: player.cards,
                            profit: profit,
                        };
                    });
                    socket.emit('round_result', roundResultInfo_3);
                    socket.to(table.id).emit('round_result', roundResultInfo_3);
                    // Garantir que o pot seja 0, para que caso o loop n??o funcione por algum motivo n??o pague ningu??m a mais.
                    pot -= pot;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 28:
                    _a.sent();
                    return [4 /*yield*/, prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } })];
                case 29:
                    _a.sent();
                    return [2 /*return*/];
                case 30:
                    ;
                    _a.label = 31;
                case 31:
                    i++;
                    return [3 /*break*/, 19];
                case 32:
                    ;
                    table.roundStatus = false;
                    roundResultInfo = table.players.map(function (player) {
                        var oldBalance = oldBalances.find(function (balance) { return balance.id === player.id; });
                        if (!oldBalance)
                            return;
                        var profit = ((player.balance - (oldBalance === null || oldBalance === void 0 ? void 0 : oldBalance.balance)) - player.totalBetValue);
                        return {
                            id: player.databaseId,
                            name: player.name,
                            avatar_url: player.avatar_url,
                            totalBetValue: player.totalBetValue,
                            folded: player.folded,
                            cards: player.cards,
                            profit: profit,
                        };
                    });
                    socket.emit('round_result', roundResultInfo);
                    socket.to(table.id).emit('round_result', roundResultInfo);
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 33:
                    _a.sent();
                    _a.label = 34;
                case 34: return [2 /*return*/];
            }
        });
    });
}
exports.showdonw = showdonw;

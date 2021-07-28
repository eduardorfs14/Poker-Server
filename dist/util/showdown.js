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
        var playersThatDidNotFold, isSomeoneAllIn, winners, pot, winner, winnerIndex, maxWin, newBalance, potForEachWinner;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playersThatDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    isSomeoneAllIn = playersThatDidNotFold.some(function (player) { return player.allIn === true; });
                    winners = getWinners_1.getWinners(playersThatDidNotFold, table.cards);
                    if (!isSomeoneAllIn) return [3 /*break*/, 10];
                    pot = table.roundPot;
                    _a.label = 1;
                case 1:
                    if (!(playersThatDidNotFold.length >= 1)) return [3 /*break*/, 8];
                    if (!(winners.length === 1)) return [3 /*break*/, 6];
                    winner = winners[0];
                    if (!(winner.allIn === true)) return [3 /*break*/, 3];
                    winnerIndex = playersThatDidNotFold.indexOf(winner);
                    playersThatDidNotFold.splice(winnerIndex, 1);
                    maxWin = (winner.totalBetValue * playersThatDidNotFold.length) - (((winner.totalBetValue * playersThatDidNotFold.length) / 100) * 2);
                    winner.balance = parseInt(maxWin.toFixed(0));
                    socket.emit('winner', winner.databaseId);
                    socket.to(table.id).emit('winner', winner.databaseId);
                    // table.roundStatus = false;
                    pot -= maxWin;
                    winners = getWinners_1.getWinners(playersThatDidNotFold, table.cards);
                    return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    playersThatDidNotFold.splice(0, playersThatDidNotFold.length);
                    newBalance = (winner.balance + pot) - ((pot / 100) * 2);
                    winner.balance = parseInt(newBalance.toFixed(0));
                    socket.emit('winner', winner.databaseId);
                    socket.to(table.id).emit('winner', winner.databaseId);
                    table.roundStatus = false;
                    // Iniciar outro round...
                    // movePlayersInTable(table);
                    // await startRound(table, socket, true);
                    return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } })];
                case 4:
                    // Iniciar outro round...
                    // movePlayersInTable(table);
                    // await startRound(table, socket, true);
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    console.log('2 winners');
                    _a.label = 7;
                case 7: return [3 /*break*/, 1];
                case 8:
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10:
                    ;
                    potForEachWinner = table.roundPot / (winners.length);
                    winners.forEach(function (winner) {
                        var newBalance = (winner.balance + potForEachWinner) - ((potForEachWinner / 100) * 2);
                        winner.balance = parseInt(newBalance.toFixed(0));
                        socket.emit('winner', winner.databaseId);
                        socket.to(table.id).emit('winner', winner.databaseId);
                    });
                    table.roundStatus = false;
                    // Iniciar outro round...
                    movePlayersInTable_1.movePlayersInTable(table);
                    return [4 /*yield*/, startRound_1.startRound(table, socket, true)];
                case 11:
                    _a.sent();
                    winners.forEach(function (winner) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(winner.balance.toFixed(0)) }, where: { id: winner.databaseId } })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.showdonw = showdonw;

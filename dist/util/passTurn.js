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
var prisma = new client_1.PrismaClient();
function passTurn(player, table, socket, isFold) {
    return __awaiter(this, void 0, void 0, function () {
        var playersWhoDidNotFold, winner, newBalance, balance, playerIndex_1, playersWhoDidNotFold_1, nextPlayer, nextPlayerThatDidNotFold_1, socket_1, interval, nextPlayerThatDidNotFold_2, socket_2, interval;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    player.isTurn = false;
                    playersWhoDidNotFold = table.players.filter(function (player) { return player.folded === false; });
                    if (!(playersWhoDidNotFold.length === 1)) return [3 /*break*/, 2];
                    winner = playersWhoDidNotFold[0];
                    winner.isTurn = false;
                    newBalance = (winner.balance + table.roundPot) - ((table.roundPot / 100) * 2);
                    socket.emit('winner', winner.databaseId);
                    socket.to(table.id).emit('winner', winner.databaseId);
                    table.roundStatus = false;
                    return [4 /*yield*/, prisma.users.update({ data: { balance: parseInt(newBalance.toFixed(0)) }, where: { id: winner.databaseId } })];
                case 1:
                    balance = (_a.sent()).balance;
                    winner.balance = balance;
                    socket.emit('player', player);
                    emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                    if (isFold) {
                        movePlayersInTable_1.movePlayersInTable(table);
                        startRound_1.startRound(table, socket, true);
                    }
                    return [2 /*return*/];
                case 2:
                    playerIndex_1 = table.players.indexOf(player);
                    playersWhoDidNotFold_1 = table.players.filter(function (player) { return player.folded === false; });
                    nextPlayer = playersWhoDidNotFold_1[playerIndex_1 + 1];
                    playersWhoDidNotFold_1.forEach(function (player) {
                        player.timer = 45;
                    });
                    if (!nextPlayer) {
                        nextPlayerThatDidNotFold_1 = table.players.find(function (player) { return player.folded === false; });
                        if (nextPlayerThatDidNotFold_1) {
                            nextPlayerThatDidNotFold_1.isTurn = true;
                            socket_1 = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFold_1.id; });
                            if (!socket_1) {
                                return [2 /*return*/];
                            }
                            socket_1.emit('your_turn');
                            interval = decrementTimer_1.decrementTimer(nextPlayerThatDidNotFold_1, table, socket_1);
                            if (isFold) {
                                clearInterval(interval);
                            }
                        }
                    }
                    else {
                        nextPlayerThatDidNotFold_2 = table.players.find(function (player, index) { return player.folded === false && playerIndex_1 < index; });
                        if (nextPlayerThatDidNotFold_2) {
                            nextPlayerThatDidNotFold_2.isTurn = true;
                            socket_2 = table.sockets.find(function (socket) { return socket.id === nextPlayerThatDidNotFold_2.id; });
                            if (!socket_2) {
                                return [2 /*return*/];
                            }
                            socket_2.emit('your_turn');
                            interval = decrementTimer_1.decrementTimer(nextPlayerThatDidNotFold_2, table, socket_2);
                            if (isFold) {
                                clearInterval(interval);
                            }
                        }
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.passTurn = passTurn;

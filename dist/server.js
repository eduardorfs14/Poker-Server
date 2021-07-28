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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var client_1 = require("@prisma/client");
var getPosition_1 = require("./util/getPosition");
var startRound_1 = require("./util/startRound");
var getTables_1 = require("./util/getTables");
var emitAllPlayersForEachSocket_1 = require("./util/emitAllPlayersForEachSocket");
var newBet_1 = require("./util/newBet");
var PokerTable_1 = require("./PokerTable/PokerTable");
var app = express_1.default();
var httpServer = http_1.default.createServer(app);
var io = new socket_io_1.default.Server(httpServer, { cors: {} });
var prisma = new client_1.PrismaClient();
var tables = getTables_1.getTables();
io.on('connection', function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var player;
    return __generator(this, function (_a) {
        console.log("[IO] " + socket.id + " is connected");
        player = null;
        socket.on('join_table', function (tableId) { return __awaiter(void 0, void 0, void 0, function () {
            var table;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, socket.join(tableId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, tables];
                    case 2:
                        table = (_a.sent()).find(function (table) { return table.id === tableId; });
                        if (!table) {
                            return [2 /*return*/];
                        }
                        socket.on('player', function (newPlayer) { return __awaiter(void 0, void 0, void 0, function () {
                            var playerExists, databasePlayer, playerIndex_1, playerIndex, pokerTable;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // Verificar se a mesa já está cheia
                                        if (table.players.length >= table.maxPlayers) {
                                            socket.emit('error_msg', 'Mesa já está cheia');
                                            return [2 /*return*/];
                                        }
                                        playerExists = table.players.find(function (player) { return player.databaseId === newPlayer.id; });
                                        if (playerExists) {
                                            socket.emit('error_msg', 'Você já está na mesa');
                                            return [2 /*return*/];
                                        }
                                        /*
                                          Para o jogador não entrar 2 vezes na mesa ao clicar muito rapido no botão de entrar na mesa
                                          envia o jogador sem conferir se ele é quem diz ser
                                          por conta da query ao banco que demora ele poderia entrar 2 vezes na mesa se isso não fosse feito
                                        */
                                        player = newPlayer;
                                        player.databaseId = newPlayer.id;
                                        table.players.push(player);
                                        return [4 /*yield*/, prisma.users.findUnique({ where: { id: newPlayer.id } })];
                                    case 1:
                                        databasePlayer = _a.sent();
                                        if (!databasePlayer) {
                                            playerIndex_1 = table.players.indexOf(player);
                                            table.players.splice(playerIndex_1, 1);
                                            socket.emit('error_msg', 'Usuário inexistente');
                                            return [2 /*return*/];
                                        }
                                        playerIndex = table.players.indexOf(player);
                                        table.players.splice(playerIndex, 1);
                                        // Adicionar propriedades ao player já verificadas
                                        player.balance = databasePlayer.balance;
                                        if (player.balance <= (table.bigBlind * 5)) {
                                            pokerTable = new PokerTable_1.PokerTable();
                                            pokerTable.leave(table, player, socket);
                                            socket.emit('error_msg', 'Saldo insuficiente para entrar na mesa');
                                            return [2 /*return*/];
                                        }
                                        player.avatarURL = databasePlayer.avatar_url;
                                        player.email = databasePlayer.email;
                                        player.databaseId = databasePlayer.id;
                                        player.id = socket.id;
                                        player.folded = false;
                                        player.allIn = false;
                                        player.position = getPosition_1.getPosition(table.players);
                                        table.players.push(player);
                                        socket.emit('player', player);
                                        emitAllPlayersForEachSocket_1.emitAllPlayersForEachSocket(table.sockets, table.players);
                                        console.log("[IO] Player recived. Total of players " + table.players.length);
                                        // Adicionar "socket" no "sockets" array
                                        table.sockets.push(socket);
                                        // Caso o mínimo de jogadores para a rodada iniciar seja menor ou igual ao número de "players"
                                        // e a rodada não tenha começado
                                        // Iniciar a rodada
                                        if (table.players.length >= (table === null || table === void 0 ? void 0 : table.minPlayers)) {
                                            if (!table.roundStatus) {
                                                // Iniciar round...
                                                startRound_1.startRound(table, socket, true);
                                            }
                                            else {
                                                // Caso a rodada já tenha começado
                                                socket.emit('round_already_started', 'Rodada já começou, espere a próxima');
                                                player.folded = true;
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        socket.on('new_bet', function (bet) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!player) {
                                    return [2 /*return*/];
                                }
                                newBet_1.newBet(bet, player, table, socket);
                                return [2 /*return*/];
                            });
                        }); });
                        socket.on('disconnect', function () { return __awaiter(void 0, void 0, void 0, function () {
                            var pokerTable;
                            return __generator(this, function (_a) {
                                console.log("[IO] " + socket.id + " is disconnected");
                                if (!player) {
                                    return [2 /*return*/];
                                }
                                pokerTable = new PokerTable_1.PokerTable();
                                pokerTable.leave(table, player, socket, true);
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
httpServer.listen(process.env.PORT || 8080, function () { return console.log('[SERVER] Server running'); });

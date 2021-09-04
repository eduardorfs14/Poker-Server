import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
import { getWinners } from "../functions/getWinners";
import { Table } from "../interfaces/Table";
import { movePlayersInTable } from "./movePlayersInTable";
import { startRound } from "./startRound";

const prisma = new PrismaClient();

export async function showdonw(table: Table, socket: Socket) {
  const oldBalances = table.players.map(player => {
    return {
      id: player.id,
      balance: player.balance,
    }
  });

  const playersThatDidNotFold = table.players.filter(player => player.folded === false);
  const playersInTable = table.players.filter(player => player.folded === false);

  let winners = getWinners(playersThatDidNotFold, table.cards);
  let pot = table.roundPot;

  if (winners.length > 1) {
    // Ocorreu um empate
    winners.forEach(async winner => {
      const amountThatShouldReturnToWinnerInPercentage = (winner.totalBetValue / table.roundPot) * 100;

      const newBalance = winner.balance + ((table.roundPot / 100) * amountThatShouldReturnToWinnerInPercentage);
      winner.balance = Math.floor(newBalance);
      await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
    });

    // Acabar o round.
    table.roundStatus = false;
    
    // Iniciar outro round.
    movePlayersInTable(table);
    await startRound(table, socket, true);
    return;
  }

  if (winners.length === 1) {
    for (let i = 0; i < playersThatDidNotFold.length; i++) {
      const winner = winners[i];
  
      if (winner.allIn === false) {
        i = playersThatDidNotFold.length;
      };
  
      const winnerIndex = playersInTable.indexOf(winner);
      playersInTable.splice(winnerIndex, 1);
  
      const newWinners = getWinners(playersInTable, table.cards);

      if (newWinners.length > 1) {
        // Ocorreu um empate
        // Como a rodada sempre acaba no empate, simplesmente pago todos os jogadores que ganharam antes, caso eles estejam all-in paga quem empatou, caso não estejam all-in paga normalmente e acaba a rodada
        for (let i = 0; i < winners.length; i++) {
          const winner = winners[i];
          if (winner.allIn === true) {
            const maxWin = (winner.totalBetValue * playersThatDidNotFold.length) - (((winner.totalBetValue * playersThatDidNotFold.length) / 100) * table.houseSlice);
            const newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);

            if (maxWin < newBalance) {
              winner.balance = Math.floor(maxWin);
              pot -= maxWin;
            } else {
              // Ganhou o pot inteiro, portanto já pode acabar a rodada
              winner.balance = Math.floor(newBalance);
    
              // Acabar o round
              table.roundStatus = false;
            
            const roundResultInfo = table.players.map(player => {
              const oldBalance = oldBalances.find(balance => balance.id === player.id);
              if (!oldBalance) return;
    
              const profit = ((player.balance - oldBalance?.balance) - player.totalBetValue);
                
              return {
                id: player.databaseId,
                name: player.name,
                avatar_url: player.avatar_url,
                totalBetValue: player.totalBetValue,
                folded: player.folded,
                cards: player.cards,
                profit,
              }
            });
                
            socket.emit('round_result', roundResultInfo);
            socket.to(table.id).emit('round_result', roundResultInfo);
    
            // Garantir que o pot seja 0, para que caso o loop não funcione por algum motivo não pague ninguém a mais.
            pot -= pot;
                
            // Iniciar outro round...
            movePlayersInTable(table);
            await startRound(table, socket, true);
            await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
            return;
            }
            
            await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
          } else {
            const newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);
            winner.balance = Math.floor(newBalance);

            pot -= pot;
      
            table.roundStatus = false;
            
            // Iniciar outro round...
            movePlayersInTable(table);
            await startRound(table, socket, true);
            await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
            return;
          }
        }

        newWinners.forEach(async winner => {
          // Aqui usar table.roundPot pois a porcentagem tem que ser calculada com o valor total do pot
          const amountThatShouldReturnToWinnerInPercentage = (winner.totalBetValue / table.roundPot) * 100;
    
          // Aqui usar a variável pot pois o saldo tem que ser adicionado com base no restante do pot
          const newBalance = winner.balance + ((pot / 100) * amountThatShouldReturnToWinnerInPercentage);
          winner.balance = Math.floor(newBalance);
          await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
        });
    
        // Acabar o round.
        table.roundStatus = false;
        
        // Iniciar outro round.
        movePlayersInTable(table);
        await startRound(table, socket, true);
        i = playersThatDidNotFold.length;
        return;
      }

      winners.push(newWinners[0]);
    }
  
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      console.log(winner.name, i);
  
      if (pot <= 0) {
        table.roundStatus = false;
        
        // Iniciar outro round...
        movePlayersInTable(table);
        await startRound(table, socket, true);
        return;
      }
  
      if (!table.roundStatus) {
        return;
      }
  
      if (winner.allIn === true) {
        const maxWin = (winner.totalBetValue * playersThatDidNotFold.length) - (((winner.totalBetValue * playersThatDidNotFold.length) / 100) * table.houseSlice);
        const newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);

        console.log(maxWin, newBalance, i);

        if (maxWin < newBalance) {
          // O ganho tem que ser limitado
          winner.balance = Math.floor(maxWin);
          pot -= maxWin;
        } else {
          // Ganhou o pot inteiro, portanto já pode acabar a rodada
          winner.balance = Math.floor(newBalance);

          // Acabar o round
          table.roundStatus = false;
        
          const roundResultInfo = table.players.map(player => {
            const oldBalance = oldBalances.find(balance => balance.id === player.id);
            if (!oldBalance) return;

            const profit = ((player.balance - oldBalance?.balance) - player.totalBetValue);
            
            return {
              id: player.databaseId,
              name: player.name,
              avatar_url: player.avatar_url,
              totalBetValue: player.totalBetValue,
              folded: player.folded,
              cards: player.cards,
              profit,
            }
          });
            
          socket.emit('round_result', roundResultInfo);
          socket.to(table.id).emit('round_result', roundResultInfo);

          // Garantir que o pot seja 0, para que caso o loop não funcione por algum motivo não pague ninguém a mais.
          pot -= pot;
            
          // Iniciar outro round...
          movePlayersInTable(table);
          await startRound(table, socket, true);
          await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
          return;
        }
  
        await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
      } else {
        console.log('Hi', i, table.roundStatus, winner.allIn, winner.totalBetValue);
        const newBalance = (winner.balance + pot) - ((pot / 100) * table.houseSlice);
        winner.balance = Math.floor(newBalance);
        
        table.roundStatus = false;
        
        const roundResultInfo = table.players.map(player => {
          const oldBalance = oldBalances.find(balance => balance.id === player.id);
          if (!oldBalance) return;

          const profit = ((player.balance - oldBalance?.balance) - player.totalBetValue);
          
          return {
            id: player.databaseId,
            name: player.name,
            avatar_url: player.avatar_url,
            totalBetValue: player.totalBetValue,
            folded: player.folded,
            cards: player.cards,
            profit,
          }
        });
        
        socket.emit('round_result', roundResultInfo);
        socket.to(table.id).emit('round_result', roundResultInfo);

        // Garantir que o pot seja 0, para que caso o loop não funcione por algum motivo não pague ninguém a mais.
        pot -= pot;
        
        // Iniciar outro round...
        movePlayersInTable(table);
        await startRound(table, socket, true);
        await prisma.users.update({ data: { balance: winner.balance }, where: { id: winner.databaseId } });
        return;
      };
    };
  
    table.roundStatus = false;

    const roundResultInfo = table.players.map(player => {
      const oldBalance = oldBalances.find(balance => balance.id === player.id);
      if (!oldBalance) return;

      const profit = ((player.balance - oldBalance?.balance) - player.totalBetValue);
      
      return {
        id: player.databaseId,
        name: player.name,
        avatar_url: player.avatar_url,
        totalBetValue: player.totalBetValue,
        folded: player.folded,
        cards: player.cards,
        profit,
      }
    });
  
    socket.emit('round_result', roundResultInfo);
    socket.to(table.id).emit('round_result', roundResultInfo);
    
    // Iniciar outro round...
    movePlayersInTable(table);
    await startRound(table, socket, true);
  }
}
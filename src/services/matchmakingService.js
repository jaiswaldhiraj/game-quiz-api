const { queue } = require('../models/store');
const gameService = require('./gameService');

const findMatch = (playerId, level) => {
  if (!queue[level]) {
    queue[level] = [];
  }

  // Check if player is already in queue to prevent duplicates
  if (queue[level].includes(playerId)) {
    return { status: 'waiting', message: 'Already in queue' };
  }

  // If there is someone waiting
  if (queue[level].length > 0) {
    const opponentId = queue[level].shift();

    // Prevent matching with self (edge case)
    if (opponentId === playerId) {
      queue[level].push(playerId);
      return { status: 'waiting' };
    }

    // Create game
    const gameId = gameService.createGame(playerId, opponentId);

    return {
      status: 'matched',
      gameId,
      opponentId
    };
  } else {
    // Add to queue
    queue[level].push(playerId);
    return { status: 'waiting' };
  }
};

module.exports = {
  findMatch
};

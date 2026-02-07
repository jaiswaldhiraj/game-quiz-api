const { games, players } = require('../models/store');
const questions = require('../utils/questions');
const { v4: uuidv4 } = require('uuid');

const createGame = (player1Id, player2Id) => {
  const gameId = uuidv4();

  // Select 10 random questions (or based on level, but random for now as per simple requirement)
  const shuffled = questions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, 10);

  games[gameId] = {
    id: gameId,
    players: [player1Id, player2Id],
    questions: selectedQuestions,
    answers: {}, // { playerId: { answers: [], timestamp: number } }
    status: 'active',
    startTime: Date.now()
  };

  return gameId;
};

const submitAnswers = (gameId, playerId, playerAnswers) => {
  const game = games[gameId];
  if (!game) return { error: 'Game not found' };
  if (!game.players.includes(playerId)) return { error: 'Player not in game' };

  // Record submission
  game.answers[playerId] = {
    answers: playerAnswers, // Array of { questionId, answer }
    timestamp: Date.now()
  };

  // Check if both players have submitted
  if (Object.keys(game.answers).length === 2) {
    game.status = 'completed';
  }

  return { status: 'submitted' };
};

const getGameResult = (gameId) => {
  const game = games[gameId];
  if (!game) return { error: 'Game not found' };

  if (game.status !== 'completed' && Object.keys(game.answers).length < 2) {
    return { status: 'waiting_for_opponent' };
  }

  // Calculate scores
  const results = game.players.map(pid => {
    const entry = game.answers[pid];
    if (!entry) return { playerId: pid, score: 0, time: Infinity }; // Should not happen if completed

    let score = 0;
    entry.answers.forEach(ans => {
      const q = game.questions.find(quest => quest.id === ans.questionId);
      if (q && q.answer === ans.answer) {
        score++;
      }
    });

    return { playerId: pid, score, time: entry.timestamp };
  });

  // Determine winner
  // Criteria: 1. Higher score. 2. Faster time (lower timestamp).
  let winnerId = null;
  let message = "Draw";

  const [p1, p2] = results;

  if (p1.score > p2.score) {
    winnerId = p1.playerId;
    message = "Player 1 Wins by Score";
  } else if (p2.score > p1.score) {
    winnerId = p2.playerId;
    message = "Player 2 Wins by Score";
  } else {
    // Scores equal, check time
    if (p1.time < p2.time) {
      winnerId = p1.playerId;
      message = "Player 1 Wins by Speed";
    } else if (p2.time < p1.time) {
      winnerId = p2.playerId;
      message = "Player 2 Wins by Speed";
    } else {
      message = "Absolute Tie";
    }
  }

  return {
    status: 'completed',
    gameId,
    winnerId,
    message,
    results
  };
};

const getGameStatus = (gameId) => {
  return games[gameId] || null;
}

module.exports = {
  createGame,
  submitAnswers,
  getGameResult,
  getGameStatus
};

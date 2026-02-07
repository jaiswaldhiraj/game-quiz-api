const matchmakingService = require('../services/matchmakingService');
const gameService = require('../services/gameService');

const match = (req, res) => {
  const { playerId, level } = req.body;
  if (!playerId || !level) {
    return res.status(400).json({ error: 'playerId and level are required' });
  }

  const result = matchmakingService.findMatch(playerId, level);
  res.json(result);
};

const getGame = (req, res) => {
  const { gameId } = req.params;
  const game = gameService.getGameStatus(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json(game);
};

const submit = (req, res) => {
  const { gameId } = req.params;
  const { playerId, answers } = req.body;

  if (!playerId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid submission data' });
  }

  const result = gameService.submitAnswers(gameId, playerId, answers);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
};

const getResult = (req, res) => {
  const { gameId } = req.params;
  const result = gameService.getGameResult(gameId);
  if (result.error) {
    return res.status(404).json(result);
  }
  res.json(result);
};

module.exports = {
  match,
  getGame,
  submit,
  getResult
};

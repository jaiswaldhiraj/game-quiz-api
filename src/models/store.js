// Basic in-memory storage
const players = {}; // playerId -> Player Object
const games = {};   // gameId -> Game Object
const queue = {};   // level -> Array of playerIds

module.exports = {
  players,
  games,
  queue
};

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.post('/match', apiController.match);
router.get('/game/:gameId', apiController.getGame);
router.post('/game/:gameId/submit', apiController.submit);
router.get('/game/:gameId/result', apiController.getResult);

module.exports = router;

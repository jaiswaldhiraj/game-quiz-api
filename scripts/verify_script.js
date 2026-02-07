const http = require('http');

const post = (path, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
};

const get = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api' + path,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
};

const run = async () => {
  try {
    console.log('Starting verification...');
    const p1Id = 'player1-' + Date.now();
    const p2Id = 'player2-' + Date.now();
    const level = 1;

    console.log('1. Player 1 joining...');
    const r1 = await post('/match', { playerId: p1Id, level });
    console.log('P1 Status:', r1.body.status);

    console.log('2. Player 2 joining...');
    const r2 = await post('/match', { playerId: p2Id, level });
    console.log('P2 Status:', r2.body.status);

    const gameId = r2.body.gameId;
    console.log('Game ID:', gameId);

    if (!gameId) throw new Error('No gameId returned for P2');

    console.log('3. Checking game status...');
    const g = await get(`/game/${gameId}`);
    console.log('Game Status:', g.body.status);

    console.log('4. P1 Submitting...');
    await post(`/game/${gameId}/submit`, { playerId: p1Id, answers: [{ questionId: 1, answer: "4" }] });

    console.log('5. Checking result (expect wait)...');
    const res1 = await get(`/game/${gameId}/result`);
    console.log('Result Status:', res1.body.status);

    console.log('6. P2 Submitting...');
    await post(`/game/${gameId}/submit`, { playerId: p2Id, answers: [{ questionId: 1, answer: "4" }, { questionId: 2, answer: "Paris" }] });

    console.log('7. Checking final result...');
    const res2 = await get(`/game/${gameId}/result`);
    console.log('Final Result Winner:', res2.body.winnerId === p2Id ? 'Player 2 (Correct)' : 'Wrong Winner');

  } catch (e) {
    console.error('Error:', e);
  }
};

run();

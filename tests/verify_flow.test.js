const request = require('supertest');
const app = require('../index');
const { v4: uuidv4 } = require('uuid');

describe('Game Quiz API Flow', () => {
  let gameId;
  const player1Id = uuidv4();
  const player2Id = uuidv4();
  const level = 1;

  test('Player 1 joins and waits', async () => {
    const res = await request(app)
      .post('/api/match')
      .send({ playerId: player1Id, level });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('waiting');
  });

  test('Player 2 joins and matches', async () => {
    const res = await request(app)
      .post('/api/match')
      .send({ playerId: player2Id, level });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('matched');
    expect(res.body.gameId).toBeDefined();
    gameId = res.body.gameId;
  });

  test('Game should be active with 10 questions', async () => {
    const res = await request(app).get(`/api/game/${gameId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('active');
    expect(res.body.questions.length).toEqual(10);
    expect(res.body.players).toContain(player1Id);
    expect(res.body.players).toContain(player2Id);
  });

  test('Player 1 submits answers', async () => {
    // Mock answers - suppose first 5 are correct
    const res = await request(app)
      .post(`/api/game/${gameId}/submit`)
      .send({
        playerId: player1Id,
        answers: [
          { questionId: 1, answer: "4" }, // Correct
          { questionId: 2, answer: "Paris" } // Correct
        ]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('submitted');
  });

  test('Check result early - should wait', async () => {
    const res = await request(app).get(`/api/game/${gameId}/result`);
    expect(res.statusCode).toEqual(200); // 200 OK because it returns a valid status object, not error
    expect(res.body.status).toEqual('waiting_for_opponent');
  });

  test('Player 2 submits answers (winner)', async () => {
    // P2 answers more questions correctly
    const res = await request(app)
      .post(`/api/game/${gameId}/submit`)
      .send({
        playerId: player2Id,
        answers: [
          { questionId: 1, answer: "4" },
          { questionId: 2, answer: "Paris" },
          { questionId: 3, answer: "Mars" }
        ]
      });

    expect(res.statusCode).toEqual(200);
  });

  test('Check final result', async () => {
    const res = await request(app).get(`/api/game/${gameId}/result`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('completed');
    expect(res.body.winnerId).toEqual(player2Id); // P2 has 3 correct, P1 has 2
  });
});

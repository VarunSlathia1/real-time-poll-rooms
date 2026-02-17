import mysql from 'mysql2';

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'your_username',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_NAME || 'poll_db'
    });
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.connection.connect(err => {
        if (err) reject(err);
        console.log('Database connected!');
        resolve();
      });
    });
  }

  async createPoll(poll) {
    const query = 'INSERT INTO polls (id, question, options) VALUES (?, ?, ?)';
    return new Promise((resolve, reject) => {
      this.connection.query(
        query,
        [poll.id, poll.question, JSON.stringify(poll.options)],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }

  async getPollById(id) {
    const query = 'SELECT * FROM polls WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.connection.query(query, [id], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  async getPollByShareToken(shareToken) {
    const query = 'SELECT * FROM polls WHERE shareToken = ?';
    return new Promise((resolve, reject) => {
      this.connection.query(query, [shareToken], (err, results) => {
        if (err) reject(err);
        resolve(results[0]);
      });
    });
  }

  async recordVote(vote) {
    const query = 'INSERT INTO votes (pollId, optionId, clientIP, deviceFingerprint, timestamp) VALUES (?, ?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
      this.connection.query(
        query,
        [vote.pollId, vote.optionId, vote.clientIP, vote.deviceFingerprint, vote.timestamp],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
  }
}

export default Database;

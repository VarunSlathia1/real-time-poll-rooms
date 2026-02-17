const mysql = require('mysql');

// Database connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'poll_db'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Database connected!');
});

// Method to create a new poll
const createPoll = (pollData) => {
  const { title, options } = pollData;
  const query = 'INSERT INTO polls (title, options) VALUES (?, ?)';
  connection.query(query, [title, JSON.stringify(options)], (err, result) => {
    if (err) throw err;
    console.log('Poll created with ID:', result.insertId);
  });
};

// Method to track votes
const trackVote = (pollId, option) => {
  const query = 'UPDATE polls SET votes = JSON_ARRAY_APPEND(votes, "$", ?) WHERE id = ?';
  connection.query(query, [option, pollId], (err, result) => {
    if (err) throw err;
    console.log('Vote tracked for poll ID:', pollId);
  });
};

module.exports = { createPoll, trackVote };
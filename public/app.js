// public/app.js

// Connect to the Socket.io server
const socket = io();

// Handle poll interactions
function createPoll(pollData) {
    socket.emit('create poll', pollData);
}

function vote(pollId, option) {
    socket.emit('vote', { pollId, option });
}

// Listen for updates on polls
socket.on('poll updated', (poll) => {
    // Update the poll display based on the new data
    console.log('Poll updated:', poll);
    // Update the UI accordingly...
});

// Example usage:
createPoll({ title: 'Favorite Color', options: ['Red', 'Green', 'Blue'] });
vote('pollId123', 'Blue');
// poll creation and vote validation functions

/**
 * Creates a new poll.
 * @param {string} question - The question for the poll.
 * @param {Array<string>} options - The possible options for the poll.
 * @returns {object} The created poll object.
 */
function createPoll(question, options) {
    if (!question || !options || options.length === 0) {
        throw new Error('Both question and options are required.');
    }
    return {
        id: Date.now(),  // Example ID based on timestamp
        question: question,
        options: options,
        votes: new Array(options.length).fill(0)
    };
}

/**
 * Validates a vote for the poll.
 * @param {object} poll - The poll object.
 * @param {number} optionIndex - The index of the selected option.
 * @returns {boolean} True if the vote is valid, otherwise false.
 */
function validateVote(poll, optionIndex) {
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new Error('Invalid vote option.');
    }
    return true;
}

// Example usage:
// const poll = createPoll('What is your favorite color?', ['Red', 'Green', 'Blue']);
// const isValid = validateVote(poll, 1); // True if valid, otherwise will throw an error.
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import Database from './services/database.js';
import { validatePollCreation, validateVote } from './services/validation.js';
import { checkIPReputation, checkFingerprintReputation, getFingerprintHash } from './services/antiAbuseService.js';
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] } });
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, please try again later.' });
const createPollLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many polls created, please wait before creating another.' });
app.use('/api/', apiLimiter);
const db = new Database();
await db.initialize();
app.post('/api/polls', createPollLimiter, async (req, res) => {
 try {
 const { question, options } = req.body;
 const clientIP = req.ip;
 const validation = validatePollCreation(question, options);
 if (!validation.valid) {
 return res.status(400).json({ error: validation.error });
 }
 const ipReputation = await checkIPReputation(clientIP);
 if (ipReputation.isBlacklisted) {
 return res.status(403).json({ error: 'Your IP has been blocked due to suspicious activity.' });
 }
 const pollId = uuidv4();
 const shareToken = uuidv4();
 const poll = { id: pollId, shareToken, question, options: options.map((opt, idx) => ({ id: idx, text: opt, votes: 0 })), createdAt: new Date(), createdBy: clientIP, voters: [], ipVotes: {}, fingerprintVotes: {} };
 await db.createPoll(poll);
 res.json({ pollId, shareToken, shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/poll/${shareToken}` });
 } catch (error) {
 console.error('Error creating poll:', error);
 res.status(500).json({ error: 'Failed to create poll' });
 }
});
app.get('/api/polls/:shareToken', async (req, res) => {
 try {
 const { shareToken } = req.params;
 const poll = await db.getPollByShareToken(shareToken);
 if (!poll) {
 return res.status(404).json({ error: 'Poll not found' });
 }
 const sanitizedPoll = { id: poll.id, question: poll.question, options: poll.options.map(opt => ({ id: opt.id, text: opt.text, votes: opt.votes })), createdAt: poll.createdAt, totalVotes: poll.options.reduce((sum, opt) => sum + opt.votes, 0) };
 res.json(sanitizedPoll);
 } catch (error) {
 console.error('Error fetching poll:', error);
 res.status(500).json({ error: 'Failed to fetch poll' });
 }
});
app.get('/api/ip', (req, res) => {
 res.json({ ip: req.ip });
});
io.on('connection', (socket) => {
 console.log('User connected:', socket.id);
 socket.on('vote', async (data) => {
 try {
 const { pollId, optionId, clientIP, deviceFingerprint } = data;
 const poll = await db.getPollById(pollId);
 if (!poll) {
 socket.emit('error', { message: 'Poll not found' });
 return;
 }
 const ipVoteCount = poll.ipVotes[clientIP] || 0;
 const fingerprintHash = getFingerprintHash(deviceFingerprint);
 const fingerprintVoteCount = poll.fingerprintVotes[fingerprintHash] || 0;
 if (ipVoteCount > 0 || fingerprintVoteCount > 0) {
 socket.emit('error', { message: 'You have already voted on this poll from this device.' });
 return;
 }
 const userVotes = await db.getUserRecentVotes(clientIP, 5);
 if (userVotes.length > 5) {
 const timeRemaining = Math.ceil(5 - (Date.now() - userVotes[0].timestamp) / 60000);
 socket.emit('error', { message: `Too many votes. Please try again in ${timeRemaining} minutes.` });
 return;
 }
 if (!poll.options.find(opt => opt.id === optionId)) {
 socket.emit('error', { message: 'Invalid option' });
 return;
 }
 const vote = { pollId, optionId, clientIP, deviceFingerprint: fingerprintHash, timestamp: new Date() };
 await db.recordVote(vote);
 poll.ipVotes[clientIP] = (poll.ipVotes[clientIP] || 0) + 1;
 poll.fingerprintVotes[fingerprintHash] = (poll.fingerprintVotes[fingerprintHash] || 0) + 1;
 poll.voters.push({ clientIP, timestamp: new Date() });
 const option = poll.options.find(opt => opt.id === optionId);
 option.votes++;
 io.emit(`poll:${pollId}:update`, { options: poll.options.map(opt => ({ id: opt.id, text: opt.text, votes: opt.votes })), totalVotes: poll.options.reduce((sum, opt) => sum + opt.votes, 0) });
 socket.emit('vote:success', { message: 'Vote recorded successfully' });
 } catch (error) {
 console.error('Error processing vote:', error);
 socket.emit('error', { message: 'Failed to record vote' });
 }
});
 socket.on('subscribe', (pollId) => {
 socket.join(`poll:${pollId}`);
 });
 socket.on('disconnect', () => {
 console.log('User disconnected:', socket.id);
 });
});
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});
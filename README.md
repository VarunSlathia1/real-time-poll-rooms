# Real-Time Poll Rooms

## Overview
This project provides a real-time polling system that allows users to create and participate in polls. It is designed to handle a wide range of use-cases, making it a versatile tool for gathering opinions and insights in real-time.

## Anti-Abuse Mechanisms
1. **Rate Limiting**: Each user is limited to creating a maximum number of polls within a specified time frame to prevent spam and abuse of the system.
2. **User Authentication**: Users must authenticate before they can create or participate in polls. This ensures that only registered users can interact with the system, reducing the likelihood of abuse.

## Edge Cases
- **Network Failures**: Handle scenarios where the user's internet connection is lost while submitting a poll response by saving the response locally and retrying when the connection is re-established.
- **Multiple Polls**: Ensure that simultaneous participation in multiple polls by the same user does not lead to data inconsistency.

## Limitations
- The system currently does not support anonymous voting. All votes are tied to user accounts to ensure accountability.
- Limited scalability for high-traffic polling events; may require additional infrastructure or optimization for very large audiences.

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone https://github.com/VarunSlathia1/real-time-poll-rooms.git
   cd real-time-poll-rooms
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**: Copy the example environment variable file and fill in the required information.
   ```bash
   cp .env.example .env
   ```
4. **Start the application**:
   ```bash
   npm start
   ```

## API Documentation
### Create Poll
- **Endpoint**: `/api/polls`
- **Method**: `POST`
- **Description**: Create a new poll.
- **Request Body**: 
  ```json
  {
    "question": "What is your favorite color?",
    "options": ["Red", "Blue", "Green"]
  }
  ```
- **Response**:
  ```json
  {
    "pollId": "12345",
    "status": "created"
  }
  ```

### Get Poll
- **Endpoint**: `/api/polls/:pollId`
- **Method**: `GET`
- **Description**: Retrieve poll details.
- **Response**:
  ```json
  {
    "pollId": "12345",
    "question": "What is your favorite color?",
    "options": [
       {"option": "Red", "votes": 10},
       {"option": "Blue", "votes": 20},
       {"option": "Green", "votes": 15}
    ]
  }
  ```

### Vote on Poll
- **Endpoint**: `/api/polls/:pollId/vote`
- **Method**: `POST`
- **Description**: Vote for a specific option in the poll.
- **Request Body**:
  ```json
  {
    "option": "Red"
  }
  ```
- **Response**:
  ```json
  {
    "status": "voted",
    "pollId": "12345"
  }
  ```   

# YouTube-Clone-Backend
This is a vieio series on backedn with javascript
-[Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## Project Overview

This project is a backend implementation of a YouTube-like platform. It provides core functionalities for managing users, videos, comments, likes, and subscriptions. The application is built to handle robust API interactions, ensuring scalability and reliability.

## Features

- **User Authentication and Authorization**:
    - Sign-up and login with hashed passwords.
    - Role-based access control (Admin, Creator, Viewer).

- **Video Management**:
    - Upload, update, and delete videos.
    - Stream videos efficiently.

- **Comment and Like System**:
    - Add, edit, and delete comments on videos.
    - Like and dislike functionality with counts.

- **Subscription System**:
    - Users can subscribe to channels (creators).
    - Notifications for new video uploads by subscribed channels.

- **Search and Filter**:
    - Search videos by title, description, or tags.
    - Filter videos by upload date, popularity, and category.

## Tech Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB for data storage
- **Authentication**: JSON Web Tokens (JWT)
- **Storage**: AWS S3 for video storage
- **Real-time Notifications**: Socket.IO

### Development Tools
- **Environment Management**: dotenv
- **Testing**: Jest and Supertest
- **Code Linting**: ESLint with Prettier

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/youtube-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd youtube-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=5000
   MONGO_URI=your-mongo-uri
   JWT_SECRET=your-secret-key
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_BUCKET_NAME=your-bucket-name
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### User Routes
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/users/:id`: Get user profile

### Video Routes
- `POST /api/videos`: Upload a video
- `GET /api/videos`: Fetch all videos
- `GET /api/videos/:id`: Fetch video details
- `PUT /api/videos/:id`: Update a video
- `DELETE /api/videos/:id`: Delete a video

### Comment Routes
- `POST /api/comments`: Add a comment
- `GET /api/comments/:videoId`: Fetch comments for a video
- `PUT /api/comments/:id`: Update a comment
- `DELETE /api/comments/:id`: Delete a comment

### Subscription Routes
- `POST /api/subscriptions`: Subscribe to a channel
- `DELETE /api/subscriptions/:id`: Unsubscribe from a channel

## Folder Structure

```plaintext
Backend Project/
├── .env
├── .gitignore
├── .prettie
├── .prettierignore
├── package-lock.json
├── package.json
├── public/
│   └── temp/
│       └── .gitkeep
├── Readme.md
└── src/
    ├── app.js
    ├── constants.js
    ├── index.js
    ├── controllers/
    ├── db/
    ├── middlewares/
    ├── models/
    ├── routes/
    └── utils/

```

## Future Enhancements
- Add video recommendations based on user preferences.
- Implement analytics for video views and engagement.
- Build a front-end interface to consume the APIs.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your improvements.


## Contact

For questions or collaborations, feel free to reach out:
- **Email**: your-email@example.com
- **GitHub**: [github repository profile](https://github.com/Sps9938/YouTube-Clone-Backend)

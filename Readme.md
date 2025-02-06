# YouTube-Clone-Backend
MOdel structure of Youtube-Clone-Backend
-[Model Structure (click to view)](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

# Table of contents
1. [Introduction](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Folder Structure](#folder-structure)
6. API Endpoints
   - [User Routes](#user-routes)
   - [Video Routes](#video-routes)
   - [Like Routes](#like-routes)
   - [Comment Routes](#comment-routes)
   - [Subscription Routes](#subscription-routes)
   - [Playlist Routes](#playlist-routes)
   - [Dashboard Routes](#dashboard-routes)
7. [Future Enhancements](#future-enhancements)
8. [Contributing](#contributing)
9. [Acknowledgement](#acknowledgement)
10. [Contact](#contact)



## Project-Overview

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

- **Search and Filter**:
    - Search videos by title, description.
    - Filter videos by upload date, popularity, and category.

## Tech-Stack

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB for data storage
- **Authentication**: JSON Web Tokens (JWT)
- **Storage**: Cloudinary for video storage

### Development Tools
- **Environment Management**: dotenv
- **Testing**: Postman

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

## Folder-Structure

```plaintext
Backend Project/
├── .env
├── .gitignore
├── .prettierrc
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

## API-Endpoints

### User-Routes
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/users/:id`: Get user profile
- `POST /api/users/logout`:logout user
- `POST /api/users/change-password`: update password
- `POST /api/users/forget-password`: using username or email update the  password 
- `PATCH /api/users/update-userDetails`: update user information 
- `GET /api/users/history`: Get user history 

### Video-Routes
- `POST /api/PublishAvideos`: Upload a video
- `GET /api/videos`: Fetch all videos
- `GET /api/videos/:id`: Fetch video details
- `PUT /api/videos/:id`: Update a video
- `DELETE /api/videos/:id`: Delete a video
- `PATCH /api/videos/toggle/publish/:videoId`: toggel status ->true->false, false->true

### Like-Routes
- `PATCH /api/toggle/like/:id`: like or unlike controller
- `PATCH /api/toggle/comment/like/:id`: toggle comment like
- `GET /api/comment/get/like/videos:`: Get video likes

### Comment-Routes
- `POST /api/comments`: Add a comment
- `GET /api/comments/:videoId`: Fetch comments for a video
- `PUT /api/comments/:id`: Update a comment
- `DELETE /api/comments/:id`: Delete a comment

### Subscription-Routes
- `POST /api/subscriptions`: Subscribe to a channel
- `DELETE /api/toggle/subscription/:id`: Unsubscribe from a channel

### Playlist-Routes
- `POST /api/create/playlist`: create new playlist
- `PATCH /api/update/playlist/:playlistId`: update the playlist 
- `DELETE /api/delete/playlist/:playlistId`: delete the playlist 
- `PATCH /api/add/video/:playlistid/:videoId`: add video on playlist 
- `DELETE /api/remove/:playlistId/:videoId`: remove video from playlist
- `GET /api/user/playlist/:userId`: Get user playlist

### Dashboard-Routes
- `GET /api/get-channelStats`: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
- `GET /api/get-channel-videos`: Get all the videos uploaded by the channel

## Future-Enhancements
- Add video recommendations based on user preferences.
- Implement analytics for video views and engagement.
- Build a front-end interface to consume the APIs.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your improvements.

## Acknowledgement

I would like to acknowledge and invite [Hitesh Choudhry] for their valuable guidance and support in this project. Their expertise will help improve the structure, performance, and best practices of the project.

Check out their YouTube channel for more insights and tutorials:
▶ [Chai Aur Code](https://www.youtube.com/@chaiaurcode)

## Contact

For questions or collaborations, feel free to reach out:
- **Email**: satya200prakash@gmail.com
- **GitHub**: [github repository profile](https://github.com/Sps9938/YouTube-Clone-Backend)

# YOUTUBE-CLONE-BACKEND

This is a vieio series on backedn with javascript
-[Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)


# 📌 Overview

# This is the backend of a YouTube clone built using the MERN stack. It provides RESTful APIs to handle user authentication, video uploads, comments, likes, subscriptions, and more.

# 🚀 Features

User Authentication (Signup, Login, Logout, JWT Authentication)

Video Upload & Management (CRUD operations)

Like, Dislike, Comment on Videos

Subscription System

Video Streaming Support

User Profile & Channel Management


# 🛠 Tech Stack

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT (JSON Web Tokens)

File Upload: Multer

Environment Variables: dotenv


# 📂 Folder Structure
![image Description](assets/structure.jpg)

<!-- YouTube-Clone-Backend/
│-- src/
│   ├── controllers/      # Handles business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication & other middleware
│   ├── config/           # Configuration files
│-- uploads/              # Stores uploaded files
│-- .env                  # Environment variables
│-- app.js                # controll the port (http://localhost:..../api/v1/users/controllers):
│-- index.js              # Entry point
│-- package.json          # Dependencies -->

# ⚙ Installation & Setup

1. Clone the Repository

git clone https://github.com/Sps9938/YouTube-Clone-Backend.git

cd YouTube-Clone-Backend


2. Install Dependencies

npm install


3. Create a .env File and Add:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


4. Run the Server

npm start


# VidTube 🎥  
A backend implementation of a YouTube-like platform built with **Node.js**,**Express.js**, and *MongoDB: atlas*, featuring functionalities like user authentication, video uploads, comments, likes, playlists, and more.

---

## 📂 Directory Structure

```plaintext
src/
├── controllers/          # Handles the business logic
├── db/                   # Database connection and configurations
├── middlewares/          # Custom middleware (e.g., auth, multer)
├── models/               # Database models (User, Video, Playlist, etc.)
├── routes/               # API route handlers
├── utils/                # Utility functions and error handlers
├── app.js                # Main application file
├── index.js              # Entry point of the application
├── constants.js          # Constant values used across the application
```

## 🛠 Libraries Used

- **bcrypt**: For password hashing and validation.
- **cloudinary**: For image and video upload management.
- **cookie-parser**: For parsing cookies in HTTP requests.
- **cors**: For enabling Cross-Origin Resource Sharing.
- **dotenv**: For environment variable management.
- **express**: A web framework for Node.js.
- **jsonwebtoken**: For generating and verifying JSON Web Tokens.
- **mongoose**: For interacting with MongoDB.
- **mongoose-aggregate-paginate-v2**: For pagination in Mongoose aggregation queries.
- **multer**: For handling file uploads.

## 🗂 Multer Middleware

The `multer` middleware is configured to save uploaded files to the `./public/temp` directory

## 🔒 Authentication Middleware
The `verifyJWT` middleware validates JSON Web Tokens and authenticates users

## Features

- **User Authentication:**  
  User login and registration system with JWT-based authentication.

- **Subscription System:**  
  Users can subscribe/unsubscribe to channels, and channels can fetch their subscriber lists.

- **Playlist Management:**  
  Users can create, update, and delete playlists and add/remove videos to/from playlists.

- **Likes System:**  
  Users can like/dislike videos, comments, and tweets.

- **Comments System:**  
  Users can add, fetch, update, and delete comments on videos.

- **Video Management:**  
  Features for managing video information and tracking views.

## Technologies Used

- **Node.js**
- **Express.js**
- **MongoDB (Mongoose)**
- **JWT (JSON Web Tokens)**
- **Bcrypt (for hashing passwords)**
- **Multer (for handling file uploads)**
- **Aggregation Framework in MongoDB**

## Setup Instructions

### Prerequisites

- **Node.js**
- **MongoDB**

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/video-platform-api.git
    cd video-platform-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables:

    Create a `.env` file in the root directory and add the following:

    ```makefile
    MONGO_URI=your_mongo_db_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4. Run the application:

    ```bash
    npm run dev
    ```

    The API will be available at `http://localhost:5000`.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Make changes and commit (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

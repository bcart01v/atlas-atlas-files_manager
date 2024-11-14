# File Manager API

This is a Node.js and Express-based API for managing files. It supports authentication, file and folder uploads, file retrieval, file publishing/unpublishing, and background processing for generating image thumbnails.

## Features

- User Authentication with token-based authorization
- File Upload: Supports files, images, and folders
- Background Thumbnail Generation for images with sizes (500px, 250px, 100px) using Bull and Redis
- File Retrieval: Supports direct file and thumbnail access
- File Publishing: Allows setting files as public or private
- Pagination for file lists
- MIME Type Handling: Serves files with correct MIME type using `mime-types`

## Technology Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: NoSQL database for storing users and files
- **Redis**: In-memory store for caching and background jobs
- **Bull**: Job queue for background processing
- **image-thumbnail**: Image processing for thumbnails
- **UUID**: Unique file identifiers
- **Mime-types**: MIME type handling

## Prerequisites

- **Node.js** v12.x or higher
- **npm** v6.x or higher
- **MongoDB** v4.x or higher
- **Redis** v5.x or higher

## Installation and Setup

- Clone the Repository:
  ```bash
  git clone https://github.com/bcart01v/atlas-atlas-files_manager
  cd atlas-files_manager
- Install Dependencies:
  ```bash
  npm install

## Set Up Environment Variables
Create a .env file in the root directory of the project and define the following variables:

`PORT=5005
FOLDER_PATH=/tmp/files_manager`

- Start MongoDB and Redis
Ensure MongoDB and Redis services are running locally. You can start them with:

`# Start MongoDB`
mongod

`# Start Redis`
redis-server

- Run the server
`npm run start-server`

- Run the worker
The worker processes the image thumbnail generation jobs in the background
`node worker.js`

## Api Documentation
- POST /users: Create a new user.
- GET /connect: Login a user and receive a token.
- GET /disconnect: Logout a user.

## File Management
File Management

- POST /files: Upload a new file or create a folder.
- GET /files/:id: Retrieve a file by its ID.
- GET /files: Retrieve all files for a user, with pagination.
- PUT /files/:id/publish: Set isPublic to true for a file.
- PUT /files/:id/unpublish: Set isPublic to false for a file.
- GET /files/:id/data: Retrieve the content of a file or a specific thumbnail size (supports size query parameter: 500, 250, 100).

## Authors
[Benjamin Carter](https://github.com/bcart01v)
[Jess Dison](https://github.com/jessasesh)
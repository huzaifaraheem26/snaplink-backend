# SnapLink - Backend

SnapLink Backend is a REST API built with Node.js, Express.js, MongoDB, and Mongoose. It handles URL shortening, redirection, QR code generation, click tracking, and link management.


## Features

- Create Short URL
- Redirect to Original URL
- QR Code Generation
- Click Tracking
- Duplicate URL Detection
- Get All Links
- Delete Links
- MongoDB Database

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- NanoID
- QRCode
- dotenv
- CORS

## Project Structure

```
backend/
│── config/
│── controllers/
│── models/
│── routes/
│── .env
│── server.js
│── package.json
```

## Installation

Clone the repository

```bash
git clone https://github.com/yourusername/snaplink.git
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the server

```bash
node server.js
```

or

```bash
npm start
```


## API Endpoints

### Create Short URL

```
POST /api/shorten
```

### Redirect URL

```
GET /:shortCode
```

### Get All Links

```
GET /api/links
```

### Delete Link

```
DELETE /api/links/:id
```

## Features

- URL Shortening
- QR Code Generation
- Click Counter
- Duplicate URL Check
- MongoDB Storage
- RESTful API


## Author

**Huzaifa Raheem**

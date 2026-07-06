# Fullstack Contacts Manager

Backend project for a fullstack contacts manager application.  
The project demonstrates user authentication, JWT-protected routes, MongoDB persistence, contacts CRUD, avatar upload, and basic email verification.

> This is not intended to be a production SaaS app. Its purpose is to show solid fullstack fundamentals with Node.js, Express, MongoDB, JWT auth, and REST API integration.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- Render
- JWT
- bcryptjs
- Joi
- Multer
- Jimp
- Nodemailer
- Gravatar
- Morgan
- CORS
- Dotenv

## Features

- User registration
- Email verification
- Login with JWT
- Logout
- Current user endpoint
- Protected contacts routes
- Create, read, update, and delete contacts
- Favorite contact status update
- Avatar upload and resizing
- MongoDB Atlas integration

## Project Structure

```txt
config/
  connectDB.js

helpers/
  sendEmail.js

models/
  auth.js
  contacts.js
  contactsSchema.js
  usersSchema.js

routes/
  api/
    contacts.js
    users.js

public/
  avatars/

tmp/

app.js
server.js
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/db-contacts?retryWrites=true&w=majority
SECRET_KEY=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_google_app_password
BASE_URL=https://twoj-backend.onrender.com
```

`EMAIL_PASSWORD` should be a Google App Password, not the regular Gmail account password.

## Installation

```bash
npm install
```

## Run the Server

```bash
node server.js
```

Or, if nodemon is configured:

```bash
npm run dev
```

Expected output:

```txt
Database connection successful
Server running. Use our API on port: 3000
```

## API Endpoints

Base URL:

```txt
https://twoj-backend.onrender.com
```

## Auth Routes

### Register User

```http
POST /api/users/signup
```

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "user": {
    "email": "user@example.com",
    "subscription": "starter",
    "avatarURL": "..."
  }
}
```

After registration, the server sends an email verification link.

### Verify Email

```http
GET /api/users/verify/:verificationToken
```

Response:

```json
{
  "message": "Verification successful"
}
```

### Resend Verification Email

```http
POST /api/users/verify
```

Body:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{
  "message": "Verification email sent"
}
```

### Login

```http
POST /api/users/login
```

Body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token",
  "user": {
    "email": "user@example.com",
    "subscription": "starter",
    "avatarURL": "..."
  }
}
```

### Current User

Protected route.

```http
GET /api/users/current
```

Headers:

```txt
Authorization: Bearer your_jwt_token
```

Response:

```json
{
  "email": "user@example.com",
  "subscription": "starter"
}
```

### Logout

Protected route.

```http
GET /api/users/logout
```

Headers:

```txt
Authorization: Bearer your_jwt_token
```

Response:

```txt
204 No Content
```

### Update Avatar

Protected route.

```http
PATCH /api/users/avatars
```

Headers:

```txt
Authorization: Bearer your_jwt_token
```

Form Data:

```txt
avatar: image file
```

Response:

```json
{
  "avatarURL": "/avatars/avatar-file-name.jpg"
}
```

## Contacts Routes

All contacts routes are protected and require:

```txt
Authorization: Bearer your_jwt_token
```

### Get All Contacts

```http
GET /api/contacts
```

### Get Contact by ID

```http
GET /api/contacts/:id
```

### Create Contact

```http
POST /api/contacts
```

Body:

```json
{
  "name": "Anna Kowalska",
  "email": "anna@example.com",
  "phone": "123456789",
  "favorite": false
}
```

### Update Contact

```http
PUT /api/contacts/:id
```

Body:

```json
{
  "name": "Anna Nowak",
  "email": "anna.nowak@example.com",
  "phone": "987654321",
  "favorite": true
}
```

### Update Favorite Status

```http
PATCH /api/contacts/:contactId/favorite
```

Body:

```json
{
  "favorite": true
}
```

### Delete Contact

```http
DELETE /api/contacts/:id
```

Response:

```json
{
  "message": "contact deleted"
}
```

## Testing Flow in Thunder Client

Recommended order:

```txt
1. POST /api/users/signup
2. GET /api/users/verify/:verificationToken
3. POST /api/users/login
4. GET /api/users/current
5. POST /api/contacts
6. GET /api/contacts
7. GET /api/contacts/:id
8. PUT /api/contacts/:id
9. PATCH /api/contacts/:contactId/favorite
10. DELETE /api/contacts/:id
11. GET /api/users/logout
```

## Notes

- Contacts are linked to the authenticated user through the `owner` field.
- Users must verify their email before login.
- JWT tokens are stored in the user document and checked by the auth middleware.
- Uploaded avatars are resized to 250x250 and stored in `public/avatars`.

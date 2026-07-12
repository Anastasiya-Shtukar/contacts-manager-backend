# Contacts Manager Backend

REST API for a fullstack contacts manager application.  
The project provides user authentication, email verification, JWT-protected routes, MongoDB persistence, contacts CRUD, and avatar upload.

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
- Brevo Transactional Email API
- Gravatar
- Morgan
- CORS
- Dotenv

## Features

- User registration
- Email verification through Brevo
- Login with JWT
- Logout
- Current user endpoint
- Protected contacts routes
- Create, read, update, and delete contacts
- Favorite contact status update
- Avatar upload and resizing
- MongoDB Atlas integration
- Registration rollback when a verification email cannot be sent

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
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=your_verified_brevo_sender@example.com
BASE_URL=https://contacts-manager-backend-q2pb.onrender.com
FRONTEND_URL=https://your-frontend.example.com
```

- `DB_URI` is the MongoDB connection string.
- `SECRET_KEY` is used to sign JWT access tokens.
- `BREVO_API_KEY` must be generated in Brevo under **Settings → SMTP & API → API Keys**.
- `EMAIL_FROM` must match a verified sender in Brevo under **Settings → Senders, domains, IPs → Senders**.
- `BASE_URL` is used to build email verification links and should not end with `/`.
- `FRONTEND_URL` is the deployed frontend address and should not end with `/`. After email verification, the user is redirected to its `/login` page.

Never commit `.env` or expose API keys in source code, screenshots, logs, or documentation. Add the same environment variables to the deployed Render service under **Environment**.

## Installation

```bash
npm install
```

## Run the Server

```bash
node server.js
```

Development mode with Nodemon:

```bash
npm run start:dev
```

Production mode:

```bash
npm start
```

Expected output:

```txt
Database connection successful
Server running. Use our API on port: 3000
```

## API Endpoints

Base URL:

```txt
https://contacts-manager-backend-q2pb.onrender.com
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

After registration, the server sends a verification link using the Brevo Transactional Email API. If sending fails, the newly created database record is removed so that registration can be attempted again.

### Verify Email

```http
GET /api/users/verify/:verificationToken
```

On success, the endpoint redirects to:

```txt
FRONTEND_URL/login?verified=true
```

An invalid token redirects with `verified=false`, while an unexpected verification error redirects with `verified=error`. If `FRONTEND_URL` is not configured, the endpoint returns its original JSON response instead.

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
- Accepted avatar formats are JPEG, PNG, and WebP, with a maximum size of 5 MB.
- Brevo is accessed through its HTTPS API, which works on Render services where outbound SMTP ports can be unavailable.
- Files stored on Render's ephemeral filesystem can be lost after a restart or redeploy. For persistent production avatars, use object storage such as Cloudinary or Amazon S3.

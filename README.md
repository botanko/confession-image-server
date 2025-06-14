# Confession Image Generator Server

A Node.js backend service that generates confession images with exact styling matching the Android app.

## Features
- ✅ Exact dimension matching (1080x1080 square, 1080x1350 vertical)
- ✅ Dynamic font sizing based on text length
- ✅ Proper text wrapping and centering
- ✅ Timestamp in bottom-right corner
- ✅ Dark background (#1a1a1a) with white text
- ✅ Margins and spacing matching Android app logic

## API Endpoint

### POST /generate-confession-image

**Request Body:**
```json
{
  "confessionText": "Your confession text here...",
  "timestamp": "2024-01-15 10:30 AM"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Deployment

This service is designed to be deployed on free hosting platforms like Render.

### Deploy to Render:
1. Push this code to GitHub
2. Connect GitHub repo to Render
3. Deploy as Web Service with Node runtime
4. Use `npm start` as start command

### Health Check
- GET `/health` - Returns server status

## Local Development

```bash
npm install
npm run dev
```

Server runs on port 3000 (or PORT environment variable).

# Confession Image Generator API

A serverless API deployed on Vercel that generates confession images matching the Android app's exact styling.

## Features
- ✅ Exact dimension matching (1080x1080 square, 1080x1350 vertical)
- ✅ Dynamic font sizing based on text length
- ✅ Proper text wrapping and centering
- ✅ Timestamp in bottom-right corner
- ✅ Dark background (#1a1a1a) with white text
- ✅ Margins and spacing matching Android app logic

## API Endpoints

### GET /api/generate-image
Health check endpoint
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Confession Image Generator on Vercel"
}
```

### POST /api/generate-image
Generate confession image
**Request:**
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

## Deployment Instructions

1. **Fork/Clone this repository**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Deploy automatically
3. **Get your API URL:** `https://your-app-name.vercel.app`

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/api/generate-image` for health check.

## Usage in Google Apps Script

Update your CONFIG:
```javascript
const CONFIG = {
  IMAGE_SERVER_URL: 'https://your-app-name.vercel.app'
};
```

## Vercel Free Tier
- 100GB bandwidth/month
- 1M function invocations/month
- 10 second max execution time
- No credit card required

Perfect for confession automation needs!

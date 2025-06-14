# 🖼️ Confession Image Generator API

A serverless API deployed on Vercel that generates Instagram-ready confession images with perfect styling.

## 🚀 Features

- **Instagram Compatible**: Direct URLs that work with Instagram's API
- **Android App Styling**: Matches the exact design from the mobile app
- **Automatic Text Sizing**: Adjusts font size based on content length
- **Fast Generation**: Under 3 seconds typical response time
- **Free Hosting**: Runs on Vercel's free tier

## 📡 API Endpoints

### `POST /api/generate-image`
Generates a confession image and returns both base64 and direct URL.

**Request:**
```json
{
  "confessionText": "Your confession text here...",
  "timestamp": "6/15/2025 3:29:55"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "imageUrl": "https://your-app.vercel.app/api/image/1623456789_abc123",
  "imageId": "1623456789_abc123",
  "timestamp": "2025-06-15T08:29:55.000Z"
}
```

### `GET /api/image/[id]`
Serves images directly for Instagram and other platforms.

**Example:** `https://your-app.vercel.app/api/image/1623456789_abc123`

**Response:** Direct PNG image file

### `GET /api/generate-image`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-06-15T08:29:55.000Z",
  "service": "Confession Image Generator on Vercel"
}
```

## 🎨 Image Specifications

- **Dimensions:** 1080x1080px (square) or 1080x1350px (portrait)
- **Background:** Dark gradient (#1a1a1a to #2d2d2d)
- **Text:** White (#ffffff) with automatic sizing
- **Font:** Arial/Helvetica system fonts
- **Timestamp:** Bottom-right corner
- **Format:** PNG with transparency support

## 🔧 Instagram Integration

This API solves the "Media download has failed" error by providing direct image URLs that meet Instagram's requirements:

✅ **Direct HTTP/HTTPS URLs**  
✅ **Publicly accessible**  
✅ **Proper Content-Type headers**  
✅ **No authentication required**  
✅ **Fast response times**

## 🚀 Deployment

See `VERCEL_DEPLOYMENT_STEPS.md` for complete deployment instructions.

## 🔄 Usage with Google Apps Script

```javascript
const response = UrlFetchApp.fetch('https://your-app.vercel.app/api/generate-image', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  payload: JSON.stringify({
    confessionText: 'Your confession here...',
    timestamp: '6/15/2025 3:29:55'
  })
});

const result = JSON.parse(response.getContentText());
const instagramImageUrl = result.imageUrl; // Use this for Instagram!
```

## 📈 Performance

- **Cold start:** ~2-3 seconds
- **Warm requests:** <1 second  
- **Concurrent requests:** Auto-scales
- **Uptime:** 99.9% (Vercel SLA)

## 💰 Cost

Completely **FREE** on Vercel's hobby plan:
- 1M function invocations/month
- 100GB bandwidth/month
- More than enough for confession automation!

---

Ready to deploy? Follow the deployment guide and fix your Instagram integration! 🎉

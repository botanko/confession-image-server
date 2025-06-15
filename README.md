# 🔥 Confession Image Generator API

A serverless image generation service for confession posts, deployed on Vercel using Puppeteer for high-quality image rendering.

## 🚀 Features

- **High-Quality Images**: Generates 1080x1080 or 1080x1350 images optimized for Instagram
- **Dynamic Font Sizing**: Automatically adjusts font size based on text length
- **Smart Text Wrapping**: Handles long confessions with proper line spacing
- **Timestamp Support**: Formats and displays submission timestamps
- **Serverless**: Deployed on Vercel for fast, scalable performance
- **Base64 Output**: Returns images as base64 for direct use

## 📋 API Endpoints

### Health Check
```
GET /api/generate-image
```
Returns API status and version information.

### Generate Image
```
POST /api/generate-image
```
Generate a confession image.

**Request Body:**
```json
{
  "confessionText": "Your confession text here...",
  "timestamp": "6/15/2025 14:30:45" // optional
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "timestamp": "2025-06-15T14:30:45.123Z",
  "confessionLength": 150
}
```

### Test Page
```
GET /api/test-image
```
Interactive test page for trying the image generation.

## 🛠️ Deployment

### Prerequisites
- Node.js 18+
- Vercel CLI
- Git repository

### Quick Deploy

1. **Clone or navigate to the vercel-api folder:**
   ```bash
   cd vercel-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

   Or use the provided batch script on Windows:
   ```bash
   deploy.bat
   ```

4. **Update your Google Apps Script:**
   Update the `IMAGE_SERVER_URL` in your config to your new Vercel URL:
   ```javascript
   IMAGE_SERVER_URL: 'https://your-app-name.vercel.app'
   ```

## 🧪 Testing

After deployment, test your API:

1. **Health Check:**
   ```bash
   curl https://your-app-name.vercel.app/api/generate-image
   ```

2. **Generate Test Image:**
   ```bash
   curl -X POST https://your-app-name.vercel.app/api/generate-image \
     -H "Content-Type: application/json" \
     -d '{"confessionText": "Test confession for image generation"}'
   ```

3. **Interactive Test:**
   Visit `https://your-app-name.vercel.app/api/test-image`

## 🔧 Configuration

### Vercel Settings
- **Node.js Version**: 18.x
- **Function Timeout**: 30 seconds
- **Memory**: 512 MB
- **Region**: iad1 (US East)

### Environment Variables
No environment variables required - the API works out of the box.

## 📐 Image Specifications

### Dimensions
- **Square**: 1080x1080px (for short confessions ≤120 chars)
- **Vertical**: 1080x1350px (for longer confessions)

### Text Formatting
- **Font**: Arial
- **Colors**: White text on #1a1a1a background
- **Margins**: Dynamic based on text length (60-120px)
- **Font Size**: Dynamic (20-96px based on content)

### Timestamp
- **Position**: Bottom-right corner
- **Format**: "Submitted M/D/YY, H:MM AM/PM"
- **Font Size**: 22px
- **Opacity**: 70%

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to generate image" error:**
   - Check Vercel function logs
   - Ensure text is not too long (>2000 characters)
   - Verify Puppeteer is working in Vercel environment

2. **Timeout errors:**
   - Check if function timeout is sufficient (30s)
   - Monitor memory usage (512MB should be enough)

3. **Image not displaying:**
   - Verify base64 output is complete
   - Check for CORS issues
   - Ensure proper image format (PNG)

### Logs
Check Vercel function logs:
```bash
npx vercel logs
```

## 🔗 Integration

### Google Apps Script
Update your Google Apps Script configuration:

```javascript
const CONFIG = {
  IMAGE_SERVER_URL: 'https://your-app-name.vercel.app',
  // ... other config
};
```

The existing `generateImageWithBackendServer()` function will automatically use your new Vercel API.

## 📱 Mobile Compatibility

The generated images are optimized for:
- Instagram posts (square and vertical formats)
- Mobile viewing and sharing
- High-resolution displays

## 🆘 Support

If you encounter issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review function logs in Vercel dashboard
3. Test with the interactive test page
4. Ensure your Google Apps Script is pointing to the correct URL

---

Built with ❤️ for confession automation using Vercel and Puppeteer.
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

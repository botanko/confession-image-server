export default function handler(req, res) {
  // Simple homepage showing the API is working
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confession Image Generator API</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #0f0f0f;
            color: #ffffff;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #00ff88;
        }
        .subtitle {
            color: #888;
            font-size: 1.1em;
        }
        .status {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #00ff88;
        }
        .endpoint {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            font-family: monospace;
        }
        .method {
            color: #00ff88;
            font-weight: bold;
        }
        .success {
            color: #00ff88;
        }
        .code {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-family: monospace;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
        }
        a {
            color: #00ff88;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎭 Confession Image Generator</div>
        <div class="subtitle">Serverless API for confession image generation</div>
    </div>

    <div class="status">
        <h2>✅ <span class="success">Deployment Successful!</span></h2>
        <p>Your Vercel deployment is working correctly. The API is ready to generate confession images that match your Android app's styling.</p>
        <p><strong>Deployed:</strong> ${new Date().toISOString()}</p>
        <p><strong>Status:</strong> <span class="success">Online</span></p>
    </div>

    <h2>🔗 API Endpoints</h2>
    
    <div class="endpoint">
        <div><span class="method">GET</span> /api/generate-image</div>
        <div>Health check endpoint</div>
    </div>
    
    <div class="endpoint">
        <div><span class="method">POST</span> /api/generate-image</div>
        <div>Generate confession image</div>
    </div>

    <h2>📝 Usage Example</h2>
    <div class="code">
POST /api/generate-image
Content-Type: application/json

{
  "confessionText": "Your confession text here...",
  "timestamp": "2024-01-15 10:30 AM"
}
    </div>

    <h2>🎯 Next Steps</h2>
    <ol>
        <li>Copy this URL: <code>${req.headers.host ? `https://${req.headers.host}` : 'https://your-app.vercel.app'}</code></li>
        <li>Update your Google Apps Script CONFIG:</li>
    </ol>
    <div class="code">
const CONFIG = {
  // ...other settings...
  IMAGE_SERVER_URL: '${req.headers.host ? `https://${req.headers.host}` : 'https://your-app.vercel.app'}'
};
    </div>
    <ol start="3">
        <li>Test with: <code>testBackendServerHealth()</code></li>
        <li>Generate images with: <code>testBackendServerImageGeneration()</code></li>
    </ol>

    <h2>🚀 Features</h2>
    <ul>
        <li>✅ Exact Android app styling match</li>
        <li>✅ Dynamic font sizing</li>
        <li>✅ Proper text wrapping</li>
        <li>✅ Timestamp in bottom-right</li>
        <li>✅ Optimal dimensions (1080x1080, 1080x1350)</li>
        <li>✅ Free hosting on Vercel</li>
    </ul>

    <div class="footer">
        <p>Powered by <a href="https://vercel.com" target="_blank">Vercel</a> • Built for confession automation</p>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

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
        .test-button {
            background: #00ff88;
            color: #000;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin: 10px 5px;
        }
        .test-button:hover {
            background: #00cc66;
        }
        .test-results {
            background: #1a1a1a;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            min-height: 100px;
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
        <p><strong>Your API URL:</strong> <code>${req.headers.host ? `https://${req.headers.host}` : 'https://your-app.vercel.app'}</code></p>
    </div>

    <h2>🔗 API Endpoints</h2>
    
    <div class="endpoint">
        <div><span class="method">GET</span> /api/generate-image</div>
        <div>Health check endpoint</div>
        <button class="test-button" onclick="testHealthCheck()">Test Health Check</button>
    </div>
    
    <div class="endpoint">
        <div><span class="method">POST</span> /api/generate-image</div>
        <div>Generate confession image</div>
        <button class="test-button" onclick="testImageGeneration()">Test Image Generation</button>
    </div>

    <div id="testResults" class="test-results" style="display: none;">
        <h3>Test Results:</h3>
        <pre id="resultText"></pre>
    </div>

    <h2>🎯 Next Steps</h2>
    <ol>
        <li><strong>Copy this URL:</strong> <code>${req.headers.host ? `https://${req.headers.host}` : 'https://your-app.vercel.app'}</code></li>
        <li><strong>Update your Google Apps Script CONFIG:</strong></li>
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
        <li>✅ Dynamic font sizing based on text length</li>
        <li>✅ Proper text wrapping and centering</li>
        <li>✅ Timestamp in bottom-right corner</li>
        <li>✅ Optimal Instagram dimensions (1080x1080, 1080x1350)</li>
        <li>✅ Dark background (#1a1a1a) with white text</li>
        <li>✅ Free hosting on Vercel</li>
    </ul>

    <div class="footer">
        <p>Powered by <a href="https://vercel.com" target="_blank">Vercel</a> • Built for confession automation</p>
    </div>

    <script>
        async function testHealthCheck() {
            const resultDiv = document.getElementById('testResults');
            const resultText = document.getElementById('resultText');
            
            resultDiv.style.display = 'block';
            resultText.textContent = 'Testing health check...';
            
            try {
                const response = await fetch('/api/generate-image');
                const data = await response.json();
                resultText.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                resultText.textContent = 'Error: ' + error.message;
            }
        }

        async function testImageGeneration() {
            const resultDiv = document.getElementById('testResults');
            const resultText = document.getElementById('resultText');
            
            resultDiv.style.display = 'block';
            resultText.textContent = 'Testing image generation...';
            
            try {
                const response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        confessionText: 'This is a test confession to verify the API is working correctly!',
                        timestamp: new Date().toLocaleString()
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    resultText.textContent = 'Success! Image generated. Size: ' + Math.round(data.image.length / 1024) + ' KB';
                } else {
                    resultText.textContent = 'Error: ' + (data.error || 'Unknown error');
                }
            } catch (error) {
                resultText.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}

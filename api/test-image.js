// Test endpoint for the confession image generator
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return a simple test page
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Confession Image Generator Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .test-form { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a8a; }
        .result { margin: 20px 0; padding: 20px; background: #e8f4f8; border-radius: 8px; }
        .error { background: #ffebee; color: #c62828; }
        img { max-width: 100%; height: auto; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>🔥 Confession Image Generator Test</h1>
    <p>Test the image generation API with a sample confession.</p>
    
    <div class="test-form">
        <h3>Test Image Generation</h3>
        <textarea id="confessionText" placeholder="Enter confession text here...">This is a test confession to check if the image generation is working properly on Vercel. If you can see this text as an image, then everything is working correctly!</textarea>
        <br>
        <input type="text" id="timestamp" placeholder="Timestamp (optional)" value="6/15/2025 14:30:45" style="width: 200px;">
        <br><br>
        <button onclick="testImageGeneration()">Generate Test Image</button>
    </div>
    
    <div id="result"></div>
    
    <script>
        async function testImageGeneration() {
            const confessionText = document.getElementById('confessionText').value;
            const timestamp = document.getElementById('timestamp').value;
            const resultDiv = document.getElementById('result');
            
            if (!confessionText.trim()) {
                resultDiv.innerHTML = '<div class="result error">Please enter some confession text</div>';
                return;
            }
            
            resultDiv.innerHTML = '<div class="result">Generating image... Please wait.</div>';
            
            try {
                const response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        confessionText: confessionText,
                        timestamp: timestamp
                    })
                });
                
                const data = await response.json();
                
                if (data.success && data.image) {
                    resultDiv.innerHTML = \`
                        <div class="result">
                            <h3>✅ Image Generated Successfully!</h3>
                            <p><strong>Confession Length:</strong> \${data.confessionLength} characters</p>
                            <p><strong>Generated at:</strong> \${data.timestamp}</p>
                            <img src="\${data.image}" alt="Generated confession image" />
                            <br><br>
                            <p><strong>Base64 Data:</strong></p>
                            <textarea readonly style="width: 100%; height: 100px; font-size: 10px;">\${data.image}</textarea>
                        </div>
                    \`;
                } else {
                    resultDiv.innerHTML = \`
                        <div class="result error">
                            <h3>❌ Error Generating Image</h3>
                            <p>\${data.error || 'Unknown error'}</p>
                            \${data.details ? \`<p><strong>Details:</strong> \${data.details}</p>\` : ''}
                        </div>
                    \`;
                }
            } catch (error) {
                resultDiv.innerHTML = \`
                    <div class="result error">
                        <h3>❌ Network Error</h3>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
// Alternative Vercel Serverless Function using HTML Canvas (no external dependencies)
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check endpoint
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'Confession Image Generator (HTML Canvas)',
      version: '2.2.0',
      method: 'HTML Canvas API'
    });
  }

  // Main image generation endpoint
  if (req.method === 'POST') {
    try {
      const { confessionText, timestamp } = req.body;
      
      if (!confessionText) {
        return res.status(400).json({ error: 'confessionText is required' });
      }
      
      console.log('🚀 Generating image for confession:', confessionText.substring(0, 50) + '...');
      
      // Generate HTML with canvas that will be rendered client-side
      const htmlWithCanvas = generateCanvasHTML(confessionText, timestamp);
      
      return res.status(200).json({
        success: true,
        html: htmlWithCanvas,
        timestamp: new Date().toISOString(),
        confessionLength: confessionText.length,
        message: 'HTML Canvas generated - render client-side to get image'
      });
      
    } catch (error) {
      console.error('❌ Error generating HTML canvas:', error);
      return res.status(500).json({ 
        error: 'Failed to generate HTML canvas',
        details: error.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function generateCanvasHTML(confessionText, timestamp) {
  const dimensions = determineOptimalDimensions(confessionText);
  const effectiveMargin = calculateEffectiveMargin(confessionText);
  const fontSize = determineFontSize(confessionText, dimensions);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; font-family: Arial, sans-serif; }
        .container { text-align: center; }
        canvas { border: 1px solid #ccc; background: #1a1a1a; }
        .controls { margin: 20px 0; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        #downloadLink { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🔥 Confession Image Generator</h2>
        <canvas id="confessionCanvas" width="${dimensions.width}" height="${dimensions.height}"></canvas>
        <div class="controls">
            <button onclick="generateImage()">Generate Image</button>
            <button onclick="downloadImage()">Download PNG</button>
            <a id="downloadLink" download="confession.png">Download</a>
        </div>
        <div id="base64Output" style="margin-top: 20px; word-break: break-all; font-family: monospace; font-size: 10px; max-height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; background: #f9f9f9;"></div>
    </div>

    <script>
        const canvas = document.getElementById('confessionCanvas');
        const ctx = canvas.getContext('2d');
        const confessionText = ${JSON.stringify(confessionText)};
        const timestamp = ${JSON.stringify(timestamp)};
        const dimensions = ${JSON.stringify(dimensions)};
        const effectiveMargin = ${effectiveMargin};
        const fontSize = ${fontSize};

        function generateImage() {
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, dimensions.width, dimensions.height);
            
            // Set text properties
            ctx.fillStyle = '#ffffff';
            ctx.font = fontSize + 'px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // Calculate text area
            const textAreaWidth = dimensions.width - (effectiveMargin * 2);
            const centerX = dimensions.width / 2;
            
            // Wrap text
            const lines = wrapText(ctx, confessionText, textAreaWidth);
            
            // Calculate line spacing
            const lineSpacing = calculateLineSpacing(confessionText.length, fontSize);
            
            // Calculate total text height
            const totalTextHeight = (lines.length * fontSize) + ((lines.length - 1) * lineSpacing);
            
            // Calculate vertical centering
            const availableHeight = dimensions.height - (effectiveMargin * 2);
            const textY = effectiveMargin + Math.max(0, (availableHeight - totalTextHeight) / 2);
            
            // Draw each line
            lines.forEach((line, index) => {
                const y = textY + (index * (fontSize + lineSpacing));
                ctx.fillText(line, centerX, y);
            });
            
            // Draw timestamp if provided
            if (timestamp) {
                drawTimestamp(ctx, timestamp, dimensions);
            }
            
            // Show base64 output
            const base64 = canvas.toDataURL('image/png');
            document.getElementById('base64Output').textContent = base64;
            
            // Setup download
            document.getElementById('downloadLink').href = base64;
        }

        function downloadImage() {
            const link = document.getElementById('downloadLink');
            link.click();
        }

        function wrapText(ctx, text, maxWidth) {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            for (let i = 0; i < words.length; i++) {
                const testLine = currentLine + words[i] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && i > 0) {
                    lines.push(currentLine.trim());
                    currentLine = words[i] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            
            return lines;
        }

        function calculateLineSpacing(textLength, fontSize) {
            if (textLength > 1500) {
                return fontSize * 0.05;
            } else if (textLength > 800) {
                return fontSize * 0.1;
            } else {
                return fontSize * 0.15;
            }
        }

        function drawTimestamp(ctx, timestamp, dimensions) {
            const formattedTimestamp = formatTimestamp(timestamp);
            const timestampFontSize = 22;
            const paddingFromEdge = 20;
            
            ctx.font = timestampFontSize + 'px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            const timestampX = dimensions.width - paddingFromEdge;
            const timestampY = dimensions.height - paddingFromEdge;
            
            ctx.fillText(formattedTimestamp, timestampX, timestampY);
        }

        function formatTimestamp(timestamp) {
            try {
                const dateTimeRegex = /(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})\\s+(\\d{1,2}):(\\d{2}):(\\d{2})/;
                const match = timestamp.match(dateTimeRegex);
                
                if (match) {
                    const [, month, day, year, hour, minute] = match;
                    const shortYear = year.slice(-2);
                    const hourInt = parseInt(hour);
                    
                    let displayHour, amPm;
                    if (hourInt === 0) {
                        displayHour = 12;
                        amPm = "AM";
                    } else if (hourInt < 12) {
                        displayHour = hourInt;
                        amPm = "AM";
                    } else if (hourInt === 12) {
                        displayHour = 12;
                        amPm = "PM";
                    } else {
                        displayHour = hourInt - 12;
                        amPm = "PM";
                    }
                    
                    return \`Submitted \${month}/\${day}/\${shortYear}, \${displayHour}:\${minute} \${amPm}\`;
                }
                
                return \`Submitted \${timestamp}\`;
            } catch (error) {
                return \`Submitted \${timestamp}\`;
            }
        }

        // Auto-generate on load
        generateImage();
    </script>
</body>
</html>`;
}

function determineOptimalDimensions(text) {
  const charCount = text.length;
  const wordCount = text.split(/\\s+/).length;
  
  const SQUARE_SIZE = 1080;
  const VERTICAL_WIDTH = 1080;
  const VERTICAL_HEIGHT = 1350;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  
  if (charCount > VERY_LONG_TEXT_THRESHOLD) {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  } else if (charCount <= 120 && wordCount <= 20) {
    return { width: SQUARE_SIZE, height: SQUARE_SIZE, ratio: "square" };
  } else {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  }
}

function calculateEffectiveMargin(text) {
  const MARGIN = 120;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  const EXTREME_TEXT_THRESHOLD = 1500;
  
  if (text.length > EXTREME_TEXT_THRESHOLD) {
    return 60;
  } else if (text.length > VERY_LONG_TEXT_THRESHOLD) {
    return 80;
  } else {
    return MARGIN;
  }
}

function determineFontSize(text, dimensions) {
  const charCount = text.length;
  const MIN_FONT_SIZE = 20;
  const MAX_FONT_SIZE = 96;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  const EXTREME_TEXT_THRESHOLD = 1500;
  
  if (charCount > EXTREME_TEXT_THRESHOLD) {
    return 48;
  } else if (charCount > VERY_LONG_TEXT_THRESHOLD) {
    return 64;
  } else if (charCount > 400) {
    return 72;
  } else if (charCount > 200) {
    return 80;
  } else {
    return MAX_FONT_SIZE;
  }
}

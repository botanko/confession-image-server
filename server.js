const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main image generation endpoint
app.post('/generate-confession-image', async (req, res) => {
  try {
    const { confessionText, timestamp } = req.body;
    
    if (!confessionText) {
      return res.status(400).json({ error: 'confessionText is required' });
    }
    
    console.log('Generating image for confession:', confessionText.substring(0, 50) + '...');
    
    // Generate image using exact Android logic
    const imageBuffer = await generateConfessionImage(confessionText, timestamp);
    
    // Return image as base64
    const base64Image = imageBuffer.toString('base64');
    
    res.json({
      success: true,
      image: `data:image/png;base64,${base64Image}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
});

async function generateConfessionImage(confessionText, timestamp) {
  // Calculate dimensions exactly like your Android app
  const dimensions = determineOptimalDimensions(confessionText);
  const effectiveMargin = calculateEffectiveMargin(confessionText);
  const fontSize = determineFontSize(confessionText);
  
  console.log('Image dimensions:', dimensions);
  console.log('Font size:', fontSize);
  console.log('Margin:', effectiveMargin);
  
  // Create canvas with exact dimensions
  const canvas = createCanvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext('2d');
  
  // Set background color (exact match to your #1a1a1a)
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  
  // Set text properties
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate text area
  const textAreaWidth = dimensions.width - (effectiveMargin * 2);
  const textAreaHeight = dimensions.height - (effectiveMargin * 2);
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  
  // Word wrap and draw confession text
  const lines = wrapText(ctx, confessionText, textAreaWidth, fontSize);
  const lineHeight = fontSize * 1.4; // Line spacing
  const totalTextHeight = lines.length * lineHeight;
  const startY = centerY - (totalTextHeight / 2);
  
  // Draw each line
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight);
    ctx.fillText(line, centerX, y);
  });
  
  // Draw timestamp in bottom-right corner (exactly like your Android app)
  if (timestamp) {
    const timestampFontSize = 22; // Matching your timestampPaint.textSize
    const paddingFromEdge = 20;
    
    ctx.font = `${timestampFontSize}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Matching your alpha 180
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    
    const timestampX = dimensions.width - paddingFromEdge;
    const timestampY = dimensions.height - paddingFromEdge;
    
    ctx.fillText(timestamp, timestampX, timestampY);
  }
  
  return canvas.toBuffer('image/png');
}

function determineOptimalDimensions(text) {
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  
  // Instagram dimensions (matching your exact constants)
  const SQUARE_SIZE = 1080;
  const VERTICAL_WIDTH = 1080;
  const VERTICAL_HEIGHT = 1350;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  
  // Matching your exact dimension logic from ImageGenerator.kt
  if (charCount > VERY_LONG_TEXT_THRESHOLD) {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  } else if (charCount <= 120 && wordCount <= 20) {
    return { width: SQUARE_SIZE, height: SQUARE_SIZE, ratio: "square" };
  } else if (charCount <= 400 && wordCount <= 60) {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  } else if (charCount <= VERY_LONG_TEXT_THRESHOLD) {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  } else {
    return { width: VERTICAL_WIDTH, height: VERTICAL_HEIGHT, ratio: "vertical" };
  }
}

function calculateEffectiveMargin(text) {
  const MARGIN = 120; // Matching your exact value
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

function determineFontSize(text) {
  const charCount = text.length;
  
  // Font sizing logic matching your ImageGenerator.kt
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

function wrapText(ctx, text, maxWidth, fontSize) {
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Confession Image Generator Server running on port ${PORT}`);
  console.log(`📷 Generate images at: POST /generate-confession-image`);
  console.log(`❤️  Health check at: GET /health`);
});

module.exports = app;

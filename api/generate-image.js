// Vercel Serverless Function for generating confession images
import chromium from 'chrome-aws-lambda';

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
      service: 'Confession Image Generator on Vercel',
      version: '2.0.0'
    });
  }

  // Main image generation endpoint
  if (req.method === 'POST') {
    let browser = null;
    
    try {
      const { confessionText, timestamp } = req.body;
      
      if (!confessionText) {
        return res.status(400).json({ error: 'confessionText is required' });
      }
      
      console.log('🚀 Generating image for confession:', confessionText.substring(0, 50) + '...');
      
      // Launch browser
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();
      
      // Generate image using HTML/CSS/Canvas approach
      const imageBuffer = await generateConfessionImageWithPuppeteer(page, confessionText, timestamp);
      
      // Convert to base64
      const base64Image = imageBuffer.toString('base64');
      
      console.log('✅ Image generated successfully');
      
      return res.status(200).json({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        timestamp: new Date().toISOString(),
        confessionLength: confessionText.length
      });
      
    } catch (error) {
      console.error('❌ Error generating image:', error);
      return res.status(500).json({ 
        error: 'Failed to generate image',
        details: error.message,
        stack: error.stack
      });
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function generateConfessionImageWithPuppeteer(page, confessionText, timestamp) {
  // Calculate dimensions exactly like your Android app
  const dimensions = determineOptimalDimensions(confessionText);
  const effectiveMargin = calculateEffectiveMargin(confessionText);
  const fontSize = determineFontSize(confessionText, dimensions, effectiveMargin);
  
  console.log('📐 Image dimensions:', dimensions);
  console.log('🔤 Font size:', fontSize);
  console.log('📏 Margin:', effectiveMargin);
  
  // Create HTML with inline CSS that matches your Android app exactly
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: ${dimensions.width}px;
      height: ${dimensions.height}px;
      background-color: #1a1a1a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
      position: relative;
      overflow: hidden;
    }
    
    .confession-container {
      width: ${dimensions.width - (effectiveMargin * 2)}px;
      height: ${dimensions.height - (effectiveMargin * 2)}px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
    }
    
    .confession-text {
      color: #ffffff;
      font-size: ${fontSize}px;
      line-height: ${calculateLineHeight(confessionText, fontSize)};
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
      max-height: 100%;
    }
    
    .timestamp {
      position: absolute;
      bottom: 20px;
      right: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 22px;
      font-family: Arial, sans-serif;
    }
  </style>
</head>
<body>
  <div class="confession-container">
    <div class="confession-text">${escapeHtml(confessionText)}</div>
  </div>
  ${timestamp ? `<div class="timestamp">${escapeHtml(formatTimestamp(timestamp))}</div>` : ''}
</body>
</html>`;

  // Set viewport and navigate to the HTML
  await page.setViewport({ 
    width: dimensions.width, 
    height: dimensions.height,
    deviceScaleFactor: 1
  });
  
  await page.setContent(html);
  
  // Wait for fonts to load
  await page.waitForTimeout(500);
  
  // Take screenshot
  const imageBuffer = await page.screenshot({
    type: 'png',
    fullPage: true,
    omitBackground: false
  });
  
  return imageBuffer;
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

function determineFontSize(text, dimensions, margin) {
  const charCount = text.length;
  
  // Font sizing logic matching your ImageGenerator.kt
  const MIN_FONT_SIZE = 20;
  const MAX_FONT_SIZE = 96;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  const EXTREME_TEXT_THRESHOLD = 1500;
  
  // Start with base size based on character count
  let fontSize;
  if (charCount > EXTREME_TEXT_THRESHOLD) {
    fontSize = 48;
  } else if (charCount > VERY_LONG_TEXT_THRESHOLD) {
    fontSize = 64;
  } else if (charCount > 400) {
    fontSize = 72;
  } else if (charCount > 200) {
    fontSize = 80;
  } else {
    fontSize = MAX_FONT_SIZE;
  }
  
  // Ensure font size fits within constraints
  const maxWidth = dimensions.width - (margin * 2);
  const maxHeight = dimensions.height - (margin * 2);
  
  // Estimate if text will fit (rough calculation)
  const estimatedLines = Math.ceil(charCount / (maxWidth / (fontSize * 0.6)));
  const estimatedHeight = estimatedLines * fontSize * calculateLineHeight(text, fontSize);
  
  if (estimatedHeight > maxHeight && fontSize > MIN_FONT_SIZE) {
    fontSize = Math.max(MIN_FONT_SIZE, Math.floor(fontSize * 0.8));
  }
  
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, fontSize));
}

function calculateLineHeight(text, fontSize) {
  // Line spacing logic matching your Android app
  const EXTREME_TEXT_THRESHOLD = 1500;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  
  let lineHeightMultiplier;
  if (text.length > EXTREME_TEXT_THRESHOLD) {
    lineHeightMultiplier = 1.05; // Minimal spacing for extreme text
  } else if (text.length > VERY_LONG_TEXT_THRESHOLD) {
    lineHeightMultiplier = 1.1; // Tighter spacing for very long text
  } else {
    lineHeightMultiplier = 1.15; // Normal spacing
  }
  
  return `${lineHeightMultiplier}`;
}

function formatTimestamp(timestamp) {
  try {
    // Handle various timestamp formats exactly like Android
    let formattedDate = timestamp;
    
    // Handle formats like "12/7/2024 10:30:45" or "6/8/2025 15:48:30"
    const dateTimeRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/;
    const match = timestamp.match(dateTimeRegex);
    
    if (match) {
      const [, month, day, year, hour, minute] = match;
      const shortYear = year.slice(-2); // Convert 2024 to 24
      const hourInt = parseInt(hour);
      
      // Convert to 12-hour format with AM/PM (Android logic)
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
      
      formattedDate = `${month}/${day}/${shortYear}, ${displayHour}:${minute} ${amPm}`;
    }
    
    // Return with "Submitted" prefix exactly like Android
    return `Submitted ${formattedDate}`;
    
  } catch (error) {
    // Fallback: use original timestamp with "Submitted" prefix
    return `Submitted ${timestamp}`;
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

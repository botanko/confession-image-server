// Import canvas - Vercel handles this automatically
// const { createCanvas } = require('canvas');

// NEW: Import Vercel Blob client
import { put } from '@vercel/blob';

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
      service: 'Confession Image Generator on Vercel'
    });
  }

  // Main image generation endpoint
  if (req.method === 'POST') {
    try {
      const { confessionText, timestamp } = req.body;
      
      if (!confessionText) {
        return res.status(400).json({ error: 'confessionText is required' });
      }
      
      console.log('Generating image for confession:', confessionText.substring(0, 50) + '...');
      
      // Generate image using exact Android logic, now returns JPEG buffer
      const imageBufferJpeg = await generateConfessionImage(confessionText, timestamp);
      
      // NEW: Upload the JPEG image buffer to Vercel Blob
      const imageName = `confessions/image-${Date.now()}.jpg`; // Unique name with .jpg extension
      const blob = await put(imageName, imageBufferJpeg, {
        access: 'public', // Make it publicly accessible
        contentType: 'image/jpeg', // Set correct content type for JPEG
        // Consider adding cache control for optimization if needed:
        // cacheControl: 'public, max-age=31536000, immutable', 
      });
      // blob.url will contain the public URL

      // Return public URL and (optional) base64 of the JPEG
      const base64Image = imageBufferJpeg.toString('base64');
      
      return res.status(200).json({
        success: true,
        publicImageUrl: blob.url, // The direct public URL from Vercel Blob
        imageBase64: `data:image/jpeg;base64,${base64Image}`, // Base64 of the JPEG
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error generating image or uploading to blob:', error);
      // Check if the error has a Vercel Blob specific structure
      const errorMessage = error.message || 'Failed to generate image';
      const errorDetails = error.stack || (typeof error === 'string' ? error : JSON.stringify(error));
      
      return res.status(500).json({
        error: 'Failed to generate image or upload to blob storage.',
        details: errorMessage,
        fullError: errorDetails // for more detailed debugging if needed
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function generateConfessionImage(confessionText, timestamp) {
  // Dynamic import of @napi-rs/canvas for better Vercel compatibility
  const { createCanvas } = await import('@napi-rs/canvas');
  
  // Calculate dimensions exactly like your Android app
  const dimensions = determineOptimalDimensions(confessionText);
  const effectiveMargin = calculateEffectiveMargin(confessionText);
  const fontSize = findOptimalFontSize(confessionText, dimensions, effectiveMargin, createCanvas);
  
  console.log('Image dimensions:', dimensions);
  console.log('Font size:', fontSize);
  console.log('Margin:', effectiveMargin);
  
  // Create canvas with exact dimensions
  const canvas = createCanvas(dimensions.width, dimensions.height);
  const ctx = canvas.getContext('2d');
  
  // Set background color (important for JPEG as it doesn't support transparency)
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  
  // Set text properties exactly like Android
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px Arial`; // Ensure Arial or a similar font is available in Vercel env
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Calculate text area with dynamic margins (exactly like Android)
  const textAreaWidth = dimensions.width - (effectiveMargin * 2);
  // const textAreaHeight = dimensions.height - (effectiveMargin * 2); // Not directly used for y-pos calc
  const centerX = dimensions.width / 2;
    
  // Word wrap and draw confession text with Android-style line spacing
  const lines = wrapText(ctx, confessionText, textAreaWidth, fontSize);
  
  // Calculate line spacing based on text length and font size (Android logic)
  const lineSpacing = calculateLineSpacing(confessionText, fontSize);
  
  // Calculate total text height like Android: (lines * fontSize) + ((lines-1) * lineSpacing)
  const totalTextHeight = (lines.length * fontSize) + ((lines.length - 1) * lineSpacing);
  
  // Calculate vertical centering with better padding (Android logic)
  const availableHeight = dimensions.height - (effectiveMargin * 2);
  const textY = effectiveMargin + Math.max(0, (availableHeight - totalTextHeight) / 2);  
  // Draw each line with proper spacing
  lines.forEach((line, index) => {
    const y = textY + (index * (fontSize + lineSpacing));
    ctx.fillText(line, centerX, y);
  });
  
  // Draw timestamp in bottom-right corner exactly like Android app
  if (timestamp) {
    drawTimestamp(ctx, timestamp, dimensions);
  }
  
  // MODIFIED: Convert canvas to JPEG buffer using @napi-rs/canvas's encode method
  // Quality is an integer from 0-100 (higher is better quality, larger file)
  const quality = 75; 
  return await canvas.encode('jpeg', quality);
}

function findOptimalFontSize(text, dimensions, margin, createCanvas) {
  // Android font sizing logic - exact match
  const MIN_FONT_SIZE = 20;
  const MAX_FONT_SIZE = 96;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  const EXTREME_TEXT_THRESHOLD = 1500;
  
  const charCount = text.length;
  const maxWidth = dimensions.width - (margin * 2);
  const maxHeight = dimensions.height - (margin * 2);
  
  // Start with size based on character count (Android logic)
  let fontSize;
  if (charCount > EXTREME_TEXT_THRESHOLD) {
    fontSize = 48;
  } else if (charCount > VERY_LONG_TEXT_THRESHOLD) {
    fontSize = 64;
  } else {
    fontSize = MAX_FONT_SIZE;
  }
  
  // Create a temporary canvas for text measurement
  const tempCanvas = createCanvas(100, 100);
  const tempCtx = tempCanvas.getContext('2d');
    // Iteratively find the optimal font size (like Android)
  while (fontSize >= MIN_FONT_SIZE) {
    tempCtx.font = `${fontSize}px Arial`;
    
    // Calculate line spacing like Android
    const lineSpacing = calculateLineSpacing(text, fontSize);
    
    // Wrap text and calculate required height
    const lines = wrapText(tempCtx, text, maxWidth, fontSize);
    
    // Calculate total height: (number of lines * fontSize) + ((number of lines - 1) * lineSpacing)
    // This matches Android's StaticLayout.height calculation
    const totalTextHeight = (lines.length * fontSize) + ((lines.length - 1) * lineSpacing);
    
    // Add padding like Android (fontSize * 0.3f)
    const requiredHeight = totalTextHeight + (fontSize * 0.3);
    
    if (requiredHeight <= maxHeight) {
      return fontSize;
    }
    
    // Use smaller decrements for fine-tuning (Android logic)
    if (charCount > EXTREME_TEXT_THRESHOLD) {
      fontSize -= 1; // Very fine adjustments for extreme text
    } else if (charCount > VERY_LONG_TEXT_THRESHOLD) {
      fontSize -= 2; // Fine adjustments for long text
    } else {
      fontSize -= 3; // Normal adjustments
    }
  }
  
  return MIN_FONT_SIZE;
}

function calculateLineSpacing(text, fontSize) {
  // Android line spacing logic - these are ADDITIONAL spacing on top of font size
  const EXTREME_TEXT_THRESHOLD = 1500;
  const VERY_LONG_TEXT_THRESHOLD = 800;
  
  if (text.length > EXTREME_TEXT_THRESHOLD) {
    return fontSize * 0.05; // Minimal spacing for extreme text
  } else if (text.length > VERY_LONG_TEXT_THRESHOLD) {
    return fontSize * 0.1; // Tighter spacing for very long text
  } else {
    return fontSize * 0.15; // Normal spacing
  }
}

function drawTimestamp(ctx, timestamp, dimensions) {
  // Format timestamp exactly like Android app
  const formattedTimestamp = formatTimestamp(timestamp);
  
  // Create paint for timestamp (exact Android values)
  const timestampFontSize = 22; // Matching Android timestampPaint.textSize
  const paddingFromEdge = 20; // Matching Android paddingFromEdge
  
  ctx.font = `${timestampFontSize}px Arial`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Matching Android alpha 180
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Calculate position - bottom-right corner (exact Android logic)
  const timestampX = dimensions.width - paddingFromEdge;
  const timestampY = dimensions.height - paddingFromEdge;
  
  // Draw timestamp at the very bottom-right corner
  ctx.fillText(formattedTimestamp, timestampX, timestampY);
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

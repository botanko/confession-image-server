// Manual Post API - Trigger a manual Instagram post
import { processConfession } from '../instagram_automation_complete.js';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { config } = req.body;

    if (!config) {
      return res.status(400).json({ 
        error: 'Configuration is required' 
      });
    }

    if (!config.instagramAccessToken) {
      return res.status(400).json({ 
        error: 'Instagram Access Token is required' 
      });
    }

    if (!config.sheetUrl) {
      return res.status(400).json({ 
        error: 'Google Sheets URL is required' 
      });
    }

    console.log('Manual post triggered via API');

    // Use the existing processConfession function
    const result = await processConfession(config);

    if (result.success) {
      res.json({
        success: true,
        message: 'Manual post completed successfully',
        details: result.message,
        postData: {
          timestamp: Date.now(),
          type: 'manual'
        }
      });
    } else {
      res.json({
        success: false,
        message: result.message || 'No content available to post',
        reason: result.reason || 'No pending confessions'
      });
    }
  } catch (error) {
    console.error('Error in manual post API:', error);
    res.status(500).json({ 
      error: 'Failed to trigger manual post',
      message: error.message 
    });
  }
}

// Instagram Automation Control API - Vercel Endpoint
// This endpoint allows the Android app to control the automation script

import { processConfession } from '../instagram_automation_complete.js';

// In-memory storage for automation state (in production, use a database)
let automationState = {
  isRunning: false,
  lastPostTime: 0,
  totalPostsToday: 0,
  pendingConfessions: 0,
  config: null,
  logs: [],
  intervalId: null
};

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { action, config } = req.body;

    switch (action) {
      case 'start':
        return await startAutomation(req, res, config);
      
      case 'stop':
        return await stopAutomation(req, res);
      
      case 'status':
        return await getStatus(req, res);
      
      case 'manual_post':
        return await triggerManualPost(req, res, config);
      
      case 'test_connection':
        return await testConnection(req, res, config);
      
      default:
        res.status(400).json({ 
          error: 'Invalid action. Use: start, stop, status, manual_post, test_connection' 
        });
    }
  } catch (error) {
    console.error('Automation control error:', error);
    addLog('ERROR', `Automation control error: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function startAutomation(req, res, config) {
  try {
    if (automationState.isRunning) {
      return res.status(400).json({ 
        error: 'Automation is already running' 
      });
    }

    // Validate required configuration
    if (!config?.instagramAccessToken) {
      return res.status(400).json({ 
        error: 'Instagram Access Token is required' 
      });
    }

    if (!config?.imageServerUrl) {
      return res.status(400).json({ 
        error: 'Image Server URL is required' 
      });
    }

    // Save configuration
    automationState.config = config;
    automationState.isRunning = true;
    automationState.totalPostsToday = 0; // Reset daily counter
    
    addLog('SUCCESS', 'Automation started successfully', `Interval: ${config.postInterval}ms`);

    // Start the automation interval
    startAutomationInterval();

    res.json({
      success: true,
      message: 'Automation started successfully',
      status: {
        isRunning: true,
        config: config
      }
    });
  } catch (error) {
    console.error('Error starting automation:', error);
    addLog('ERROR', `Failed to start automation: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: 'Failed to start automation',
      message: error.message 
    });
  }
}

async function stopAutomation(req, res) {
  try {
    if (!automationState.isRunning) {
      return res.status(400).json({ 
        error: 'Automation is not running' 
      });
    }

    // Stop the automation interval
    if (automationState.intervalId) {
      clearInterval(automationState.intervalId);
      automationState.intervalId = null;
    }

    automationState.isRunning = false;
    addLog('SUCCESS', 'Automation stopped successfully');

    res.json({
      success: true,
      message: 'Automation stopped successfully',
      status: {
        isRunning: false
      }
    });
  } catch (error) {
    console.error('Error stopping automation:', error);
    addLog('ERROR', `Failed to stop automation: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: 'Failed to stop automation',
      message: error.message 
    });
  }
}

async function getStatus(req, res) {
  try {
    res.json({
      success: true,
      status: {
        isRunning: automationState.isRunning,
        lastPostTime: automationState.lastPostTime,
        totalPostsToday: automationState.totalPostsToday,
        pendingConfessions: automationState.pendingConfessions,
        config: automationState.config ? {
          hasInstagramToken: !!automationState.config.instagramAccessToken,
          hasSheetUrl: !!automationState.config.sheetUrl,
          postInterval: automationState.config.postInterval,
          maxPostsPerDay: automationState.config.maxPostsPerDay
        } : null,
        logs: automationState.logs.slice(0, 10) // Return last 10 logs
      }
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ 
      error: 'Failed to get status',
      message: error.message 
    });
  }
}

async function triggerManualPost(req, res, config) {
  try {
    if (!config?.instagramAccessToken) {
      return res.status(400).json({ 
        error: 'Instagram Access Token is required' 
      });
    }

    addLog('INFO', 'Manual post triggered');

    // Check if we've exceeded daily limit
    if (automationState.totalPostsToday >= (config.maxPostsPerDay || 24)) {
      addLog('WARNING', 'Daily post limit exceeded, skipping manual post');
      return res.status(429).json({ 
        error: 'Daily post limit exceeded',
        message: `Maximum ${config.maxPostsPerDay || 24} posts per day allowed`
      });
    }

    // Use the existing processConfession function from the main script
    const result = await processConfession(config);

    if (result.success) {
      automationState.lastPostTime = Date.now();
      automationState.totalPostsToday++;
      addLog('SUCCESS', `Manual post successful: ${result.message}`);
      
      res.json({
        success: true,
        message: 'Manual post completed successfully',
        details: result.message,
        status: {
          lastPostTime: automationState.lastPostTime,
          totalPostsToday: automationState.totalPostsToday
        }
      });
    } else {
      addLog('WARNING', `Manual post skipped: ${result.message}`);
      res.json({
        success: false,
        message: result.message,
        reason: result.reason || 'No content available'
      });
    }
  } catch (error) {
    console.error('Error triggering manual post:', error);
    addLog('ERROR', `Manual post failed: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: 'Failed to trigger manual post',
      message: error.message 
    });
  }
}

async function testConnection(req, res, config) {
  try {
    const { accessToken, businessAccountId } = config || req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required for connection test' 
      });
    }

    // Test Instagram API connection
    const testUrl = `https://graph.facebook.com/v18.0/${businessAccountId || 'me'}?fields=id,name&access_token=${accessToken}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok && data.id) {
      addLog('SUCCESS', 'Instagram connection test successful', `Account: ${data.name || data.id}`);
      res.json({
        success: true,
        message: 'Instagram connection successful',
        details: `Connected to account: ${data.name || data.id}`,
        accountInfo: {
          id: data.id,
          name: data.name
        }
      });
    } else {
      addLog('ERROR', 'Instagram connection test failed', JSON.stringify(data));
      res.status(400).json({
        success: false,
        error: 'Instagram connection failed',
        message: data.error?.message || 'Invalid credentials',
        details: data
      });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    addLog('ERROR', `Connection test failed: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: 'Failed to test connection',
      message: error.message 
    });
  }
}

function startAutomationInterval() {
  if (automationState.intervalId) {
    clearInterval(automationState.intervalId);
  }

  const interval = automationState.config?.postInterval || 3600000; // Default 1 hour

  automationState.intervalId = setInterval(async () => {
    try {
      if (!automationState.isRunning) {
        clearInterval(automationState.intervalId);
        return;
      }

      // Check if we've exceeded daily limit
      if (automationState.totalPostsToday >= (automationState.config.maxPostsPerDay || 24)) {
        addLog('INFO', 'Daily post limit reached, skipping scheduled post');
        return;
      }

      addLog('INFO', 'Processing scheduled post');
      
      const result = await processConfession(automationState.config);
      
      if (result.success) {
        automationState.lastPostTime = Date.now();
        automationState.totalPostsToday++;
        addLog('SUCCESS', `Scheduled post successful: ${result.message}`);
      } else {
        addLog('INFO', `Scheduled post skipped: ${result.message}`);
      }
    } catch (error) {
      console.error('Error in automation interval:', error);
      addLog('ERROR', `Scheduled post failed: ${error.message}`, error.stack);
    }
  }, interval);

  addLog('INFO', `Automation interval started: ${interval}ms`);
}

function addLog(level, message, details = null) {
  const log = {
    timestamp: Date.now(),
    level,
    message,
    details
  };

  automationState.logs.unshift(log); // Add to beginning

  // Keep only last 100 logs
  if (automationState.logs.length > 100) {
    automationState.logs = automationState.logs.slice(0, 100);
  }

  console.log(`[${level}] ${message}${details ? ` - ${details}` : ''}`);
}

// Reset daily counters at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    automationState.totalPostsToday = 0;
    addLog('INFO', 'Daily post counter reset');
  }
}, 60000); // Check every minute

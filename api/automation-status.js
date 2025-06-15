// Automation Status API - Get current automation status
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return;
  }

  try {
    // This would typically read from a database or external state store
    // For now, return a basic status structure
    const status = {
      isRunning: false, // This should be read from persistent storage
      lastPostTime: 0,
      totalPostsToday: 0,
      pendingConfessions: 0,
      errorMessage: null,
      lastError: null,
      uptime: Date.now() - (Date.now() - 86400000), // 24 hours ago
      version: '1.0.0'
    };

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({ 
      error: 'Failed to get automation status',
      message: error.message 
    });
  }
}

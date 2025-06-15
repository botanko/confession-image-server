// Test Connection API - Test Instagram API connection
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
    const { accessToken, businessAccountId } = req.body;

    if (!accessToken) {
      return res.status(400).json({ 
        error: 'Access token is required' 
      });
    }

    console.log('Testing Instagram connection...');

    // Test basic Instagram API access
    const testUrl = businessAccountId 
      ? `https://graph.facebook.com/v18.0/${businessAccountId}?fields=id,name,username,followers_count&access_token=${accessToken}`
      : `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`;
    
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok && data.id) {
      // Test posting capability (without actually posting)
      let postingCapable = false;
      if (businessAccountId) {
        try {
          const postTestUrl = `https://graph.facebook.com/v18.0/${businessAccountId}/media?access_token=${accessToken}`;
          const postTestResponse = await fetch(postTestUrl);
          postingCapable = postTestResponse.ok;
        } catch (e) {
          console.log('Post capability test failed:', e.message);
        }
      }

      res.json({
        success: true,
        message: 'Instagram connection successful',
        details: `Connected to account: ${data.name || data.username || data.id}`,
        accountInfo: {
          id: data.id,
          name: data.name,
          username: data.username,
          followers_count: data.followers_count,
          postingCapable
        },
        capabilities: {
          canRead: true,
          canPost: postingCapable,
          hasBusinessAccount: !!businessAccountId
        }
      });
    } else {
      console.error('Instagram connection failed:', data);
      res.status(400).json({
        success: false,
        error: 'Instagram connection failed',
        message: data.error?.message || 'Invalid credentials or insufficient permissions',
        details: data.error || data,
        suggestions: [
          'Check if your access token is valid and not expired',
          'Ensure the token has proper Instagram permissions',
          'Verify the business account ID is correct',
          'Make sure the account is connected to a Facebook Page'
        ]
      });
    }
  } catch (error) {
    console.error('Error testing Instagram connection:', error);
    res.status(500).json({ 
      error: 'Failed to test connection',
      message: error.message,
      suggestions: [
        'Check your internet connection',
        'Verify the Instagram API is accessible',
        'Ensure your access token is properly formatted'
      ]
    });
  }
}

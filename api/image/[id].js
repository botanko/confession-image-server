// Serve generated images by ID
const images = new Map(); // In-memory storage for images (consider using a database for production)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    // Get image from storage (you might want to use a proper database)
    const imageData = global.imageStorage?.[id];
    
    if (!imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Serve the image
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    return res.status(200).send(imageData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

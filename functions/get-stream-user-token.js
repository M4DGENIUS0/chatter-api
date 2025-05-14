const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

const serverClient = StreamChat.getInstance(process.env.STREAM_KEY, process.env.STREAM_SECRET);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).send('No auth token provided');

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).send('Invalid token');

  try {
    // ✅ FIX: Add iat explicitly to prevent "iat should be a number" error
    const streamToken = serverClient.createToken(user.id, {
      iat: Math.floor(Date.now() / 1000),
    });

    res.status(200).json({ token: streamToken });
  } catch (err) {
    console.error('Token generation error:', err);
    res.status(500).json({ error: 'Failed to generate Server token.', reference: Date.now() });
  }
};

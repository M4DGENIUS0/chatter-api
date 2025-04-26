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
    const streamToken = serverClient.createToken(user.id);
    res.status(200).json({ token: streamToken });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to get Stream token');
  }
};

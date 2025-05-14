const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

const serverClient = StreamChat.getInstance("zcca3ccmptpd", "wxgxh249uxyjye7h9d62geewkrv93gmjxk937cw4fyexycxp57jggg7bjhfcs88m");
const supabase = createClient("https://dvbckljvgbwinoyrqefw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmNrbGp2Z2J3aW5veXJxZWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTAzMCwiZXhwIjoyMDYxMDk1MDMwfQ.pjqsFHf1t1V-wM90l01cvegVc80a5hrprprpnC24spk");

async function getStreamUserToken(req, res) {
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

    return res.status(200).json({ token: streamToken });
  } catch (err) {
    console.error('Token generation error:', err);
    return res.status(500).json({ error: 'Failed to generate Server token.', reference: Date.now() });
  }
}

// Export the handler function
module.exports.handler = getStreamUserToken;

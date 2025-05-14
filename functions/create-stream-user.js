const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

const serverClient = StreamChat.getInstance("zcca3ccmptpd", "wxgxh249uxyjye7h9d62geewkrv93gmjxk937cw4fyexycxp57jggg7bjhfcs88m");
const supabase = createClient("https://dvbckljvgbwinoyrqefw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmNrbGp2Z2J3aW5veXJxZWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTAzMCwiZXhwIjoyMDYxMDk1MDMwfQ.pjqsFHf1t1V-wM90l01cvegVc80a5hrprprpnC24spk");

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) return res.status(401).send('No auth token provided');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).send('Invalid token');

  try {
    await serverClient.upsertUser({
      id: user.id,
      name: user.user_metadata.name,
      email: user.email,
      image: user.user_metadata.avatar_url,
    });

    const streamToken = serverClient.createToken(user.id);
    res.status(200).json({ token: streamToken });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create Stream user');
  }
}

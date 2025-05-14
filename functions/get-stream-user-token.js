const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

const serverClient = StreamChat.getInstance("zcca3ccmptpd", "wxgxh249uxyjye7h9d62geewkrv93gmjxk937cw4fyexycxp57jggg7bjhfcs88m");
const supabase = createClient("https://dvbckljvgbwinoyrqefw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmNrbGp2Z2J3aW5veXJxZWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTAzMCwiZXhwIjoyMDYxMDk1MDMwfQ.pjqsFHf1t1V-wM90l01cvegVc80a5hrprprpnC24spk");

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Only GET allowed' })
    };
  }

  // Corrected to lowercase 'authorization'
  const token = event.headers['authorization']?.split('Bearer ')[1];
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'No auth token provided' })
    };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid token' })
    };
  }

  try {
    const streamToken = serverClient.createToken(user.id, {
      iat: Math.floor(Date.now() / 1000),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ token: streamToken })
    };
  } catch (err) {
    console.error('Token generation error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate Server token.', reference: Date.now() })
    };
  }
};
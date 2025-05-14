// create-stream-user.js
const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

const serverClient = StreamChat.getInstance("zcca3ccmptpd", "wxgxh249uxyjye7h9d62geewkrv93gmjxk937cw4fyexycxp57jggg7bjhfcs88m");
const supabase = createClient("https://dvbckljvgbwinoyrqefw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmNrbGp2Z2J3aW5veXJxZWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTAzMCwiZXhwIjoyMDYxMDk1MDMwfQ.pjqsFHf1t1V-wM90l01cvegVc80a5hrprprpnC24spk");

// For Netlify Functions, we use exports.handler instead of export default
exports.handler = async function(event, context) {
  // Parse request method and body
  const method = event.httpMethod;
  
  // Check if method is POST
  if (method !== 'POST') {
    return {
      statusCode: 405,
      body: 'Only POST allowed'
    };
  }

  // Get authorization token
  const token = event.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return {
      statusCode: 401,
      body: 'No auth token provided'
    };
  }

  // Verify user with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    return {
      statusCode: 401,
      body: 'Invalid token'
    };
  }

  try {
    // Create or update Stream user
    await serverClient.upsertUser({
      id: user.id,
      name: user.user_metadata.name,
      email: user.email,
      image: user.user_metadata.avatar_url,
    });

    // Create Stream token for the user
    const streamToken = serverClient.createToken(user.id);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ token: streamToken }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Failed to create Stream user'
    };
  }
};
const { StreamChat } = require('stream-chat');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stream Chat client with your API key and secret
const serverClient = StreamChat.getInstance(
  "zcca3ccmptpd", 
  "wxgxh249uxyjye7h9d62geewkrv93gmjxk937cw4fyexycxp57jggg7bjhfcs88m"
);

// Initialize Supabase client
const supabase = createClient(
  "https://dvbckljvgbwinoyrqefw.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2YmNrbGp2Z2J3aW5veXJxZWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUxOTAzMCwiZXhwIjoyMDYxMDk1MDMwfQ.pjqsFHf1t1V-wM90l01cvegVc80a5hrprprpnC24spk"
);

module.exports.handler = async (event, context) => {
  try {
    // Check for correct HTTP method
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Only GET method allowed' })
      };
    }

    // Debug headers received
    console.log('Headers received:', JSON.stringify(event.headers));

    // Extract token from Authorization header - handle both case sensitivities
    const authHeader = event.headers['authorization'] || event.headers['Authorization'];
    if (!authHeader) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No authorization header provided' })
      };
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid authorization format. Expected Bearer token' })
      };
    }

    console.log('Token received:', token.substring(0, 20) + '...');

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Supabase auth error:', error);
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid token', details: error.message })
      };
    }

    if (!data.user) {
      console.error('No user found with token');
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    console.log('User authenticated:', data.user.id);

    // Create Stream token
    const streamToken = serverClient.createToken(data.user.id);
    console.log('Stream token generated successfully');

    // Return stream token
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ token: streamToken })
    };
  } catch (err) {
    console.error('Serverless function error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: 'Failed to generate Server token.', 
        message: err.message,
        reference: Date.now() 
      })
    };
  }
};
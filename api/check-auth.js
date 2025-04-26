const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).send('Only GET allowed');

  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) return res.status(401).send('No auth token provided');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) return res.status(401).send('Invalid token');

  res.status(200).json({ user });
};

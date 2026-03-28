import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Simple auth check
  const auth = req.headers.authorization;
  if (auth !== 'Bearer admin:admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await sb.from('registrations').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}

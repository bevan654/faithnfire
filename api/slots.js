const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { count, error } = await sb.from('registrations').select('*', { count: 'exact', head: true });
  if (error) return res.status(500).json({ error: error.message });

  const { count: saCount, error: saError } = await sb.from('registrations').select('*', { count: 'exact', head: true }).eq('state', 'SA');
  if (saError) return res.status(500).json({ error: saError.message });

  return res.status(200).json({ count, saCount });
};

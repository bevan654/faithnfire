const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { first_name, last_name, email, parish, state, team_name, captain, payment_ref, players } = req.body;

  if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name are required' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!parish) return res.status(400).json({ error: 'Parish is required' });
  if (!state) return res.status(400).json({ error: 'State is required' });
  if (!team_name) return res.status(400).json({ error: 'Team name is required' });
  if (!Array.isArray(players) || players.length < 6) {
    return res.status(400).json({ error: 'At least 6 players required' });
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.first_name || !p.last_name || !p.age || !p.phone || !p.emergency_name || !p.emergency_phone || !p.relation) {
      return res.status(400).json({ error: 'Player ' + (i + 1) + ': all fields are required' });
    }
  }

  // Check slot availability
  const MAX_TEAMS = 8;
  const SA_RESERVED = 4;
  const OPEN_SLOTS = MAX_TEAMS - SA_RESERVED;

  const { count: totalCount, error: countErr } = await sb.from('registrations').select('*', { count: 'exact', head: true });
  if (countErr) return res.status(500).json({ error: countErr.message });

  if (totalCount >= MAX_TEAMS) {
    return res.status(400).json({ error: 'All registration slots are full.' });
  }

  const { count: saCount, error: saErr } = await sb.from('registrations').select('*', { count: 'exact', head: true }).eq('state', 'SA');
  if (saErr) return res.status(500).json({ error: saErr.message });

  if (state === 'SA' && saCount >= SA_RESERVED) {
    return res.status(400).json({ error: 'All SA reserved slots have been filled.' });
  }

  if (state !== 'SA') {
    const interstateCount = totalCount - saCount;
    const saInOpen = Math.max(0, saCount - SA_RESERVED);
    const openUsed = interstateCount + saInOpen;
    if (openUsed >= OPEN_SLOTS) {
      return res.status(400).json({ error: 'All open registration slots have been filled.' });
    }
  }

  const { data, error } = await sb
    .from('registrations')
    .insert({ first_name, last_name, email, parish, state, team_name, captain, payment_ref, players })
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(data[0]);
};

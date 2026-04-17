const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const [, creds] = auth.split('Bearer ');
  const [username, password] = (creds || '').split(':');
  if (!username || username.toLowerCase() === 'admin' || password !== 'godisgood') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { id, first_name, last_name, email, parish, state, team_name, captain, payment_ref, players } = req.body;

  if (!id) return res.status(400).json({ error: 'Missing registration id' });
  if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name are required' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!parish) return res.status(400).json({ error: 'Parish is required' });
  if (!Array.isArray(players) || players.length < 6) {
    return res.status(400).json({ error: 'At least 6 players required' });
  }

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.first_name || !p.last_name || !p.age || !p.phone || !p.emergency_name || !p.emergency_phone || !p.relation) {
      return res.status(400).json({ error: 'Player ' + (i + 1) + ': all fields are required' });
    }
  }

  // Fetch old record for diff
  const { data: oldData, error: fetchErr } = await sb
    .from('registrations')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchErr || !oldData) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  // Compute changes
  const changes = [];
  const fields = { first_name, last_name, email, parish, state, team_name, captain, payment_ref };
  for (const [key, newVal] of Object.entries(fields)) {
    const oldVal = oldData[key] || '';
    if (String(oldVal) !== String(newVal || '')) {
      changes.push({ field: key, old: oldVal, new: newVal });
    }
  }

  // Compare players field-by-field
  const oldPlayers = oldData.players || [];
  const playerFields = ['first_name', 'last_name', 'age', 'phone', 'emergency_name', 'emergency_phone', 'relation'];
  const maxLen = Math.max(oldPlayers.length, players.length);
  for (let i = 0; i < maxLen; i++) {
    const op = oldPlayers[i];
    const np = players[i];
    if (!op && np) {
      changes.push({ field: 'Player ' + (i + 1), old: '—', new: 'added' });
    } else if (op && !np) {
      changes.push({ field: 'Player ' + (i + 1), old: op.first_name + ' ' + op.last_name, new: 'removed' });
    } else {
      for (const f of playerFields) {
        if (String(op[f] || '') !== String(np[f] || '')) {
          changes.push({ field: 'Player ' + (i + 1) + ' ' + f, old: op[f] || '—', new: np[f] || '—' });
        }
      }
    }
  }

  // Perform update — use the id from the fetched record to ensure correct type
  const { data, error } = await sb
    .from('registrations')
    .update({ first_name, last_name, email, parish, state, team_name, captain, payment_ref, players })
    .eq('id', oldData.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'Registration not found' });

  // Write audit log
  if (changes.length > 0) {
    const { error: logErr } = await sb.from('audit_log').insert({
      username,
      registration_id: String(id),
      team_name: team_name || oldData.team_name,
      action: 'edit',
      changes
    });
    if (logErr) console.error('Audit log insert failed:', logErr.message);
  }

  return res.status(200).json(data[0]);
};

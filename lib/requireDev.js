async function requireDev(req, sbAdmin) {
  const authH = req.headers.authorization || '';
  const token = authH.startsWith('Bearer ') ? authH.slice(7) : null;
  if (!token) return null;

  const { data, error } = await sbAdmin.auth.getUser(token);
  if (error || !data || !data.user) return null;

  const { data: prof } = await sbAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (!prof || prof.role !== 'dev') return null;
  return data.user;
}

module.exports = { requireDev };

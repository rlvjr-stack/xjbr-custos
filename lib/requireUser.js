async function requireUser(req, sbAdmin) {
  const authH = req.headers.authorization || '';
  const token = authH.startsWith('Bearer ') ? authH.slice(7) : null;
  if (!token) return null;

  const { data, error } = await sbAdmin.auth.getUser(token);
  if (error || !data || !data.user) return null;

  const { data: prof } = await sbAdmin
    .from('profiles')
    .select('role, tenant')
    .eq('id', data.user.id)
    .single();

  if (!prof) return null;
  return { user: data.user, role: prof.role, tenant: prof.tenant };
}

module.exports = { requireUser };

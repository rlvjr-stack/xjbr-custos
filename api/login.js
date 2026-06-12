const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { getAdminClient } = require('../lib/supabaseAdmin');
const { emailFor } = require('../lib/tenantCrud');

const SLUG_RE = /^[a-z0-9-]+$/;

// POST /api/login  { tenant, password }
// Verifica a senha do operador no servidor (nunca no navegador) e devolve
// os tokens de sessao do Supabase Auth correspondentes a conta interna
// (financeiro/viewer/dev) daquele parceiro.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Metodo nao permitido' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const tenant = typeof body.tenant === 'string' ? body.tenant : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!tenant || !SLUG_RE.test(tenant) || !password) {
    res.status(400).json({ error: 'Dados invalidos' });
    return;
  }

  const sbAdmin = getAdminClient();
  const sbAuth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // Conta Dev: senha-master valida para qualquer parceiro, acesso total.
  if (process.env.DEV_PASS && password === process.env.DEV_PASS) {
    const { data: devRow, error: devErr } = await sbAdmin
      .from('tenant_settings')
      .select('internal_pass_dev')
      .eq('tenant', '_dev')
      .single();

    if (devErr || !devRow || !devRow.internal_pass_dev) {
      console.error('login dev config error', devErr);
      res.status(500).json({ error: 'Dev nao configurado' });
      return;
    }

    const { data, error } = await sbAuth.auth.signInWithPassword({
      email: 'dev@xjbr.local',
      password: devRow.internal_pass_dev
    });
    if (error || !data.session) {
      console.error('login dev signIn error', error);
      res.status(200).json({ error: 'Senha incorreta' });
      return;
    }
    res.status(200).json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
    return;
  }

  const { data: row, error: rowErr } = await sbAdmin
    .from('tenant_settings')
    .select('pass_financeiro_hash, pass_viewer_hash, internal_pass_financeiro, internal_pass_viewer')
    .eq('tenant', tenant)
    .single();

  if (rowErr || !row) {
    res.status(200).json({ error: 'Senha incorreta' });
    return;
  }

  let email = null;
  let internalPass = null;
  if (row.pass_financeiro_hash && bcrypt.compareSync(password, row.pass_financeiro_hash)) {
    email = emailFor('financeiro', tenant);
    internalPass = row.internal_pass_financeiro;
  } else if (row.pass_viewer_hash && bcrypt.compareSync(password, row.pass_viewer_hash)) {
    email = emailFor('viewer', tenant);
    internalPass = row.internal_pass_viewer;
  }

  if (!email || !internalPass) {
    res.status(200).json({ error: 'Senha incorreta' });
    return;
  }

  const { data, error } = await sbAuth.auth.signInWithPassword({ email, password: internalPass });
  if (error || !data.session) {
    console.error('login signIn error', error);
    res.status(200).json({ error: 'Senha incorreta' });
    return;
  }

  res.status(200).json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
};

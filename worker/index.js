const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
});

function cookieValue(request, name) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function requireConfig(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing runtime secrets: ${missing.join(', ')}`);
}

async function sendTelegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return { skipped: true };
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!response.ok) throw new Error(`Telegram error: ${response.status}`);
  return response.json();
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function supabaseHeaders(env, authToken = env.SUPABASE_SERVICE_ROLE_KEY) {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${authToken}`,
    'content-type': 'application/json',
  };
}

async function createSupabaseUser(env, email, password, metadata) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: supabaseHeaders(env),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.message || 'Unable to create account');
  return body;
}

async function uploadDocument(env, userId, side, file) {
  if (!(file instanceof File) || !file.size) throw new Error(`Missing ${side} document`);
  if (file.size > 8 * 1024 * 1024) throw new Error('Document file is too large');
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
  if (!allowed.has(file.type)) throw new Error('Unsupported document format');
  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'bin';
  const path = `${userId}/${side}-${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/cosmo-kyc-documents/${path}`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'content-type': file.type,
      'x-upsert': 'false',
    },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(`Unable to upload ${side} document`);
  return path;
}

async function insertApplication(env, row) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications`, {
    method: 'POST',
    headers: { ...supabaseHeaders(env), Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  const body = await response.json().catch(() => []);
  if (!response.ok) throw new Error(body?.message || 'Unable to save application');
  return body[0];
}

async function handleLead(request, env) {
  const data = await request.json();
  if (!data.name || !data.phone) return json({ error: 'name_and_phone_required' }, 400);
  const message = [
    '<b>🌌 COSMO — новая заявка</b>',
    `Имя: <b>${esc(data.name)}</b>`,
    `Телефон: ${esc(data.phone)}`,
    `Telegram: ${esc(data.telegram || '—')}`,
    `Язык: ${esc(data.locale || 'ru')}`,
    `Страница: ${esc(data.page || '—')}`,
  ].join('\n');
  await sendTelegram(env, message);
  return json({ ok: true });
}

async function handleRegister(request, env) {
  requireConfig(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const fullName = String(form.get('full_name') || '').trim();
  const phone = String(form.get('phone') || '').trim();
  const dob = String(form.get('date_of_birth') || '');
  if (!email || password.length < 8 || !fullName || !phone || !dob) return json({ error: 'required_fields_missing' }, 400);

  const age = Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
  if (!Number.isFinite(age) || age < 18) return json({ error: 'age_18_required' }, 400);

  try {
    const user = await createSupabaseUser(env, email, password, { full_name: fullName, phone });
    const frontPath = await uploadDocument(env, user.id, 'front', form.get('document_front'));
    const backPath = await uploadDocument(env, user.id, 'back', form.get('document_back'));
    const application = await insertApplication(env, {
      user_id: user.id,
      status: 'review',
      locale: String(form.get('locale') || 'ru'),
      full_name: fullName,
      date_of_birth: dob,
      phone,
      telegram: String(form.get('telegram') || '').trim(),
      email,
      country: String(form.get('country') || '').trim(),
      city: String(form.get('city') || '').trim(),
      experience: String(form.get('experience') || '').trim(),
      schedule: String(form.get('schedule') || '').trim(),
      languages: String(form.get('languages') || '').trim(),
      document_type: String(form.get('document_type') || 'passport'),
      document_front_path: frontPath,
      document_back_path: backPath,
      consent_at: new Date().toISOString(),
    });

    const adminUrl = `${new URL(request.url).origin}/admin/`;
    await sendTelegram(env, [
      '<b>🪐 COSMO — новая регистрация</b>',
      `ID: <code>${esc(application.id)}</code>`,
      `Имя: <b>${esc(fullName)}</b>`,
      `Телефон: ${esc(phone)}`,
      `Telegram: ${esc(form.get('telegram') || '—')}`,
      `Email: ${esc(email)}`,
      `Страна / город: ${esc(form.get('country') || '—')} / ${esc(form.get('city') || '—')}`,
      `Статус: <b>REVIEW</b>`,
      `\nДокументы сохранены приватно и не отправляются в Telegram.`,
      `Админка: ${esc(adminUrl)}`,
    ].join('\n'));

    return json({ ok: true, application_id: application.id, status: application.status });
  } catch (error) {
    console.error(error);
    return json({ error: error.message || 'registration_failed' }, 400);
  }
}

async function handleLogin(request, env) {
  requireConfig(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const { email, password } = await request.json();
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) return json({ error: 'invalid_credentials' }, 401);
  const maxAge = body.expires_in || 3600;
  return json({ ok: true }, 200, {
    'set-cookie': `cosmo_session=${encodeURIComponent(body.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`,
  });
}

async function getCurrentUser(request, env) {
  const token = cookieValue(request, 'cosmo_session');
  if (!token) return null;
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: supabaseHeaders(env, token) });
  if (!response.ok) return null;
  return response.json();
}

async function handleMe(request, env) {
  requireConfig(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const user = await getCurrentUser(request, env);
  if (!user) return json({ error: 'unauthorized' }, 401);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?user_id=eq.${encodeURIComponent(user.id)}&select=id,status,full_name,email,phone,telegram,country,city,created_at,reviewed_at,review_note&order=created_at.desc&limit=1`, {
    headers: supabaseHeaders(env),
  });
  const rows = await response.json();
  return json({ user: { id: user.id, email: user.email }, application: rows?.[0] || null });
}

function isAdmin(request, env) {
  const key = request.headers.get('x-admin-key');
  return Boolean(env.ADMIN_ACCESS_KEY && key && key === env.ADMIN_ACCESS_KEY);
}

async function handleAdminList(request, env) {
  if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
  requireConfig(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?select=id,status,full_name,date_of_birth,phone,telegram,email,country,city,experience,schedule,languages,document_type,document_front_path,document_back_path,created_at,review_note&order=created_at.desc&limit=100`, { headers: supabaseHeaders(env) });
  return json(await response.json());
}

async function handleAdminDocument(request, env) {
  if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
  requireConfig(env, ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  if (!path || path.includes('..')) return json({ error: 'invalid_path' }, 400);
  const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/cosmo-kyc-documents/${encodeURI(path)}`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
  });
  if (!response.ok) return json({ error: 'document_not_found' }, 404);
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'no-store, private');
  headers.set('content-security-policy', "default-src 'none'");
  return new Response(response.body, { status: 200, headers });
}

async function handleAdminStatus(request, env, id) {
  if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
  const { status, review_note = '' } = await request.json();
  if (!['approved', 'rejected', 'needs_changes', 'review'].includes(status)) return json({ error: 'invalid_status' }, 400);
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders(env), Prefer: 'return=representation' },
    body: JSON.stringify({ status, review_note, reviewed_at: new Date().toISOString() }),
  });
  const rows = await response.json().catch(() => []);
  if (!response.ok) return json({ error: 'update_failed' }, 400);
  const row = rows[0];
  await sendTelegram(env, `<b>✅ COSMO — статус обновлён</b>\n${esc(row?.full_name || id)}\nСтатус: <b>${esc(status.toUpperCase())}</b>`);
  return json({ ok: true, application: row });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (request.method === 'POST' && url.pathname === '/api/lead') return handleLead(request, env);
      if (request.method === 'POST' && url.pathname === '/api/register') return handleRegister(request, env);
      if (request.method === 'POST' && url.pathname === '/api/login') return handleLogin(request, env);
      if (request.method === 'POST' && url.pathname === '/api/logout') return json({ ok: true }, 200, { 'set-cookie': 'cosmo_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0' });
      if (request.method === 'GET' && url.pathname === '/api/me') return handleMe(request, env);
      if (request.method === 'GET' && url.pathname === '/api/admin/applications') return handleAdminList(request, env);
      if (request.method === 'GET' && url.pathname === '/api/admin/document') return handleAdminDocument(request, env);
      const match = url.pathname.match(/^\/api\/admin\/applications\/([^/]+)\/status$/);
      if (request.method === 'POST' && match) return handleAdminStatus(request, env, match[1]);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      return json({ error: 'server_error' }, 500);
    }
  },
};

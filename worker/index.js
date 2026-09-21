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
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
  if (!response.ok) throw new Error(`Telegram error: ${response.status}`);
  return response.json();
}

function esc(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char])); }
function supabaseHeaders(env, authToken = env.SUPABASE_SERVICE_ROLE_KEY) { return { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${authToken}`, 'content-type': 'application/json' }; }

const NAME_RE = /^[\p{L}][\p{L}'’ -]{1,78}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG_RE = /^@[A-Za-z0-9_]{5,32}$/;
function validPhone(value){ const digits=String(value||'').replace(/\D/g,''); return /^\+?[\d\s().-]+$/.test(String(value||'')) && digits.length>=8 && digits.length<=15 && !/^(\d)\1{7,}$/.test(digits); }
function validDob(value){ const d=new Date(value); if(!value||Number.isNaN(d.getTime())) return false; const y=d.getUTCFullYear(); if(y<1950) return false; const now=new Date(); let age=now.getUTCFullYear()-y; const md=now.getUTCMonth()-d.getUTCMonth(); if(md<0||(md===0&&now.getUTCDate()<d.getUTCDate())) age--; return age>=18 && d<=now; }

async function createSupabaseUser(env, email, password, metadata) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, { method:'POST', headers:supabaseHeaders(env), body:JSON.stringify({ email, password, email_confirm:true, user_metadata:metadata }) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.message || 'Unable to create account');
  return body;
}

async function uploadDocument(env, userId, side, file) {
  if (!(file instanceof File) || !file.size) throw new Error(`missing_${side}_document`);
  if (file.size > 8 * 1024 * 1024) throw new Error('document_file_too_large');
  const allowed = new Set(['image/jpeg','image/png','image/webp','application/pdf']);
  if (!allowed.has(file.type)) throw new Error('unsupported_document_format');
  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g,'').toLowerCase() || 'bin';
  const path = `${userId}/${side}-${crypto.randomUUID()}.${ext}`;
  const response = await fetch(`${env.SUPABASE_URL}/storage/v1/object/cosmo-kyc-documents/${path}`, { method:'POST', headers:{ apikey:env.SUPABASE_SERVICE_ROLE_KEY, Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type':file.type, 'x-upsert':'false' }, body:await file.arrayBuffer() });
  if (!response.ok) throw new Error(`unable_to_upload_${side}`);
  return path;
}

async function insertApplication(env, row) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications`, { method:'POST', headers:{ ...supabaseHeaders(env), Prefer:'return=representation' }, body:JSON.stringify(row) });
  const body = await response.json().catch(() => []);
  if (!response.ok) throw new Error(body?.message || 'Unable to save application');
  return body[0];
}

async function handleLead(request, env) {
  const data = await request.json();
  if (!data.name || !data.phone || !validPhone(data.phone)) return json({ error:'name_and_valid_phone_required' },400);
  await sendTelegram(env, ['<b>🌌 COSMO — новая заявка</b>',`Имя: <b>${esc(data.name)}</b>`,`Телефон: ${esc(data.phone)}`,`Telegram: ${esc(data.telegram||'—')}`,`Язык: ${esc(data.locale||'ru')}`,`Страница: ${esc(data.page||'—')}`].join('\n'));
  return json({ ok:true });
}

async function handleRegister(request, env) {
  requireConfig(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']);
  const form = await request.formData();
  const email=String(form.get('email')||'').trim().toLowerCase(); const password=String(form.get('password')||''); const fullName=String(form.get('full_name')||'').trim(); const phone=String(form.get('phone')||'').trim(); const telegram=String(form.get('telegram')||'').trim(); const dob=String(form.get('date_of_birth')||''); const country=String(form.get('country')||'').trim(); const city=String(form.get('city')||'').trim();
  if (!NAME_RE.test(fullName) || fullName.split(/\s+/).length < 2) return json({error:'invalid_name'},400);
  if (!validDob(dob)) return json({error:'invalid_date_of_birth_or_underage'},400);
  if (!validPhone(phone)) return json({error:'invalid_phone'},400);
  if (telegram && !TG_RE.test(telegram)) return json({error:'invalid_telegram'},400);
  if (country.length<2 || city.length<2) return json({error:'invalid_location'},400);
  if (!EMAIL_RE.test(email)) return json({error:'invalid_email'},400);
  if (password.length<8) return json({error:'weak_password'},400);
  if (String(form.get('consent'))!=='true') return json({error:'consent_required'},400);
  const front=form.get('document_front'); const back=form.get('document_back');
  if (!(front instanceof File) || !front.size || !(back instanceof File) || !back.size) return json({error:'both_document_sides_required'},400);
  try {
    const user=await createSupabaseUser(env,email,password,{full_name:fullName,phone});
    const frontPath=await uploadDocument(env,user.id,'front',front); const backPath=await uploadDocument(env,user.id,'back',back);
    const application=await insertApplication(env,{ user_id:user.id,status:'review',locale:String(form.get('locale')||'ru'),full_name:fullName,date_of_birth:dob,phone,telegram,email,country,city,experience:String(form.get('experience')||'').trim().slice(0,1000),schedule:String(form.get('schedule')||'').trim().slice(0,160),languages:String(form.get('languages')||'').trim().slice(0,160),document_type:String(form.get('document_type')||'passport'),document_front_path:frontPath,document_back_path:backPath,consent_at:new Date().toISOString() });
    const adminUrl=`${new URL(request.url).origin}/admin/`;
    await sendTelegram(env,['<b>🪐 COSMO — новая регистрация</b>',`ID: <code>${esc(application.id)}</code>`,`Имя: <b>${esc(fullName)}</b>`,`Телефон: ${esc(phone)}`,`Telegram: ${esc(telegram||'—')}`,`Email: ${esc(email)}`,`Страна / город: ${esc(country)} / ${esc(city)}`,'Статус: <b>REVIEW</b>','\nДокументы сохранены приватно и не отправляются в Telegram.',`Админка: ${esc(adminUrl)}`].join('\n'));
    return json({ok:true,application_id:application.id,status:application.status});
  } catch(error){ console.error(error); return json({error:error.message||'registration_failed'},400); }
}

async function handleLogin(request, env) {
  requireConfig(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']); const {email,password}=await request.json();
  const response=await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json'},body:JSON.stringify({email,password})}); const body=await response.json().catch(()=>({})); if(!response.ok||!body.access_token)return json({error:'invalid_credentials'},401); const maxAge=body.expires_in||3600; return json({ok:true},200,{'set-cookie':`cosmo_session=${encodeURIComponent(body.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`});
}
async function getCurrentUser(request, env){ const token=cookieValue(request,'cosmo_session'); if(!token)return null; const response=await fetch(`${env.SUPABASE_URL}/auth/v1/user`,{headers:supabaseHeaders(env,token)}); if(!response.ok)return null; return response.json(); }
async function handleMe(request,env){ requireConfig(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']); const user=await getCurrentUser(request,env); if(!user)return json({error:'unauthorized'},401); const response=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?user_id=eq.${encodeURIComponent(user.id)}&select=id,status,full_name,email,phone,telegram,country,city,created_at,reviewed_at,review_note&order=created_at.desc&limit=1`,{headers:supabaseHeaders(env)}); const rows=await response.json(); return json({user:{id:user.id,email:user.email},application:rows?.[0]||null}); }
function isAdmin(request,env){ const key=request.headers.get('x-admin-key'); return Boolean(env.ADMIN_ACCESS_KEY&&key&&key===env.ADMIN_ACCESS_KEY); }
async function handleAdminList(request,env){ if(!isAdmin(request,env))return json({error:'unauthorized'},401); requireConfig(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']); const response=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?select=id,status,full_name,date_of_birth,phone,telegram,email,country,city,experience,schedule,languages,document_type,document_front_path,document_back_path,created_at,review_note&order=created_at.desc&limit=100`,{headers:supabaseHeaders(env)}); return json(await response.json()); }
async function handleAdminDocument(request,env){ if(!isAdmin(request,env))return json({error:'unauthorized'},401); requireConfig(env,['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']); const url=new URL(request.url); const path=url.searchParams.get('path'); if(!path||path.includes('..'))return json({error:'invalid_path'},400); const response=await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/cosmo-kyc-documents/${encodeURI(path)}`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`}}); if(!response.ok)return json({error:'document_not_found'},404); const headers=new Headers(response.headers); headers.set('cache-control','no-store, private'); headers.set('content-security-policy',"default-src 'none'"); return new Response(response.body,{status:200,headers}); }
async function handleAdminStatus(request,env,id){ if(!isAdmin(request,env))return json({error:'unauthorized'},401); const {status,review_note=''}=await request.json(); if(!['approved','rejected','needs_changes','review'].includes(status))return json({error:'invalid_status'},400); if((status==='rejected'||status==='needs_changes')&&!String(review_note).trim())return json({error:'review_note_required'},400); const response=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{...supabaseHeaders(env),Prefer:'return=representation'},body:JSON.stringify({status,review_note:String(review_note).trim().slice(0,1000),reviewed_at:new Date().toISOString()})}); const rows=await response.json().catch(()=>[]); if(!response.ok)return json({error:'update_failed'},400); const row=rows[0]; await sendTelegram(env,`<b>✅ COSMO — статус обновлён</b>\n${esc(row?.full_name||id)}\nСтатус: <b>${esc(status.toUpperCase())}</b>`); return json({ok:true,application:row}); }

export default { async fetch(request,env){ const url=new URL(request.url); try{ if(request.method==='POST'&&url.pathname==='/api/lead')return handleLead(request,env); if(request.method==='POST'&&url.pathname==='/api/register')return handleRegister(request,env); if(request.method==='POST'&&url.pathname==='/api/login')return handleLogin(request,env); if(request.method==='POST'&&url.pathname==='/api/logout')return json({ok:true},200,{'set-cookie':'cosmo_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'}); if(request.method==='GET'&&url.pathname==='/api/me')return handleMe(request,env); if(request.method==='GET'&&url.pathname==='/api/admin/applications')return handleAdminList(request,env); if(request.method==='GET'&&url.pathname==='/api/admin/document')return handleAdminDocument(request,env); const match=url.pathname.match(/^\/api\/admin\/applications\/([^/]+)\/status$/); if(request.method==='POST'&&match)return handleAdminStatus(request,env,match[1]); return env.ASSETS.fetch(request);}catch(error){console.error(error);return json({error:'server_error'},500);} } };

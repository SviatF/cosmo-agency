import baseWorker from './base.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8'}});
const NAME_RE=/^[\p{L}][\p{L}'’ -]{1,78}$/u;
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TG_RE=/^@[A-Za-z0-9_]{5,32}$/;
const DOCUMENT_TYPES=new Set(['id_card','foreign_passport','driver_license']);
const FILE_TYPES=new Set(['image/jpeg','image/png','image/webp','application/pdf']);
const IMAGE_TYPES=new Set(['image/jpeg','image/png','image/webp']);
const MAX_FILE=8*1024*1024;

function esc(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function validPhone(value){const digits=String(value||'').replace(/\D/g,'');return /^\+?[\d\s().-]+$/.test(String(value||''))&&digits.length>=8&&digits.length<=15&&!/^(\d)\1{7,}$/.test(digits);}
function validDob(value){const d=new Date(value);if(!value||Number.isNaN(d.getTime()))return false;const y=d.getUTCFullYear();if(y<1950)return false;const now=new Date();let age=now.getUTCFullYear()-y;const md=now.getUTCMonth()-d.getUTCMonth();if(md<0||(md===0&&now.getUTCDate()<d.getUTCDate()))age--;return age>=18&&d<=now;}
function serviceHeaders(env){return {apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`};}
function validateUpload(file,imageOnly=false){return file instanceof File&&file.size>0&&file.size<=MAX_FILE&&(imageOnly?IMAGE_TYPES:FILE_TYPES).has(file.type);}

async function sendRegistrationTelegram(env,application,form,request){
  if(!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_CHAT_ID)return;
  const origin=new URL(request.url).origin;
  const crmUrl=`${origin}/admin/?application=${encodeURIComponent(application.id)}`;
  const text=[
    '<b>🪐 COSMO — НОВАЯ ПОЛНАЯ РЕГИСТРАЦИЯ</b>',
    '',
    `ID: <code>${esc(application.id)}</code>`,
    `Имя: <b>${esc(form.full_name)}</b>`,
    `Дата рождения: ${esc(form.date_of_birth)}`,
    `Телефон: ${esc(form.phone)}`,
    `Telegram: ${esc(form.telegram||'—')}`,
    `Email: ${esc(form.email)}`,
    `Страна / город: ${esc(form.country)} / ${esc(form.city)}`,
    `Языки: ${esc(form.languages||'—')}`,
    `График: ${esc(form.schedule||'—')}`,
    `Опыт: ${esc(form.experience||'—')}`,
    `Документ: <b>${esc(form.document_type)}</b>`,
    'Статус: <b>REVIEW</b>',
    '',
    '🔐 Документы доступны только в защищённой COSMO CRM.'
  ].join('\n');
  const response=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      chat_id:env.TELEGRAM_CHAT_ID,
      text,
      parse_mode:'HTML',
      disable_web_page_preview:true,
      reply_markup:{inline_keyboard:[[{text:'Открыть заявку в COSMO CRM ↗',url:crmUrl}]]}
    })
  });
  if(!response.ok)console.error('Telegram registration alert failed',response.status);
}

async function createOrRecoverUser(env,email,password,metadata){
  const headers={...serviceHeaders(env),'content-type':'application/json'};
  const create=await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`,{method:'POST',headers,body:JSON.stringify({email,password,email_confirm:true,user_metadata:metadata})});
  const createdBody=await create.json().catch(()=>({}));
  if(create.ok)return {user:createdBody,created:true};

  const code=createdBody.code||createdBody.error_code||'';
  const message=String(createdBody.message||createdBody.msg||'');
  if(code!=='email_exists'&&!/already|registered|exists/i.test(message))throw new Error(message||'unable_to_create_account');

  const login=await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,'content-type':'application/json'},body:JSON.stringify({email,password})});
  const loginBody=await login.json().catch(()=>({}));
  if(!login.ok||!loginBody.user?.id)throw new Error('email_already_registered');

  const existing=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?user_id=eq.${encodeURIComponent(loginBody.user.id)}&select=id&limit=1`,{headers:serviceHeaders(env)});
  const rows=await existing.json().catch(()=>[]);
  if(Array.isArray(rows)&&rows.length)throw new Error('email_already_registered');
  return {user:loginBody.user,created:false};
}

async function deleteFreshUser(env,userId){
  try{await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(userId)}`,{method:'DELETE',headers:serviceHeaders(env)});}catch(error){console.error('Unable to cleanup auth user',error);}
}

async function uploadFile(env,userId,label,file,imageOnly=false){
  if(!validateUpload(file,imageOnly))throw new Error(`invalid_${label}_file`);
  const ext=file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g,'').toLowerCase()||'bin';
  const path=`${userId}/${label}-${crypto.randomUUID()}.${ext}`;
  const response=await fetch(`${env.SUPABASE_URL}/storage/v1/object/cosmo-kyc-documents/${path}`,{
    method:'POST',headers:{...serviceHeaders(env),'content-type':file.type,'x-upsert':'false'},body:await file.arrayBuffer()
  });
  if(!response.ok)throw new Error(`unable_to_upload_${label}`);
  return path;
}

async function register(request,env){
  if(!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return json({error:'server_not_configured'},500);
  const data=await request.formData();
  const form={
    email:String(data.get('email')||'').trim().toLowerCase(),password:String(data.get('password')||''),full_name:String(data.get('full_name')||'').trim(),date_of_birth:String(data.get('date_of_birth')||''),phone:String(data.get('phone')||'').trim(),telegram:String(data.get('telegram')||'').trim(),country:String(data.get('country')||'').trim(),city:String(data.get('city')||'').trim(),experience:String(data.get('experience')||'').trim().slice(0,1000),schedule:String(data.get('schedule')||'').trim().slice(0,160),languages:String(data.get('languages')||'').trim().slice(0,160),document_type:String(data.get('document_type')||'id_card'),locale:String(data.get('locale')||'ru')
  };
  if(!NAME_RE.test(form.full_name)||form.full_name.split(/\s+/).length<2)return json({error:'invalid_name'},400);
  if(!validDob(form.date_of_birth))return json({error:'invalid_date_of_birth_or_underage'},400);
  if(!validPhone(form.phone))return json({error:'invalid_phone'},400);
  if(form.telegram&&!TG_RE.test(form.telegram))return json({error:'invalid_telegram'},400);
  if(form.country.length<2||form.city.length<2)return json({error:'invalid_location'},400);
  if(!EMAIL_RE.test(form.email))return json({error:'invalid_email'},400);
  if(form.password.length<8)return json({error:'weak_password'},400);
  if(!DOCUMENT_TYPES.has(form.document_type))return json({error:'invalid_document_type'},400);

  const front=data.get('document_front');
  const back=data.get('document_back');
  const selfie=data.get('document_selfie');
  const codeword=data.get('document_codeword_selfie');
  if(!validateUpload(front))return json({error:'document_front_required'},400);
  if(form.document_type!=='foreign_passport'&&!validateUpload(back))return json({error:'document_back_required'},400);
  if(!validateUpload(selfie,true))return json({error:'document_selfie_required'},400);
  if(!validateUpload(codeword,true))return json({error:'document_codeword_selfie_required'},400);

  let auth=null;
  try{
    auth=await createOrRecoverUser(env,form.email,form.password,{full_name:form.full_name,phone:form.phone});
    const frontPath=await uploadFile(env,auth.user.id,'front',front);
    const backPath=form.document_type==='foreign_passport'?null:await uploadFile(env,auth.user.id,'back',back);
    const selfiePath=await uploadFile(env,auth.user.id,'selfie',selfie,true);
    const codewordPath=await uploadFile(env,auth.user.id,'cosmo-codeword',codeword,true);

    const row={user_id:auth.user.id,status:'review',locale:['ru','ua','en'].includes(form.locale)?form.locale:'ru',full_name:form.full_name,date_of_birth:form.date_of_birth,phone:form.phone,telegram:form.telegram,email:form.email,country:form.country,city:form.city,experience:form.experience,schedule:form.schedule,languages:form.languages,document_type:form.document_type,document_front_path:frontPath,document_back_path:backPath,document_selfie_path:selfiePath,document_codeword_selfie_path:codewordPath,consent_at:new Date().toISOString()};
    const insert=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications`,{method:'POST',headers:{...serviceHeaders(env),'content-type':'application/json',Prefer:'return=representation'},body:JSON.stringify(row)});
    const rows=await insert.json().catch(()=>[]);
    if(!insert.ok)throw new Error(rows?.message||rows?.[0]?.message||'unable_to_save_application');
    const application=rows[0];
    await sendRegistrationTelegram(env,application,form,request).catch(error=>console.error(error));
    return json({ok:true,application_id:application.id,status:application.status});
  }catch(error){
    console.error('Registration failed',error);
    if(auth?.created&&auth.user?.id)await deleteFreshUser(env,auth.user.id);
    const code=String(error?.message||'registration_failed');
    return json({error:code},code==='email_already_registered'?409:400);
  }
}

async function openCodewordPhoto(request,env){
  const key=request.headers.get('x-admin-key');
  if(!env.ADMIN_ACCESS_KEY||key!==env.ADMIN_ACCESS_KEY)return json({error:'unauthorized'},401);
  const id=new URL(request.url).searchParams.get('id');
  if(!id||!/^[0-9a-f-]{36}$/i.test(id))return json({error:'invalid_id'},400);
  const lookup=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?id=eq.${encodeURIComponent(id)}&select=document_codeword_selfie_path&limit=1`,{headers:serviceHeaders(env)});
  const rows=await lookup.json().catch(()=>[]);
  const path=rows?.[0]?.document_codeword_selfie_path;
  if(!path)return json({error:'document_not_found'},404);
  const response=await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/cosmo-kyc-documents/${encodeURI(path)}`,{headers:serviceHeaders(env)});
  if(!response.ok)return json({error:'document_not_found'},404);
  const headers=new Headers(response.headers);headers.set('cache-control','no-store, private');headers.set('content-security-policy',"default-src 'none'");
  return new Response(response.body,{status:200,headers});
}

export default {async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='POST'&&url.pathname==='/api/register')return register(request,env);
  if(request.method==='GET'&&url.pathname==='/api/admin/document-codeword')return openCodewordPhoto(request,env);
  return baseWorker.fetch(request,env);
}};

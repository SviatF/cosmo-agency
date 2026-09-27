import baseWorker from './base.js';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8'}});
const IMAGE_TYPES=new Set(['image/jpeg','image/png','image/webp']);

async function saveCodewordPhoto(request,env){
  const copy=request.clone();
  const form=await copy.formData();
  const photo=form.get('document_codeword_selfie');
  if(!(photo instanceof File)||!photo.size)return json({error:'document_codeword_selfie_required'},400);
  if(photo.size>8*1024*1024)return json({error:'document_file_too_large'},400);
  if(!IMAGE_TYPES.has(photo.type))return json({error:'unsupported_document_format'},400);

  const response=await baseWorker.fetch(request,env);
  if(!response.ok)return response;
  const body=await response.clone().json().catch(()=>null);
  if(!body?.application_id)return response;

  const path=`${body.application_id}/cosmo-codeword`;
  const upload=await fetch(`${env.SUPABASE_URL}/storage/v1/object/cosmo-kyc-documents/${path}`,{
    method:'POST',
    headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':photo.type,'x-upsert':'true'},
    body:await photo.arrayBuffer(),
  });
  if(!upload.ok)return json({error:'unable_to_upload_codeword_photo'},500);

  const patch=await fetch(`${env.SUPABASE_URL}/rest/v1/cosmo_applications?id=eq.${encodeURIComponent(body.application_id)}`,{
    method:'PATCH',
    headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'content-type':'application/json',Prefer:'return=minimal'},
    body:JSON.stringify({document_codeword_selfie_path:path}),
  });
  if(!patch.ok)return json({error:'unable_to_save_codeword_photo'},500);
  return response;
}

async function openCodewordPhoto(request,env){
  const key=request.headers.get('x-admin-key');
  if(!env.ADMIN_ACCESS_KEY||key!==env.ADMIN_ACCESS_KEY)return json({error:'unauthorized'},401);
  const id=new URL(request.url).searchParams.get('id');
  if(!id||!/^[0-9a-f-]{36}$/i.test(id))return json({error:'invalid_id'},400);
  const path=`${id}/cosmo-codeword`;
  const response=await fetch(`${env.SUPABASE_URL}/storage/v1/object/authenticated/cosmo-kyc-documents/${path}`,{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`}});
  if(!response.ok)return json({error:'document_not_found'},404);
  const headers=new Headers(response.headers);headers.set('cache-control','no-store, private');headers.set('content-security-policy',"default-src 'none'");
  return new Response(response.body,{status:200,headers});
}

export default {async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==='POST'&&url.pathname==='/api/register')return saveCodewordPhoto(request,env);
  if(request.method==='GET'&&url.pathname==='/api/admin/document-codeword')return openCodewordPhoto(request,env);
  return baseWorker.fetch(request,env);
}};

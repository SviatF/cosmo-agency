alter table public.cosmo_applications
  add column if not exists document_codeword_selfie_path text;

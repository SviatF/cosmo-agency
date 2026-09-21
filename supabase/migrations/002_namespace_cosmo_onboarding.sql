alter table if exists public.applications rename to cosmo_applications;

update storage.buckets
set id = 'cosmo-kyc-documents', name = 'cosmo-kyc-documents'
where id = 'kyc-documents';

alter index if exists applications_status_idx rename to cosmo_applications_status_idx;
alter index if exists applications_created_at_idx rename to cosmo_applications_created_at_idx;

alter trigger applications_set_updated_at on public.cosmo_applications
rename to cosmo_applications_set_updated_at;

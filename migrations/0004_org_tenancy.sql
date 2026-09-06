-- Multi-tenant authorization: platform admins stay in admin_users;
-- organization members are seeded from existing admins. Additive only.

update admin_users
set role = 'platform_admin'
where role is null or role = '' or role = 'admin';

insert into organization_members (organization_id, user_id, role)
select o.id, a.user_id, 'owner'
from admin_users a
join organizations o on o.slug = 'navi-zindagi-foundation'
where exists (select 1 from "user" u where u.id = a.user_id)
on conflict (organization_id, user_id) do nothing;

alter table volunteers add column if not exists organization_id integer references organizations(id);
alter table contact_enquiries add column if not exists organization_id integer references organizations(id);

update volunteers
set organization_id = (select id from organizations where slug = 'navi-zindagi-foundation' limit 1)
where organization_id is null;

update contact_enquiries
set organization_id = (select id from organizations where slug = 'navi-zindagi-foundation' limit 1)
where organization_id is null;

create index if not exists volunteers_organization_idx on volunteers (organization_id);
create index if not exists contact_enquiries_organization_idx on contact_enquiries (organization_id);

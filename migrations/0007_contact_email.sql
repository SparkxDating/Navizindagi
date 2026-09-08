-- Update published NGO email. Additive; existing settings row is required.

update ngo_settings
set email = 'navizindagidelhi@gmail.com',
    updated_at = now()
where id = 1;

update organizations
set email = 'navizindagidelhi@gmail.com',
    updated_at = now()
where slug = 'navi-zindagi-foundation';

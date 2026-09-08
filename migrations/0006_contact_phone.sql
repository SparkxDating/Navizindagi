-- Update published NGO contact number. Additive; existing settings row is required.

update ngo_settings
set phone = '+91 85956 12015',
    whatsapp = '+91 85956 12015',
    updated_at = now()
where id = 1;

update organizations
set phone = '+91 85956 12015',
    updated_at = now()
where slug = 'navi-zindagi-foundation';

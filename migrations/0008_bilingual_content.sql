-- Additive bilingual public-content fields. Existing English values are unchanged.
-- Donation, payment, webhook, and auth tables are not modified.

alter table campaigns add column if not exists title_hi text;
alter table campaigns add column if not exists short_description_hi text;
alter table campaigns add column if not exists situation_text_hi text;
alter table campaigns add column if not exists mission_text_hi text;
alter table campaigns add column if not exists relief_priorities_hi text;
alter table campaigns add column if not exists utilisation_notes_hi text;

alter table faqs add column if not exists question_hi text;
alter table faqs add column if not exists answer_hi text;

alter table campaign_updates add column if not exists title_hi text;
alter table campaign_updates add column if not exists body_hi text;

alter table team_members add column if not exists role_hi text;
alter table team_members add column if not exists bio_hi text;

alter table ngo_settings add column if not exists tagline_hi text;
alter table ngo_settings add column if not exists about_text_hi text;
alter table ngo_settings add column if not exists mission_hi text;
alter table ngo_settings add column if not exists vision_hi text;
alter table ngo_settings add column if not exists values_text_hi text;
alter table ngo_settings add column if not exists areas_of_work_hi text;
alter table ngo_settings add column if not exists registration_notes_hi text;
alter table ngo_settings add column if not exists how_donations_used_hi text;
alter table ngo_settings add column if not exists payment_info_hi text;

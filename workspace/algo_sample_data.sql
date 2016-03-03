--
--
--
-- echo "drop database if exists fsb" | mysqlc; cat ./workspace/database_init.sql | mysqlc; (echo "use fsb;" && cat ./workspace/algo_schema.sql) | mysqlc;
--

set @now = 1456905600;

insert into candidates (name, linkedin_profile_link, visible, created, updated) values
('Esteban Uribe', 'https://www.linkedin.com/in/estebanuribe', 1, @now, @now),
('Michael Murray', 'https://www.linkedin.com/in/mikebrianmurray', 1, @now, @now),
('Jamie Scanlon', 'https://www.linkedin.com/in/jamiescanlon', 1, @now, @now),
('Warren Dodge', 'https://www.linkedin.com/in/wdodge', 1, @now, @now),
('Jeremy Nelson', 'https://www.linkedin.com/in/jlnelson19', 1, @now, @now),
('Robert Joynt', 'https://www.linkedin.com/in/rjoynt', 1, @now, @now),
('Nathan Nakao', 'https://www.linkedin.com/in/nathannakao', 1, @now, @now),
('Yariv Nissim', 'https://www.linkedin.com/in/yarivnis', 1, @now, @now),
('Gustavo Halperin', 'https://www.linkedin.com/in/gustavohalperin', 1, @now, @now),
('Steve Saxon', 'https://www.linkedin.com/in/xmlguy', 1, @now, @now),
('Kamil Mroczek', 'https://www.linkedin.com/in/kamilmroczek', 1, @now, @now)
;


insert into roles (name, parent_role_id, created) values
('iOS Developer', null, @now)
;


insert into candidate_roles (candidate_id, role_id, created) values
(1, 1, @now),
(2, 1, @now),
(3, 1, @now),
(4, 1, @now),
(5, 1, @now),
(6, 1, @now),
(7, 1, @now),
(8, 1, @now),
(9, 1, @now),
(10, 1, @now),
(11, 1, @now)
;


insert into skills (name, type, created) values
('Fluent English', 'language', @now),
('Fluent Spanish', 'language', @now),
('C++', null, @now),
('Objective C', null, @now),
('Swift', null, @now)
;


-- iOS Skill Fundamentals: Objective C, Swift
insert into role_skill_fundamentals (role_id, skill_id, created) values
(1, 4, @now),
(1, 5, @now)
;


-- Fluent English
insert into candidate_skills (candidate_id, skill_id, created) values
(1, 1, @now),
(2, 1, @now),
(3, 1, @now),
(4, 1, @now),
(5, 1, @now),
(6, 1, @now),
-- (7, 1, @now), -- Nathan does not speak fluent English
(8, 1, @now),
(9, 1, @now),
(10, 1, @now),
(11, 1, @now)
;


-- iOS Skill Fundamentals: Objective C, Swift
insert into candidate_skills (candidate_id, skill_id, created) values
(1, 4, @now), -- (1, 5, @now),
(2, 4, @now), (2, 5, @now),
-- (3, 4, @now), (3, 5, @now),
(4, 4, @now), (4, 5, @now),
(5, 4, @now), (5, 5, @now),
(6, 4, @now), -- (6, 5, @now),
(7, 4, @now), -- (7, 5, @now),
(8, 4, @now), (8, 5, @now),
(9, 4, @now), -- (9, 5, @now),
(10, 4, @now), (10, 5, @now),
(11, 4, @now), (11, 5, @now)
;


insert into companies (name, rating, venture_funded, created, updated) values
('Tinder', 40, 1, @now, @now),
('Snapchat', 50, 1, @now, @now),
('Evite', 60, 1, @now, @now),
('Wag! Labs', 60, 1, @now, @now),
('Okta, Inc.', 50, 1, @now, @now),
('TSI VA', null, 0, @now, @now),
('TrueCar', 90, 1, @now, @now),
('Joya', null, 0, @now, @now),
('Amazon', 100, 0, @now, @now),
('Sense360', null, 1, @now, @now),
('Cerrell Associates', null, null, @now, @now),
('GonnaBe', 30, null, @now, @now),
('Hey Daddio!', 50, null, @now, @now),
('GameChanger Labs', 60, null, @now, @now),
('Amgen', 25, null, @now, @now),
('US Renel Care', 10, null, @now, @now),
('The Omega Group, Inc.', 20, 0, @now, @now),
('Starmount', 70, 0, @now, @now),
('Neudesic', 65, 0, @now, @now),
('Thinknear by Telenav', 55, null, @now, @now)
;


insert into misc_company_facts (name, display_name, description, created, updated) values
('builtinla_top_100_tech', 'BuiltInLA Top 100 Tech Companies', 'Featured in http://www.builtinla.com/2015/08/05/top-100-tech-companies-la', @now, @now)
;


insert into misc_company_fact_companies (misc_company_fact_id, company_id, created) values
(1, 1, @now), -- Tinder
(1, 2, @now), -- Snapchat
(1, 17, @now) -- The Omega Group, Inc.
;


insert into work_history_items (candidate_id, start_time, end_time, company_id, location_id, title, created, updated) values
(1, 1351728000, null, null, null, 'iOS Developer', @now, @now),
(2, 1351728000, null, null, null, 'App Developer', @now, @now),
(3, 1351728000, null, null, null, 'Lead App Engineer', @now, @now),
(4, 1351728000, 1454198400, null, null, 'iOS Developer', @now, @now),
(5, 1351728000, 1454198400, null, null, 'iOS Developer', @now, @now),
(6, 1433116800, 1454198400, null, null, 'iOS Developer', @now, @now),
(7, 1433116800, 1454198400, null, null, 'iOS Developer', @now, @now),
(8, 1351728000, 1454198400, null, null, 'iOS Developer', @now, @now),
(9, 1351728000, 1454198400, null, null, 'iOS Developer', @now, @now),
(10, 1433116800, 1454198400, null, null, 'Lead iOS Developer', @now, @now),
(11, 1433116800, 1454198400, null, null, 'App Developer', @now, @now)
;

insert into work_history_item_roles (work_history_item_id, role_id, created) values
(1, 1, @now),
(2, 1, @now),
(3, 1, @now),
(4, 1, @now),
(5, 1, @now),
(6, 1, @now),
(7, 1, @now),
(8, 1, @now),
(9, 1, @now),
(10, 1, @now),
(11, 1, @now)
;


insert into misc_role_facts (name, display_name, description, created, updated) values
('worked_apps_volume_100k', 'High Volume Apps', 'Worked on iOS apps with over 100k MAU', @now, @now),
('produced_content', 'Produced Content', '', @now, @now),
('produced_content_leader', 'Produced Content - Leader', '', @now, @now)
;


insert into misc_role_fact_roles (misc_role_fact_id, role_id, created) values
(1, 1, @now)
;


insert into candidate_misc_role_facts (candidate_id, misc_role_fact_id, created) values
-- BEGIN worked_apps_volume_100k
(1, 1, @now),
(2, 1, @now),
-- (3, 1, @now),
(4, 1, @now),
-- (5, 1, @now),
-- (6, 1, @now),
-- (7, 1, @now),
(8, 1, @now),
-- (9, 1, @now),
(10, 1, @now),
(11, 1, @now),
-- END worked_apps_volume_100k

-- BEGIN produced_content
(8, 2, @now)
-- END produced_content
;


insert into education_institutions (name, rating, location_id, created, updated) values
('California State University, Long Beach', null, null, @now, @now),
('University of California, Los Angeles', null, null, @now, @now)
;


insert into degree_types (name, field, created) values
('Bachelor of Science', 'Computer Science', @now),
('Bachelor of Science', 'Other', @now)
;


insert into education_history_items (candidate_id, start_time, end_time, education_institution_id, degree_type_id, created, updated) values
(1, 1122854400, 1272672000, 1, 1, @now, @now),
(2, 1122854400, 1272672000, 1, 1, @now, @now),
(3, 1122854400, 1272672000, 1, 2, @now, @now),
(4, 1122854400, 1272672000, 1, 1, @now, @now),
(5, 1122854400, 1272672000, 1, 1, @now, @now),
(6, 1122854400, 1272672000, 1, 2, @now, @now),
(7, 1122854400, 1272672000, 2, 1, @now, @now),
(8, 1122854400, 1272672000, 2, 1, @now, @now),
(9, 1122854400, 1272672000, 2, 2, @now, @now),
-- (10, 1122854400, 1272672000, 2, 2, @now, @now), -- No college degree for Steven Saxon
(11, 1122854400, 1272672000, 2, 1, @now, @now)
;


-- Match these with education_history_items.degree_type_id above for readability. Though they don't need to match.
insert into education_history_item_roles (education_history_item_id, role_id, created) values
(1, 1, @now),
(2, 1, @now),
-- (3, 1, @now),
(4, 1, @now),
(5, 1, @now),
-- (6, 1, @now),
(7, 1, @now),
(8, 1, @now),
-- (9, 1, @now),
-- (10, 1, @now),
(10, 1, @now) -- Not 11 cuz we didnt add a college degree for Steven Saxon
;



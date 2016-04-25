--
--
--
-- (echo "drop database if exists fsb;" && cat ./workspace/database_init.sql && echo "use fsb;" && cat ./workspace/algo_schema.sql && cat ./workspace/algo_sample_data.sql) | mysqlc
-- node algo/bin/score_candidates.js; node algo/bin/rank_role.js --role_id=1;
--

set @now = 1456905600;

insert into candidates (name, linkedin_profile_id, primary_email, linkedin_img_url, visible, created, updated) values
('Esteban Uribe', 'estebanuribe', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/000/235/389/0eee165.jpg', 1, @now, @now),
('Michael Murray', 'mikebrianmurray', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/000/229/335/35450a0.jpg', 1, @now, @now),
('Jamie Scanlon', 'jamiescanlon', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/000/0bd/2c1/318c9ee.jpg', 1, @now, @now),
('Warren Dodge', 'wdodge', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/3/000/00b/39b/0e6e8f7.jpg', 1, @now, @now),
('Jeremy Nelson', 'jlnelson19', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/005/019/3a4/1dfb0c2.jpg', 1, @now, @now),
('Robert Joynt', 'rjoynt', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/AAEAAQAAAAAAAANtAAAAJDc0ODA2OWFiLWQyOTItNDg4Ny1hMjEwLTA5MTQ0ZDdjZWQ1Mg.jpg', 1, @now, @now),
('Nathan Nakao', 'nathannakao', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/7/005/088/2b9/16f1db3.jpg', 1, @now, @now),
('Yariv Nissim', 'yarivnis', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/2/000/0e1/11e/0fa349a.jpg', 1, @now, @now),
('Gustavo Halperin', 'gustavohalperin', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/5/005/03f/208/34c8700.jpg', 1, @now, @now),
('Steve Saxon', 'xmlguy', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/000/033/278/25ad146.jpg', 1, @now, @now),
('Kamil Mroczek', 'kamilmroczek', null, 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/6/005/09a/337/1dbc47f.jpg', 1, @now, @now)
;


insert into roles (name, display_name, parent_role_id, visible, created) values
('ios-developer', 'iOS Developer', null, 1, @now)
,('recruiter', 'Recruiter', null, 1, @now)
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


insert into skills (name, type, display_name, display_order, visible, created) values
('fluent_english', 'language', 'Fluent English', 100, 1, @now),
('fluent_spanish', 'language', 'Fluent Spanish', 100, 1, @now),
('c++', null, 'C++', 0, 1, @now),
('objective_c', null, 'Objective C', 0, 1, @now),
('swift', null, 'Swift', 0, 1, @now)
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


insert into companies (name, display_name, rating, venture_funded, created, updated) values
('tinder', 'Tinder', 40, 1, @now, @now),
('snapchat', 'Snapchat', 50, 1, @now, @now),
('evite', 'Evite', 60, 1, @now, @now),
('wag-labs', 'Wag! Labs', 60, 1, @now, @now),
('okta-inc', 'Okta, Inc.', 50, 1, @now, @now),
('tsi-va', 'TSI VA', null, 0, @now, @now),
('truecar', 'TrueCar', 90, 1, @now, @now),
('joya', 'Joya', null, 0, @now, @now),
('amazon', 'Amazon', 100, 0, @now, @now),
('sense360', 'Sense360', null, 1, @now, @now),
('cerell-associates', 'Cerrell Associates', null, null, @now, @now),
('gonnabe', 'GonnaBe', 30, null, @now, @now),
('hey-daddio', 'Hey Daddio!', 50, null, @now, @now),
('gamechanger-labs', 'GameChanger Labs', 60, null, @now, @now),
('amgen', 'Amgen', 25, null, @now, @now),
('us-renel-care', 'US Renel Care', 10, null, @now, @now),
('the-omega-group-inc', 'The Omega Group, Inc.', 20, 0, @now, @now),
('starmount', 'Starmount', 70, 0, @now, @now),
('neudesic', 'Neudesic', 65, 0, @now, @now),
('thinknear-by-telenav', 'Thinknear by Telenav', 55, null, @now, @now)
;


insert into misc_company_facts (name, display_name, description, created, updated) values
('builtinla_top_100_tech', 'BuiltInLA Top 100 Tech Companies', 'Featured in http://www.builtinla.com/2015/08/05/top-100-tech-companies-la', @now, @now)
;


insert into misc_company_fact_companies (misc_company_fact_id, company_id, created) values
(1, 1, @now), -- Tinder
(1, 2, @now), -- Snapchat
(1, 17, @now) -- The Omega Group, Inc.
;


insert into executives (name, linkedin_profile_id, rating, created, updated) values
('Ryan Ogle', 'rogle', 50, @now, @now),
('Bobby Murphy', 'burphy', 30, @now, @now),
('Perry Evoniuk', 'pevno', 20, @now, @now),
('Ryan Ogle', 'rogle22', 60, @now, @now),
('Hector Aguilar', 'haguilar', 60, @now, @now),
('Oded Noy', 'odednoy', 10, @now, @now),
('Werner Hans Peter Vogels', 'hansvogels', 100, @now, @now),
('Kamil Mroczek', 'kamercek', 50, @now, @now)
;


insert into work_history_items (candidate_id, start_time, end_time, company_id, executive_id, location_id, title, description, created, updated) values
(1, 1351728000, null, 1, 1, null, 'iOS Developer', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nulla ipsum, aliquet sit amet sapien a, mattis placerat leo. Vestibulum accumsan urna sed dui dictum, ut feugiat leo vulputate. Sed et condimentum tellus, quis tincidunt urna. Duis scelerisque non sapien eget malesuada.', @now, @now), -- Esteban Uribe, Tinder, Ryan Ogle
(2, 1351728000, null, 2, 2, null, 'App Developer', 'Praesent dignissim urna sapien, nec semper leo ultrices in. Duis interdum nisi nec nunc ultricies pretium.', @now, @now), -- Michael Murray, Snapchat, Bobby Murphy
(3, 1351728000, null, 3, 3, null, 'Lead App Engineer', 'Ut dictum orci nec nulla pharetra, eu porta velit varius. Sed auctor mauris lorem, eu lacinia lectus eleifend ut.', @now, @now), -- Jamie Scanlon, Evite, Perry Evoniuk
(4, 1351728000, null, 1, 1, null, 'iOS Developer', 'Mauris odio urna, sodales sit amet mauris ut, blandit tincidunt enim. Duis sit amet lacus vitae dolor commodo rutrum eleifend porttitor est. Morbi sed vulputate sapien.', @now, @now), -- Warren Dodge, Tinder, Ryan Ogle
(5, 1351728000, null, 4, null, null, 'iOS Developer', 'Sed luctus urna augue, ut condimentum leo elementum ac. Cras sagittis nibh tempor accumsan tempus. Maecenas aliquet auctor risus nec fringilla. Duis at mi massa. Nullam sed arcu neque.', @now, @now), -- Jeremy Nelson, Wag! Labs, ???
(6, 1433116800, null, 5, 4, null, 'iOS Developer', 'Ut tristique turpis ipsum, eu viverra diam imperdiet eget. Cras nec ultrices magna. Vivamus sed massa nec risus viverra egestas. Nunc posuere lorem et malesuada sodales.', @now, @now), -- Robert Joynt, Okta, Inc., Hector Aguilar
(7, 1433116800, null, 6, null, null, 'iOS Developer', 'Sed auctor ac quam sed molestie. Duis suscipit ligula sed volutpat hendrerit. Aliquam sodales erat eget volutpat tincidunt. Donec scelerisque odio et congue placerat.', @now, @now), -- Nathan Nakao, TSI VA
(8, 1351728000, null, 7, 5, null, 'iOS Developer', 'Praesent hendrerit, ipsum sit amet malesuada lobortis, ante est volutpat velit, vel tempor orci erat non tellus. Nam nec nunc nec leo imperdiet auctor. Vestibulum quis molestie eros, vitae luctus augue.', @now, @now), -- Yariv Nissim, TrueCar, Oded Noy
(9, 1351728000, null, 8, null, null, 'iOS Developer', 'Maecenas luctus rutrum dui, eget pulvinar dolor faucibus et. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Donec hendrerit augue nibh, nec vestibulum elit tristique et. Aliquam ut aliquam mauris.', @now, @now), -- Gustavo Halperin, Joya
(10, 1433116800, null, 9, 6, null, 'Lead iOS Developer', 'Pellentesque ultrices ex in posuere pretium.', @now, @now), -- Steve Saxon, Amazon, Werner Hans Peter Vogels
(11, 1433116800, null, 10, 7, null, 'App Developer', 'Pellentesque at rhoncus nibh, id vulputate libero. Etiam vitae dapibus ligula, pretium suscipit purus.', @now, @now), -- Kamil Mroczek, Sense360, Kamil Mroczek

(1, 1325376000, 1351728000, 11, null, null, 'iOS Developer', '', @now, @now), -- Esteban Uribe, Cerrell Associates
(2, 1325376000, 1351728000, 12, null, null, 'App Developer', '', @now, @now), -- Michael Murray, GonnaBe
(3, 1325376000, 1351728000, 7, null, null, 'Lead App Engineer', '', @now, @now), -- Jamie Scanlon, TrueCar
(4, 1325376000, 1351728000, 13, null, null, 'iOS Developer', '', @now, @now), -- Warren Dodge, Hey Daddio!
(5, 1325376000, 1351728000, 14, null, null, 'iOS Developer', '', @now, @now), -- Jeremy Nelson, GameChanger Labs
(6, 1420070400, 1433116800, 15, null, null, 'iOS Developer', '', @now, @now), -- Robert Joynt, Amgen
(7, 1420070400, 1433116800, 16, null, null, 'iOS Developer', '', @now, @now), -- Nathan Nakao, US Renel Care
(8, 1325376000, 1351728000, 17, null, null, 'iOS Developer', '', @now, @now), -- Yariv Nissim, The Omega Group, Inc.
(9, 1325376000, 1351728000, 18, null, null, 'iOS Developer', '', @now, @now), -- Gustavo Halperin, Starmount
(10, 1420070400, 1433116800, 19, null, null, 'Lead iOS Developer', '', @now, @now), -- Steve Saxon, Neudesic
(11, 1420070400, 1433116800, 20, null, null, 'App Developer', '', @now, @now) -- Kamil Mroczek, Thinknear by Telenav
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
(11, 1, @now),

(12, 1, @now),
(13, 1, @now),
(14, 1, @now),
(15, 1, @now),
(16, 1, @now),
(17, 1, @now),
(18, 1, @now),
(19, 1, @now),
(20, 1, @now),
(21, 1, @now),
(22, 1, @now)
;


insert into misc_role_facts (name, display_name, description, weight, created, updated) values
('worked_apps_volume_100k', 'High Volume Apps', 'Worked on iOS apps with over 100k MAU', 10, @now, @now),
('produced_content', 'Produced Content', '', 1, @now, @now),
('produced_content_leader', 'Produced Content - Leader', '', 2, @now, @now)
;


-- apply all misc_role_facts to "iOS Developer" Role
insert into misc_role_fact_roles (misc_role_fact_id, role_id, created) values
(1, 1, @now),
(2, 1, @now),
(3, 1, @now)
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


-- BEGIN Scoring

insert into algo_factors (name,display_name,description,weight,visible,display_order,created,updated) values
('language_skills', 'Language Skills', '[ex]Fluent in English[/ex]', 0, 0, 0, @now, @now),
('role_skill_fundamentals', 'Skill Fundamentals', 'Experience with technologies, applications, etc common to the Role [ex]Objective C, Swift, RESTful Apis, XCode, Agile, OOP, ...[/ex]', 40, 1, 100, @now, @now),
('role_experience', 'Years of Work Experience', 'Measure of time working directly within the Role [ex]Years worked as an iOS Developer[/ex]', 15, 1, 101, @now, @now),
('misc_role_facts', 'Role-Specific Achievements', '[ex]Apps in App Store[/ex]', 15, 1, 102, @now, @now),
('basic_education', 'Basic Education', 'Has earned a Bachelor\'s degree or equivalent', 0, 0, 0, @now, @now),
('role_education', 'Role Education', 'Further education specific to the Role [ex]Masters in Computer Science[/ex]', 5, 1, 105, @now, @now),
('current_company', 'Current Company', 'Currently working at a notable company [ex]Apple[/ex]', 10, 1, 103, @now, @now),
('previous_companies', 'Previous Companies', 'Has worked at a notable company in the past [ex]Tinder and Snapchat[/ex]', 10, 1, 104, @now, @now),
('executives', 'Executives', 'Has worked with top-ranktted executives in relation to the Role', 0, 0, 0, @now, @now),
('venture_funded', 'Venture-Funded Experience', 'Intimate with startup work culture', 0, 0, 0, @now, @now),
('misc_company_facts', 'Misc Company Facts', 'Triumphs working at top-ranktted companies. [ex]Worked for company listed in BuiltInLA\'s Top 100 Tech Companies[/ex]', 0, 0, 0, @now, @now)
;

-- END Scoring


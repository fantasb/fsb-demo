--
-- ./hack_reset.sh
--

set @now = 1456905600;


insert into roles (name, display_name, parent_role_id, visible, created) values
('ios-developer', 'iOS Developer', null, 1, @now)
-- ,('recruiter', 'Recruiter', null, 1, @now)
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


insert into degree_types (name, field, created) values
('Bachelor of Science', 'Computer Science', @now),
('Bachelor of Science', 'Other', @now)
;


-- BEGIN Scoring

insert into algo_factors (name,display_name,description,weight,visible,display_order,created,updated) values
('language_skills', 'Language Skills', '[ex]Fluent in English[/ex]', 0, 0, 0, @now, @now),
('role_skill_fundamentals', 'Skill Fundamentals', 'Experience with technologies, applications, etc common to the Role [ex]Objective C, Swift, RESTful Apis, Agile...[/ex]', 40, 1, 100, @now, @now),
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


--
-- See @todo items below
--
-- drop table if exists candidate_role_factor_scores,algo_factors,work_history_item_roles,work_history_items,executives,education_history_item_roles,education_history_items,degree_types,education_institutions,misc_company_fact_companies,misc_company_facts,companies,locations,candidate_misc_role_facts,misc_role_fact_roles,misc_role_facts,candidate_skills,role_skill_fundamentals,skills,candidate_roles,roles,candidates;
--

-- Note: linkedin_profile_id currently being used as primary key
-- @todo: Needs rethinking; what if they don't have linkedin profile?
create table candidates (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,linkedin_profile_id varchar(191) default null
	,linkedin_img_url varchar(191) default null
	,visible tinyint(1) not null default 0
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (linkedin_profile_id)
	,index name_ (name)
	,index visible_ (visible)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table roles (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,display_name varchar(191) not null
	,parent_role_id int unsigned default null -- fk?
	,visible tinyint(1) not null default 0
	,created int not null

	,primary key (id)
	,unique key pk (name)
	,index display_name_ (display_name)
	,index visible_ (visible)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table candidate_roles (
	candidate_id int unsigned not null
	,role_id int unsigned not null
	,created int not null

	,unique key pk (candidate_id,role_id)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table skills (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,type varchar(64) default null
	,display_name varchar(191) not null
	,display_order int unsigned not null default 0
	,visible tinyint(1) not null default 0
	,created int not null

	,primary key (id)
	,unique key pk (name)
	,index type_ (type)
	,index display_name_ (display_name)
	,index display_order_ (display_order)
	,index visible_ (visible)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table role_skill_fundamentals (
	role_id int unsigned not null
	,skill_id int unsigned not null
	,importance_level int unsigned not null default 0
	,created int not null

	,unique key pk (role_id,skill_id)
	,foreign key role_id_fk (role_id) references roles (id)
	,foreign key skill_id_fk (skill_id) references skills (id)
	,index importance_level_ (importance_level)
	,index created_ (created)
	,index cq0 (role_id,importance_level)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table candidate_skills (
	candidate_id int unsigned not null
	,skill_id int unsigned not null
	,created int not null

	,unique key pk (candidate_id,skill_id)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key skill_id_fk (skill_id) references skills (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table misc_role_facts (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,display_name varchar(191) not null
	,description varchar(512) not null default ''
	,weight int unsigned not null default 0
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index display_name_ (display_name)
	,index weight_ (weight)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table misc_role_fact_roles (
	misc_role_fact_id int unsigned not null
	,role_id int unsigned not null
	,created int not null

	,unique key pk (misc_role_fact_id,role_id)
	,foreign key misc_role_fact_id_fk (misc_role_fact_id) references misc_role_facts (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table candidate_misc_role_facts (
	candidate_id int unsigned not null
	,misc_role_fact_id int unsigned not null
	,created int not null

	,unique key pk (candidate_id,misc_role_fact_id)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key misc_role_fact_id_fk (misc_role_fact_id) references misc_role_facts (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- @todo: finish this
-- consider UX use cases
-- use google geocodes to fill lat/lng data?
create table locations (
	id int unsigned auto_increment not null -- bigint?
	,latitude decimal(8,6) not null
	,longitude decimal(9,6) not null
	,country varchar(128) not null
	,state varchar(128) default null
	,county varchar(128) default null
	,city varchar(128) default null

	,primary key (id)
	,index latitude_ (latitude)
	,index longitude_ (longitude)
	,index country_ (country)
	,index state_ (state)
	,index county_ (county)
	,index city_ (city)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- @todo: better pk?
create table companies (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,description varchar(512) not null default ''
	,rating int unsigned default null
	,venture_funded tinyint(1) default null
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table misc_company_facts (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,display_name varchar(191) not null
	,description varchar(512) not null default ''
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index display_name_ (display_name)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table misc_company_fact_companies (
	misc_company_fact_id int unsigned not null
	,company_id int unsigned not null
	,created int not null

	,unique key pk (misc_company_fact_id,company_id)
	,foreign key misc_company_fact_id_fk (misc_company_fact_id) references misc_company_facts (id)
	,foreign key company_id_fk (company_id) references companies (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- @todo: better pk?
create table education_institutions (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,description varchar(512) not null default ''
	,rating int unsigned default null
	,location_id int unsigned default null
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,foreign key location_id_fk (location_id) references locations (id)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- @todo: discuss schema/meta/types
create table degree_types (
	id int unsigned auto_increment not null
	,name varchar(128) not null -- e.g. Bachelor of Science/Arts
	,field varchar(191) default null -- e.g. Computer Science
	,created int not null

	,primary key (id)
	,unique key pk (name,field)
	,index name_ (name)
	,index field_ (field)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table education_history_items (
	id int unsigned auto_increment not null
	,candidate_id int unsigned not null
	,start_time int default null
	,end_time int default null
	,education_institution_id int unsigned default null -- force a college/institution?
	,degree_type_id int unsigned not null
	,description varchar(1024) not null default ''
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (candidate_id,start_time,end_time)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key education_institution_id_fk (education_institution_id) references education_institutions (id)
	,foreign key degree_type_id_fk (degree_type_id) references degree_types (id)
	,index start_time_ (start_time)
	,index end_time_ (end_time)
	
	,index created_ (created)
	,index updated_ (updated)
	,index cq0 (start_time,end_time)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table education_history_item_roles (
	education_history_item_id int unsigned not null
	,role_id int unsigned not null
	,created int not null

	,unique key pk (education_history_item_id,role_id)
	,foreign key education_history_item_id_fk (education_history_item_id) references education_history_items (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- Note: linkedin_profile_id currently being used as primary key
-- @todo: Needs rethinking; what if they don't have linkedin profile?
create table executives (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,linkedin_profile_id varchar(191) not null
	,rating int unsigned default null
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (linkedin_profile_id)
	,index name_ (name)
	,index rating_ (rating)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table work_history_items (
	id int unsigned auto_increment not null
	,candidate_id int unsigned not null
	,start_time int default null
	,end_time int default null
	,company_id int unsigned default null -- force a company?
	,executive_id int unsigned default null -- force a boss?
	,location_id int unsigned default null
	,title varchar(128) not null
	,description varchar(1024) not null default ''
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (candidate_id,start_time,end_time)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key company_id_fk (company_id) references companies (id)
	,foreign key executive_id_fk (executive_id) references executives (id)
	,foreign key location_id_fk (location_id) references locations (id)
	,index start_time_ (start_time)
	,index end_time_ (end_time)
	,index title_ (title)
	,index created_ (created)
	,index updated_ (updated)
	,index cq0 (start_time,end_time)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table work_history_item_roles (
	work_history_item_id int unsigned not null
	,role_id int unsigned not null
	,created int not null

	,unique key pk (work_history_item_id,role_id)
	,foreign key work_history_item_id_fk (work_history_item_id) references work_history_items (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,index created_ (created)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


-- BEGIN Scoring

-- for v0, all factors will apply to all roles
create table algo_factors (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,display_name varchar(191) not null
	,description varchar(512) not null default ''
	,weight int not null default 0
	,display_order int unsigned not null default 0
	,visible tinyint(1) not null default 0
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index display_name_ (display_name)
	,index weight_ (weight)
	,index display_order_ (display_order)
	,index visible_ (visible)
	,index created_ (created)
	,index updated_ (updated)
	,index cq0 (visible,display_order)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table candidate_role_factor_scores (
	candidate_id int unsigned not null
	,role_id int unsigned not null
	,factor_id int unsigned not null
	,score int unsigned not null
	,debug text
	,created int not null
	,updated int not null

	,unique key pk (candidate_id,role_id,factor_id)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,foreign key factor_id_fk (role_id) references algo_factors (id)
	,index score_ (score)
	,index created_ (created)
	,index updated_ (updated)
	,index cq0 (role_id,score)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- END Scoring





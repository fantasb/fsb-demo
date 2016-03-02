--
-- See @todo items below
--
-- drop table if exists work_history_item_roles,work_history_items,education_history_items,degree_types,education_institutions,misc_company_fact_companies,misc_company_facts,companies,locations,candidate_misc_role_facts,misc_role_fact_roles,misc_role_facts,candidate_skills,skills,candidate_roles,roles,candidates;
--

create table candidates (
	id int unsigned auto_increment not null
-- @todo: needs real primary key
	,name varchar(191) not null
	,linkedin_profile_link varchar(191) default null
	,visible tinyint(1) not null default 0
	,created int not null
	,updated int not null

	,primary key (id)
-- ,unique key pk () @todo
	,index name_ (name)
	,index linkedin_profile_link_ (linkedin_profile_link)
	,index visible_ (visible)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table roles (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,parent_role_id int unsigned default null -- fk?
	,created int not null

	,primary key (id)
	,unique key pk (name)
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
	,created int not null

	,primary key (id)
	,unique key pk (name)
	,index type_ (type)
	,index created_ (created)
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
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index display_name_ (display_name)
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
create table locations (
	id int unsigned auto_increment not null -- bigint?
	,latitude decimal(8,6) not null
	,longitude decimal(9,6) not null
	,country varchar(128) not null
	,state varchar(128) default null
	,county varchar(128) default null
	,city varchar(128) default null

	,primary key (id)
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
	,education_institution_id int unsigned default null -- force a company?
	,degree_type_id int unsigned not null
	,role_id int unsigned default null
	,description varchar(1024) not null default ''
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (candidate_id,start_time,end_time)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key education_institution_id_fk (education_institution_id) references education_institutions (id)
	,foreign key degree_type_id_fk (degree_type_id) references degree_types (id)
	,foreign key role_id_fk (role_id) references roles (id)
	,index start_time_ (start_time)
	,index end_time_ (end_time)
	
	,index created_ (created)
	,index updated_ (updated)
	,index cq0 (start_time,end_time)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;


create table work_history_items (
	id int unsigned auto_increment not null
	,candidate_id int unsigned not null
	,start_time int default null
	,end_time int default null
	,company_id int unsigned default null -- force a company?
	,location_id int unsigned default null
	,title varchar(128) not null
	,description varchar(1024) not null default ''
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (candidate_id,start_time,end_time)
	,foreign key candidate_id_fk (candidate_id) references candidates (id)
	,foreign key company_id_fk (company_id) references companies (id)
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








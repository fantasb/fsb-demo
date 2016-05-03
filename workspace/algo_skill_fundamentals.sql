--
-- @todo: Turn this into import script from google drive until Admin finished
--
-- (echo "use fsb;" && cat ./workspace/algo_skill_fundamentals.sql) | mysqlc
--


set @now = unix_timestamp();

insert ignore into role_skill_fundamentals (role_id,skill_id,importance_level,created) values
((select id from roles where name='ios-developer'), (select id from skills where name='swift'), 0, @now),
((select id from roles where name='ios-developer'), (select id from skills where name='objective-c'), 0, @now),
-- ((select id from roles where name='ios-developer'), (select id from skills where name='restful-apis'), 0, @now),
((select id from roles where name='ios-developer'), (select id from skills where name='xcode'), 0, @now),
((select id from roles where name='ios-developer'), (select id from skills where name='agile-methodologies'), 0, @now),
((select id from roles where name='ios-developer'), (select id from skills where name='oop'), 0, @now)
-- ((select id from roles where name='ios-developer'), (select id from skills where name='ios-sdk'), 0, @now),
-- ((select id from roles where name='ios-developer'), (select id from skills where name='multi-threaded-programming'), 0, @now),
-- ((select id from roles where name='ios-developer'), (select id from skills where name='animation-image-frameworks'), 0, @now), -- specifics? e.g. Photoshop, Flash, etc
;

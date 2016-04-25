/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from skills where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Skill with id '+id;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

var getByName = module.exports.getByName = function(name,cb){
	var con = db()
		,q = 'select * from skills where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Skill with name '+name);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,displayName,type,visible,cb){
	visible = visible ? 1 : 0;

	var con = db()
		,q = 'insert into skills (name,display_name,type,visible,created) values (?,?,?,?,?) on duplicate key update display_name=?,type=?,visible=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,type,visible,now,displayName,type,visible]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({ ... });
		getByName(name,cb);
	});
}

module.exports.addCandidateSkill = function(skillId, candidateId, cb){
	var con = db()
		,q = 'insert ignore into candidate_skills (skill_id,candidate_id,created) values (?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [skillId, candidateId, now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,type: null
		,display_name: null
		,display_order: null
		,visible: null
		,created: null
	}, data);
	//dto.id = +dto.id;
	//dto.display_order = +dto.display_order;
	//dto.visible = +dto.visible;
	//dto.created = +dto.created;
	return dto;
}


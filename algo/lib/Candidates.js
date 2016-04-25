/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from candidates where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Candidate with id '+id;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

var getByLinkedInId = module.exports.getByLinkedInId = function(lid,cb){
	var con = db()
		,q = 'select * from candidates where linkedin_profile_id=?'
		,p = [lid]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Candidate with linkedin_profile_id '+lid);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,linkedInId,linkedInImgUrl,primaryEmail,visible,cb){
	visible = visible ? 1 : 0;

	var con = db()
		,q = 'insert into candidates (name,linkedin_profile_id,linkedin_img_url,primary_email,visible,created,updated) values (?,?,?,?,?,?,?) on duplicate key update name=?,linkedin_img_url=?,primary_email=?,visible=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,linkedInId,linkedInImgUrl,primaryEmail,visible,now,now,name,linkedInImgUrl,primaryEmail,visible,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({ ... });
		getByLinkedInId(linkedInId,cb);
	});
}

module.exports.addRole = function(candidateId, roleId, cb){
	var con = db()
		,q = 'insert ignore into candidate_roles (role_id,candidate_id,created) values (?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [roleId, candidateId, now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}

module.exports.addEmail = function(candidateId, email, label, cb){
	var con = db()
		,q = 'insert ignore into candidate_emails (candidate_id,email,label,created) values (?,?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [candidateId, email, label, now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}

module.exports.addMiscRoleFact = function(candidateId, roleFactId, cb){
	var con = db()
		,q = 'insert ignore into candidate_misc_role_facts (candidate_id,misc_role_fact_id,created) values (?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [candidateId, roleFactId, now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}

module.exports.addWorkHistoryItem = function(candidateId, title, description, startTime, endTime, companyId, executiveId, roleId, cb){
	var con = db()
		,q = 'insert into work_history_items (candidate_id,title,description,start_time,end_time,company_id,executive_id,created,updated) values (?,?,?,?,?,?,?,?,?) on duplicate key update title=?,description=?,end_time=?,company_id=?,executive_id=?,updated=?,id=LAST_INSERT_ID(id)'
		,now = Math.floor(Date.now()/1000)
		,p = [candidateId,title,description,startTime,endTime,companyId,executiveId,now,now, title,description,endTime,companyId,executiveId,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}

		if (roleId) {
			con = db()
			q = 'insert ignore into work_history_item_roles (work_history_item_id,role_id,created) values (?,?,?)'
			now = Math.floor(Date.now()/1000)
			p = [data.insertId, roleId, now]
			con.query(q,p,function(err,data){
				con.end();
				cb(err);
			});
		} else {
			cb(false);
		}
	});
}


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,linkedin_profile_id: null
		,linkedin_img_url: null
		,primary_email: null
		,visible: null
		,created: null
		,updated: null
	}, data);
	//dto.id = +dto.id;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}

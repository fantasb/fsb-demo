/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from executives where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Executive with id '+id;
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
		,q = 'select * from executives where linkedin_profile_id=?'
		,p = [lid]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Executive with linkedin_profile_id '+lid);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,linkedInId,cb){
	var con = db()
		,q = 'insert into executives (name,linkedin_profile_id,created,updated) values (?,?,?,?) on duplicate key update name=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,linkedInId,now,now, name,now]
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


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,linkedin_profile_id: null
		,rating: null
		,created: null
		,updated: null
	}, data);
	//dto.id = +dto.id;
	//dto.rating = +dto.rating;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}

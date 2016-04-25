/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from misc_role_facts where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find RoleFact with id '+id);
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
		,q = 'select * from misc_role_facts where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find RoleFact with name '+name);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,displayName,description,weight,cb){
	if (weight === null) weight = 0;

	var con = db()
		,q = 'insert into misc_role_facts (name,display_name,description,weight,created,updated) values (?,?,?,?,?,?) on duplicate key update display_name=?,description=?,weight=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,description,weight,now,now,displayName,description,weight,now]
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


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,display_name: null
		,description: null
		,created: null
		,updated: null
	}, data);
	//dto.id = +dto.id;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}

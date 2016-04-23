/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from misc_company_facts where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find CompanyFact with id '+id;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

var getByName = module.exports.getByName = function(name,cb){
	var con = db()
		,q = 'select * from misc_company_facts where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find CompanyFact with name '+name;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,displayName,description,cb){
	var con = db()
		,q = 'insert into misc_company_facts (name,display_name,description,created,updated) values (?,?,?,?,?) on duplicate key update display_name=?,description=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,description,now,now,displayName,description,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({name:name, display_name:displayName, description:description, updated:now});
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

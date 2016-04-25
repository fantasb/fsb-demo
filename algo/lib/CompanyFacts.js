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
			err = new Error('Cannot find CompanyFact with id '+id);
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
		,q = 'select * from misc_company_facts where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find CompanyFact with name '+name);
			err.code = 404;
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

module.exports.addCompanyFactCompany = function(factId,companyId,cb){
	var con = db()
		,q = 'insert ignore into misc_company_fact_companies (misc_company_fact_id,company_id,created) values (?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [factId, companyId, now]
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
